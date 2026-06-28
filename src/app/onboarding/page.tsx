import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OnboardingForm from './OnboardingForm'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 이미 프로필이 있으면 홈으로
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (profile) redirect('/')

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-1">프로필 설정</h1>
        <p className="text-gray-500 text-sm mb-6">
          서비스 이용을 위해 기본 정보를 입력해 주세요.
        </p>

        {/* 개인정보 처리 안내 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-sm">
          <div className="font-semibold text-gray-800 mb-1">
            [필수] 개인정보 처리 안내
          </div>
          <div className="text-xs text-gray-500 mb-2">기준일: 2026.06.28</div>
          <div className="text-gray-700 space-y-1.5">
            <p>서비스 이용을 위해 아래 개인정보를 처리합니다.</p>
            <p><strong>수집·이용 목적:</strong> 회원가입, 로그인, 예약 요청 및 관리, 문의 응대, 서비스 관련 안내</p>
            <p><strong>수집 항목:</strong> 이메일, 이름, 휴대폰 번호</p>
            <p><strong>필수 항목:</strong> 이메일, 이름</p>
            <p><strong>선택 항목:</strong> 휴대폰 번호</p>
            <p><strong>보유 및 이용 기간:</strong> 회원 탈퇴 시까지 보관하며, 관련 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관합니다.</p>
            <p className="text-gray-600">
              <strong>동의 거부 안내:</strong> 개인정보 처리 안내 확인을 거부할 수 있습니다. 다만 이메일과 이름은 서비스 제공에 필요한 항목이므로, 해당 정보 제공을 거부할 경우 회원가입 및 예약/문의 기능 이용이 제한될 수 있습니다. 휴대폰 번호는 선택 항목이며, 입력하지 않아도 기본 서비스 이용은 가능합니다. 다만 전화 또는 문자 안내가 제한될 수 있습니다.
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            자세한 내용은{' '}
            <a href="/privacy" className="text-blue-600 underline" target="_blank" rel="noopener">
              개인정보 처리방침
            </a>
            을 확인하세요.
          </p>
        </div>

        <OnboardingForm userEmail={user.email ?? ''} />
      </div>
    </main>
  )
}
