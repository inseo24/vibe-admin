'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  userEmail: string
}

export default function OnboardingForm({ userEmail }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed) return
    setLoading(true)
    setError(null)

    const res = await fetch('/api/profile/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone: phone || null }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '프로필 생성에 실패했습니다.')
    } else {
      router.push('/my')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이메일 <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={userEmail}
          disabled
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-100 text-gray-500"
        />
        <p className="text-xs text-gray-400 mt-1">로그인 이메일로 자동 설정됩니다.</p>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          이름 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력하세요"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          휴대폰 번호
          <span className="ml-1 text-xs text-gray-400 font-normal">(선택 입력)</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="010-0000-0000"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          휴대폰 번호는 선택 입력 항목입니다. 예약 변경, 긴급 일정 안내, 문의 응대 보조 목적으로만 사용됩니다. 입력하지 않아도 기본 서비스 이용은 가능합니다.
        </p>
      </div>

      <div className="flex items-start gap-2 pt-2">
        <input
          id="agreed"
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="agreed" className="text-sm text-gray-700">
          개인정보 처리 안내를 확인했습니다.
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={!agreed || !name || loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition mt-2"
      >
        {loading ? '저장 중...' : '프로필 저장 및 시작하기'}
      </button>
    </form>
  )
}
