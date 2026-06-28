'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signupSent, setSignupSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setError('이메일 인증이 완료되지 않았습니다. 메일의 인증 링크를 먼저 눌러주세요.')
        } else {
          setError('이메일 또는 비밀번호가 올바르지 않습니다.')
        }
        setLoading(false)
        return
      }
      router.push('/')
      router.refresh()
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
      })
      if (error) {
        if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already')) {
          setError('이미 가입된 이메일입니다. 로그인해 주세요.')
        } else if (error.message.toLowerCase().includes('password')) {
          setError('비밀번호는 6자 이상이어야 합니다.')
        } else {
          setError('회원가입에 실패했습니다. 다시 시도해 주세요.')
        }
        setLoading(false)
        return
      }
      setSignupSent(true)
      setLoading(false)
    }
  }

  if (signupSent) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow p-8 text-center">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-2xl font-bold mb-2">이메일을 확인해 주세요</h1>
          <p className="text-gray-600 text-sm">
            <strong>{email}</strong>로 인증 메일을 보냈습니다.
            <br />
            메일의 인증 링크를 클릭하면 가입이 완료됩니다.
          </p>
          <button
            onClick={() => { setSignupSent(false); setMode('login'); setPassword('') }}
            className="mt-6 text-sm text-blue-600 underline"
          >
            로그인 화면으로
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-8">
        {/* 탭 */}
        <div className="flex mb-6 border border-gray-200 rounded-lg overflow-hidden text-sm font-medium">
          <button
            onClick={() => { setMode('login'); setError(null) }}
            className={`flex-1 py-2 transition ${mode === 'login' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500'}`}
          >
            로그인
          </button>
          <button
            onClick={() => { setMode('signup'); setError(null) }}
            className={`flex-1 py-2 transition ${mode === 'signup' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500'}`}
          >
            회원가입
          </button>
        </div>

        <h1 className="text-xl font-bold mb-1">
          {mode === 'login' ? '로그인' : '회원가입'}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {mode === 'login'
            ? '이메일과 비밀번호를 입력해 주세요.'
            : '이메일 인증 후 가입이 완료됩니다.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? '6자 이상' : '비밀번호'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '가입하기'}
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-400 text-center">
          {mode === 'signup' && '가입 시 '}
          <a href="/privacy" className="underline">개인정보 처리방침</a>
          {mode === 'signup' ? '에 동의하는 것으로 간주됩니다.' : ' 보기'}
        </p>
      </div>
    </main>
  )
}
