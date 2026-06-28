'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewAppointmentPage() {
  const [scheduledAt, setScheduledAt] = useState('')
  const [duration, setDuration] = useState(60)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration,
        customer_message: message || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '예약 요청에 실패했습니다.')
    } else {
      router.push('/my/appointments')
    }
    setLoading(false)
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">예약 요청</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="scheduled_at" className="block text-sm font-medium text-gray-700 mb-1">
              희망 일시 <span className="text-red-500">*</span>
            </label>
            <input
              id="scheduled_at"
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              소요 시간 (분)
            </label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30분</option>
              <option value={60}>60분</option>
              <option value={90}>90분</option>
              <option value={120}>120분</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              요청사항
            </label>
            <div className="mb-1 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
              ⚠️ 예약 요청사항에는 주민등록번호, 계좌번호, 카드번호, 비밀번호, 건강정보 등 민감한 정보를 입력하지 마세요.
            </div>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="요청사항을 입력해 주세요 (선택)"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Link
              href="/my/appointments"
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm text-center hover:bg-gray-50 transition"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={!scheduledAt || loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? '요청 중...' : '예약 요청'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
