'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ContactStatus } from '@/types/database'
import { CONTACT_STATUS_LABEL } from '@/lib/utils'

interface Props {
  contactId: string
  currentStatus: ContactStatus
  currentReply: string | null
}

const STATUS_OPTIONS: ContactStatus[] = ['open', 'in_progress', 'answered', 'closed']

export default function ContactReplyForm({ contactId, currentStatus, currentReply }: Props) {
  const [reply, setReply] = useState(currentReply ?? '')
  const [status, setStatus] = useState<ContactStatus>(currentStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch(`/api/admin/contact/${contactId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_reply: reply, status }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '저장에 실패했습니다.')
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-semibold mb-4">답변 작성</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">상태</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ContactStatus)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{CONTACT_STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-1">답변 내용</label>
          <textarea
            id="reply"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={5}
            placeholder="답변을 입력하세요"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? '저장 중...' : '저장'}
        </button>
      </form>
    </div>
  )
}
