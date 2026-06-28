'use client'

import { useState } from 'react'
import { formatDateTimeKST } from '@/lib/utils'
import type { CustomerNote } from '@/types/database'

interface Props {
  customerId: string
  customerEmail: string
  customerPhone: string | null
  initialNotes: CustomerNote[]
}

export default function CustomerNoteSection({ customerId, customerEmail, customerPhone, initialNotes }: Props) {
  const [notes, setNotes] = useState<CustomerNote[]>(initialNotes)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/admin/customer-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: customerId, customer_email: customerEmail, customer_phone: customerPhone, title, body }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '저장에 실패했습니다.')
    } else {
      const data = await res.json()
      setNotes([data.note, ...notes])
      setTitle('')
      setBody('')
    }
    setLoading(false)
  }

  async function handleDelete(noteId: string) {
    if (!confirm('메모를 삭제하시겠습니까?')) return
    const res = await fetch(`/api/admin/customer-notes/${noteId}`, { method: 'DELETE' })
    if (res.ok) {
      setNotes(notes.filter((n) => n.id !== noteId))
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-semibold mb-1">내부 메모</h2>
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-4">
        ⚠️ 관리자 내부 메모에는 주민등록번호, 계좌번호, 카드번호, 건강정보, 비밀번호 등 민감정보를 기록하지 마세요.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목 (선택)"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="메모 내용을 입력하세요"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={!body || loading}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition"
        >
          {loading ? '저장 중...' : '메모 저장'}
        </button>
      </form>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-gray-400 text-sm">메모 없음</p>
        ) : notes.map((note) => (
          <div key={note.id} className="border border-gray-100 rounded-lg p-3">
            {note.title && <div className="font-medium text-sm mb-1">{note.title}</div>}
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.body}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">{formatDateTimeKST(note.created_at)}</span>
              <button onClick={() => handleDelete(note.id)} className="text-xs text-red-400 hover:text-red-600">삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
