import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email, phone, created_at')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">내 정보</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <dl className="space-y-3 text-sm">
          <div className="flex gap-4">
            <dt className="w-24 text-gray-500 shrink-0">이름</dt>
            <dd className="font-medium">{profile.name ?? '-'}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-24 text-gray-500 shrink-0">이메일</dt>
            <dd className="font-medium">{profile.email}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-24 text-gray-500 shrink-0">휴대폰</dt>
            <dd className="font-medium">{profile.phone ?? '미입력'}</dd>
          </div>
        </dl>
        <div className="mt-4 pt-4 border-t">
          <Link href="/my/edit" className="text-sm text-blue-600 underline">
            정보 수정
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/my/appointments"
          className="bg-white rounded-xl shadow p-6 hover:shadow-md transition"
        >
          <div className="text-2xl mb-2">📅</div>
          <div className="font-semibold">내 예약</div>
          <div className="text-sm text-gray-500 mt-1">예약 현황 확인</div>
        </Link>
        <Link
          href="/my/contact"
          className="bg-white rounded-xl shadow p-6 hover:shadow-md transition"
        >
          <div className="text-2xl mb-2">💬</div>
          <div className="font-semibold">문의사항</div>
          <div className="text-sm text-gray-500 mt-1">문의 등록 및 확인</div>
        </Link>
      </div>

      <div className="mt-6 text-center">
        <Link href="/schedule" className="text-sm text-gray-500 underline">
          공개 스케줄 보기
        </Link>
      </div>

      <form action="/api/auth/signout" method="POST" className="mt-8 text-center">
        <button type="submit" className="text-sm text-red-500 underline">
          로그아웃
        </button>
      </form>
    </main>
  )
}
