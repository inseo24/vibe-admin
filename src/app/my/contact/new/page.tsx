'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewContactPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '문의 등록에 실패했습니다.')
    } else {
      router.push('/my/contact')
    }
    setLoading(false)
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">문의 등록</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="문의 제목을 입력하세요"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
              내용 <span className="text-red-500">*</span>
            </label>
            <div className="mb-1 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
              ⚠️ 문의 내용에는 주민등록번호, 계좌번호, 카드번호, 비밀번호, 건강정보 등 민감한 정보를 입력하지 마세요. 문의 응대를 위해 작성하신 문의 내용과 연락처 정보가 처리됩니다.
            </div>
            <textarea
              id="body"
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder="문의 내용을 입력해 주세요"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Link
              href="/my/contact"
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm text-center hover:bg-gray-50 transition"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={!title || !body || loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? '등록 중...' : '문의 등록'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
