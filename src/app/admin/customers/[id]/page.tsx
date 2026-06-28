import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { APPOINTMENT_STATUS_LABEL, CONTACT_STATUS_LABEL, formatDateTimeKST } from '@/lib/utils'
import CustomerNoteSection from './CustomerNoteSection'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminCustomerDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: customer },
    { data: appointments },
    { data: contacts },
    { data: notes },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('appointments').select('*').eq('customer_id', id).order('scheduled_at', { ascending: false }),
    supabase.from('contact').select('id, title, status, created_at').eq('customer_id', id).order('created_at', { ascending: false }),
    supabase.from('customer_notes').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
  ])

  if (!customer) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/customers" className="text-gray-500 hover:text-gray-700">←</Link>
        <h1 className="text-2xl font-bold">고객 상세</h1>
      </div>

      {/* 기본 정보 */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold mb-3">기본 정보</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-gray-500">이름</dt><dd className="font-medium">{customer.name ?? '-'}</dd></div>
          <div><dt className="text-gray-500">이메일</dt><dd>{customer.email}</dd></div>
          <div><dt className="text-gray-500">휴대폰</dt><dd>{customer.phone ?? '-'}</dd></div>
          <div><dt className="text-gray-500">가입일</dt><dd>{formatDateTimeKST(customer.created_at)}</dd></div>
        </dl>
      </div>

      {/* 예약 목록 */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold mb-3">예약 내역</h2>
        {!appointments || appointments.length === 0 ? (
          <p className="text-gray-400 text-sm">예약 없음</p>
        ) : (
          <div className="space-y-2">
            {appointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <span>{formatDateTimeKST(apt.scheduled_at)} ({apt.duration}분)</span>
                <span className="text-gray-500">{APPOINTMENT_STATUS_LABEL[apt.status]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 문의 내역 */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold mb-3">문의 내역</h2>
        {!contacts || contacts.length === 0 ? (
          <p className="text-gray-400 text-sm">문의 없음</p>
        ) : (
          <div className="space-y-2">
            {contacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <Link href={`/admin/contact/${c.id}`} className="text-blue-600 underline">{c.title}</Link>
                <span className="text-gray-500">{CONTACT_STATUS_LABEL[c.status]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 내부 메모 */}
      <CustomerNoteSection customerId={id} customerEmail={customer.email} customerPhone={customer.phone} initialNotes={notes ?? []} />
    </div>
  )
}
