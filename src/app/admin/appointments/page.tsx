import { createClient } from '@/lib/supabase/server'
import { APPOINTMENT_STATUS_LABEL, formatDateTimeKST } from '@/lib/utils'
import AppointmentStatusButton from './AppointmentStatusButton'
import type { Appointment, AppointmentStatus } from '@/types/database'

export default async function AdminAppointmentsPage() {
  const supabase = await createClient()
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .order('scheduled_at', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">예약 관리</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">예약 일시</th>
              <th className="text-left px-4 py-3 font-medium">고객 이메일</th>
              <th className="text-left px-4 py-3 font-medium">상태</th>
              <th className="text-left px-4 py-3 font-medium">요청사항</th>
              <th className="px-4 py-3 font-medium">상태 변경</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {appointments?.map((apt: Appointment) => (
              <tr key={apt.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{formatDateTimeKST(apt.scheduled_at)} ({apt.duration}분)</td>
                <td className="px-4 py-3 text-gray-600">{apt.customer_email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    apt.status === 'approved' ? 'bg-green-100 text-green-700' :
                    apt.status === 'requested' ? 'bg-yellow-100 text-yellow-700' :
                    apt.status === 'rejected' || apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {APPOINTMENT_STATUS_LABEL[apt.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{apt.customer_message ?? '-'}</td>
                <td className="px-4 py-3">
                  <AppointmentStatusButton appointmentId={apt.id} currentStatus={apt.status as AppointmentStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!appointments || appointments.length === 0) && (
          <div className="text-center text-gray-400 py-8">예약이 없습니다.</div>
        )}
      </div>
    </div>
  )
}
