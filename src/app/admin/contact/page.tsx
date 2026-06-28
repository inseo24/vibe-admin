import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CONTACT_STATUS_LABEL, formatDateTimeKST } from '@/lib/utils'
import type { Contact } from '@/types/database'

export default async function AdminContactPage() {
  const supabase = await createClient()
  const { data: contacts } = await supabase
    .from('contact')
    .select('id, title, status, customer_email, created_at, answered_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">문의 관리</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">제목</th>
              <th className="text-left px-4 py-3 font-medium">고객 이메일</th>
              <th className="text-left px-4 py-3 font-medium">상태</th>
              <th className="text-left px-4 py-3 font-medium">접수일</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contacts?.map((c: Pick<Contact, 'id' | 'title' | 'status' | 'customer_email' | 'created_at' | 'answered_at'>) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.title}</td>
                <td className="px-4 py-3 text-gray-600">{c.customer_email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    c.status === 'answered' ? 'bg-green-100 text-green-700' :
                    c.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    c.status === 'closed' ? 'bg-gray-100 text-gray-600' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {CONTACT_STATUS_LABEL[c.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{formatDateTimeKST(c.created_at)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/contact/${c.id}`} className="text-blue-600 underline text-xs">상세</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!contacts || contacts.length === 0) && (
          <div className="text-center text-gray-400 py-8">문의가 없습니다.</div>
        )}
      </div>
    </div>
  )
}
