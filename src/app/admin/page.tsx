import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalCustomers },
    { count: pendingAppointments },
    { count: openContacts },
    { count: totalAppointments },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'requested'),
    supabase.from('contact').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('appointments').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: '전체 고객', value: totalCustomers ?? 0, href: '/admin/customers', color: 'bg-blue-50 text-blue-700' },
    { label: '대기 중 예약', value: pendingAppointments ?? 0, href: '/admin/appointments', color: 'bg-yellow-50 text-yellow-700' },
    { label: '미답변 문의', value: openContacts ?? 0, href: '/admin/contact', color: 'bg-red-50 text-red-700' },
    { label: '전체 예약', value: totalAppointments ?? 0, href: '/admin/appointments', color: 'bg-green-50 text-green-700' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <a key={s.label} href={s.href} className={`rounded-xl p-6 ${s.color} hover:opacity-90 transition`}>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm mt-1 font-medium">{s.label}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
