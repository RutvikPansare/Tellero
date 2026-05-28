// GET — runs every minute via Vercel Cron
// Processes pending items in automation_queue → sends WhatsApp messages
// This is the engine for Features 6 (COD), 7 (abandoned cart), 8 (order tracking), 9 (reorder)

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  // Verify this request is from Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Fetch pending automations that are due now
  const { data: dueAutomations } = await supabase
    .from('automation_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .limit(50) // max 50/minute to respect Meta rate limits

  if (!dueAutomations?.length) {
    return NextResponse.json({ processed: 0 })
  }

  let processed = 0
  let failed = 0

  for (const automation of dueAutomations) {
    try {
      // Mark as processing immediately to prevent double-processing
      await supabase
        .from('automation_queue')
        .update({ status: 'processing' })
        .eq('id', automation.id)

      // For abandoned_cart: check if customer already purchased
      if (automation.event_type === 'abandoned_cart' && automation.checkout_id) {
        const { data: checkout } = await supabase
          .from('abandoned_checkouts')
          .select('recovered')
          .eq('id', automation.checkout_id)
          .single()

        if (checkout?.recovered) {
          await supabase
            .from('automation_queue')
            .update({ status: 'cancelled' })
            .eq('id', automation.id)
          continue
        }
      }

      // Get brand's WhatsApp credentials from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('waba_id, meta_access_token, whatsapp_number')
        .eq('id', automation.user_id)
        .single()

      if (!profile?.meta_access_token || !profile?.waba_id) {
        throw new Error('User has no WhatsApp connection configured')
      }

      const messageId = await sendWhatsAppTemplate({
        wabaId: profile.waba_id,
        accessToken: profile.meta_access_token,
        to: automation.recipient_phone,
        templateName: getTemplateName(automation.event_type),
        variables: automation.template_variables ?? {},
      })

      await supabase
        .from('automation_queue')
        .update({
          status: 'sent',
          whatsapp_message_id: messageId,
          sent_at: new Date().toISOString(),
        })
        .eq('id', automation.id)

      processed++

    } catch (error) {
      console.error(`[cron] Automation ${automation.id} failed:`, error)

      const newRetryCount = (automation.retry_count ?? 0) + 1
      await supabase
        .from('automation_queue')
        .update({
          status: newRetryCount >= 3 ? 'failed' : 'pending',
          retry_count: newRetryCount,
          error_message: error instanceof Error ? error.message : 'Unknown error',
          scheduled_for: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        })
        .eq('id', automation.id)

      failed++
    }
  }

  return NextResponse.json({ processed, failed })
}

function getTemplateName(eventType: string): string {
  const map: Record<string, string> = {
    cod_confirmation: 'cod_confirmation',
    abandoned_cart: 'abandoned_cart_recovery',
    order_confirmed: 'order_confirmation',
    order_shipped: 'shipping_update',
    order_cancelled: 'order_cancelled',
    reorder_reminder: 'reorder_reminder',
    win_back: 'win_back',
  }
  return map[eventType] ?? eventType
}

async function sendWhatsAppTemplate(params: {
  wabaId: string
  accessToken: string
  to: string
  templateName: string
  variables: Record<string, string>
}): Promise<string> {
  const { wabaId, accessToken, to, templateName, variables } = params

  // Fetch phone number ID from WABA
  const numbersRes = await fetch(
    `https://graph.facebook.com/v19.0/${wabaId}/phone_numbers`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!numbersRes.ok) throw new Error('Failed to fetch WhatsApp phone numbers')
  const numbersData = await numbersRes.json()
  const phoneNumberId = numbersData.data?.[0]?.id
  if (!phoneNumberId) throw new Error('No WhatsApp phone number found for this account')

  const response = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: [{
            type: 'body',
            parameters: Object.values(variables).map(value => ({
              type: 'text',
              text: String(value),
            })),
          }],
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`WhatsApp send failed: ${JSON.stringify(error)}`)
  }

  const data = await response.json()
  return data.messages?.[0]?.id ?? ''
}
