import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CONTACT_STATUS_LABEL, formatDateTimeKST } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ContactDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: contact } = await supabase
    .from('contact')
    .select('*')
    .eq('id', id)
    .eq('customer_id', user.id)
    .single()

  if (!contact) notFound()

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/my/contact" className="text-gray-500 hover:text-gray-700">←</Link>
        <h1 className="text-2xl font-bold">문의 상세</h1>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold">{contact.title}</h2>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 shrink-0 ${
            contact.status === 'answered' ? 'bg-green-100 text-green-700' :
            contact.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
            contact.status === 'closed' ? 'bg-gray-100 text-gray-600' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {CONTACT_STATUS_LABEL[contact.status]}
          </span>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap text-sm">{contact.body}</p>
        <p className="text-xs text-gray-400 mt-4">{formatDateTimeKST(contact.created_at)}</p>
      </div>

      {contact.admin_reply ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="text-sm font-semibold text-blue-800 mb-2">관리자 답변</div>
          <p className="text-blue-900 whitespace-pre-wrap text-sm">{contact.admin_reply}</p>
          {contact.answered_at && (
            <p className="text-xs text-blue-400 mt-3">{formatDateTimeKST(contact.answered_at)}</p>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">
          아직 답변이 없습니다.
        </div>
      )}
    </main>
  )
}
