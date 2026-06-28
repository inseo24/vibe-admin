import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/my')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-gray-900">
              Vibe Admin
            </Link>
            <Link href="/admin/customers" className="text-sm text-gray-600 hover:text-gray-900">고객</Link>
            <Link href="/admin/appointments" className="text-sm text-gray-600 hover:text-gray-900">예약</Link>
            <Link href="/admin/contact" className="text-sm text-gray-600 hover:text-gray-900">문의</Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{profile.name} (관리자)</span>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="text-xs text-red-500 underline">로그아웃</button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
