import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDateTimeKST } from '@/lib/utils'

export default async function AdminCustomersPage() {
  const supabase = await createClient()
  const { data: customers } = await supabase
    .from('profiles')
    .select('id, name, email, phone, created_at')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">고객 목록</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">이름</th>
              <th className="text-left px-4 py-3 font-medium">이메일</th>
              <th className="text-left px-4 py-3 font-medium">휴대폰</th>
              <th className="text-left px-4 py-3 font-medium">가입일</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers?.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.name ?? '-'}</td>
                <td className="px-4 py-3 text-gray-600">{c.email}</td>
                <td className="px-4 py-3 text-gray-600">{c.phone ?? '-'}</td>
                <td className="px-4 py-3 text-gray-400">{formatDateTimeKST(c.created_at)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/customers/${c.id}`} className="text-blue-600 underline text-xs">
                    상세
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!customers || customers.length === 0) && (
          <div className="text-center text-gray-400 py-8">고객이 없습니다.</div>
        )}
      </div>
    </div>
  )
}
