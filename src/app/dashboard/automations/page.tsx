import { redirect } from 'next/navigation'

// /dashboard/automations → redirect to COD (first automation feature)
export default function AutomationsPage() {
  redirect('/dashboard/automations/cod')
}
