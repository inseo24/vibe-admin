import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CONTACT_STATUS_LABEL, formatDateTimeKST } from '@/lib/utils'
import ContactReplyForm from './ContactReplyForm'
import type { ContactStatus } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminContactDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: contact } = await supabase
    .from('contact')
    .select('*')
    .eq('id', id)
    .single()

  if (!contact) notFound()

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/contact" className="text-gray-500 hover:text-gray-700">←</Link>
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
        <dl className="text-sm mb-4 space-y-1">
          <div className="flex gap-2"><dt className="text-gray-500">고객 이메일:</dt><dd>{contact.customer_email}</dd></div>
          {contact.customer_phone && <div className="flex gap-2"><dt className="text-gray-500">휴대폰:</dt><dd>{contact.customer_phone}</dd></div>}
          <div className="flex gap-2"><dt className="text-gray-500">접수일:</dt><dd>{formatDateTimeKST(contact.created_at)}</dd></div>
        </dl>
        <p className="text-gray-700 whitespace-pre-wrap text-sm border-t pt-4">{contact.body}</p>
      </div>

      <ContactReplyForm
        contactId={id}
        currentStatus={contact.status as ContactStatus}
        currentReply={contact.admin_reply}
      />
    </div>
  )
}
