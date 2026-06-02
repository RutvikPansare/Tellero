// GET /api/templates/approved
// Returns all approved templates for the authenticated user.
// Used by client-side template pickers to avoid RLS / browser-client auth issues.

import { NextResponse }       from 'next/server'
import { createClient }       from '@/lib/supabase/server'
import { createAdminClient }  from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('templates')
    .select('id, name, language, body, components, variable_labels')
    .eq('user_id', user.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[templates/approved] query error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ templates: data ?? [] })
}
