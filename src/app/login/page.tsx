'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (authError) {
      setError('이메일 전송에 실패했습니다. 다시 시도해 주세요.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow p-8 text-center">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-2xl font-bold mb-2">이메일을 확인해 주세요</h1>
          <p className="text-gray-600">
            <strong>{email}</strong>로 로그인 링크를 전송했습니다.
            <br />
            이메일의 링크를 클릭하면 자동으로 로그인됩니다.
          </p>
          <button
            onClick={() => { setSent(false); setEmail('') }}
            className="mt-6 text-sm text-blue-600 underline"
          >
            다른 이메일로 시도하기
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-2">로그인 / 회원가입</h1>
        <p className="text-gray-500 text-sm mb-6">
          이메일을 입력하면 로그인 링크를 보내드립니다.
          <br />
          처음 이용하시는 경우 자동으로 가입됩니다.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? '전송 중...' : '로그인 링크 받기'}
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-400 text-center">
          로그인하시면{' '}
          <a href="/privacy" className="underline">개인정보 처리방침</a>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </main>
  )
}
