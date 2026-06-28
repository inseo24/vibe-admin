'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CancelButton({ appointmentId }: { appointmentId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleCancel() {
    if (!confirm('이 예약을 취소하시겠습니까?')) return
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/appointments/${appointmentId}/cancel`, { method: 'PATCH' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? '취소에 실패했습니다.')
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="text-right">
      <button
        onClick={handleCancel}
        disabled={loading}
        className="text-xs text-red-500 hover:text-red-700 underline disabled:opacity-50"
      >
        {loading ? '취소 중...' : '예약 취소'}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
