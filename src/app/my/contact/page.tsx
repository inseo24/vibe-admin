import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CONTACT_STATUS_LABEL, formatDateTimeKST } from '@/lib/utils'
import type { Contact } from '@/types/database'

export default async function MyContactPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: contacts } = await supabase
    .from('contact')
    .select('id, title, status, created_at, answered_at')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">문의사항</h1>
        <Link
          href="/my/contact/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          문의 등록
        </Link>
      </div>

      {!contacts || contacts.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          문의 내역이 없습니다.
          <div className="mt-4">
            <Link href="/my/contact/new" className="text-blue-600 underline text-sm">
              문의를 등록해 보세요
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {(contacts as Pick<Contact, 'id' | 'title' | 'status' | 'created_at' | 'answered_at'>[]).map((c) => (
            <Link
              key={c.id}
              href={`/my/contact/${c.id}`}
              className="block bg-white rounded-xl shadow p-5 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="font-medium">{c.title}</div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 shrink-0 ${
                  c.status === 'answered' ? 'bg-green-100 text-green-700' :
                  c.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  c.status === 'closed' ? 'bg-gray-100 text-gray-600' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {CONTACT_STATUS_LABEL[c.status]}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">{formatDateTimeKST(c.created_at)}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link href="/my" className="text-sm text-gray-500 underline">← 내 정보로</Link>
      </div>
    </main>
  )
}
