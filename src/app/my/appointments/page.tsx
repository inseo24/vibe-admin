import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { APPOINTMENT_STATUS_LABEL, formatDateTimeKST } from '@/lib/utils'
import type { Appointment } from '@/types/database'

export default async function MyAppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, scheduled_at, duration, status, customer_message, admin_message, created_at')
    .eq('customer_id', user.id)
    .order('scheduled_at', { ascending: false })

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">내 예약</h1>
        <Link
          href="/my/appointments/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          예약 요청
        </Link>
      </div>

      {!appointments || appointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          예약 내역이 없습니다.
          <div className="mt-4">
            <Link href="/my/appointments/new" className="text-blue-600 underline text-sm">
              첫 예약을 요청해 보세요
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {(appointments as Appointment[]).map((apt) => (
            <div key={apt.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{formatDateTimeKST(apt.scheduled_at)}</div>
                  <div className="text-sm text-gray-500 mt-1">{apt.duration}분</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  apt.status === 'approved' ? 'bg-green-100 text-green-700' :
                  apt.status === 'requested' ? 'bg-yellow-100 text-yellow-700' :
                  apt.status === 'rejected' || apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {APPOINTMENT_STATUS_LABEL[apt.status]}
                </span>
              </div>
              {apt.customer_message && (
                <p className="text-sm text-gray-600 mt-2 border-t pt-2">
                  요청사항: {apt.customer_message}
                </p>
              )}
              {apt.admin_message && (
                <p className="text-sm text-blue-700 mt-2 bg-blue-50 rounded p-2">
                  관리자 안내: {apt.admin_message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link href="/my" className="text-sm text-gray-500 underline">← 내 정보로</Link>
      </div>
    </main>
  )
}
