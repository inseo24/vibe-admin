import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  // 303 See Other: POST → GET 으로 바꿔 /login 페이지로 리다이렉트 (307이면 POST 유지되어 405)
  return NextResponse.redirect(
    new URL('/login', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
    { status: 303 }
  )
}
