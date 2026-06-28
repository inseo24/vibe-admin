'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  initialName: string
  initialPhone: string
  email: string
}

export default function ProfileEditForm({ initialName, initialPhone, email }: Props) {
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/profile/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone: phone || null }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '수정에 실패했습니다.')
    } else {
      router.push('/my')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-100 text-gray-500"
        />
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
          휴대폰 번호는 선택 입력 항목입니다. 예약 변경, 긴급 일정 안내, 문의 응대 보조 목적으로만 사용됩니다.
        </p>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm hover:bg-gray-50 transition"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!name || loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  )
}
