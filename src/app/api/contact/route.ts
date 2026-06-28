import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  // 서버에서 프로필 조회 (클라이언트 전달값 신뢰 금지)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, phone')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: '프로필이 없습니다.' }, { status: 404 })
  }

  const body = await request.json()
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const bodyText = typeof body.body === 'string' ? body.body.trim() : ''

  if (!title || !bodyText) {
    return NextResponse.json({ error: '제목과 내용을 입력해 주세요.' }, { status: 400 })
  }

  const { error } = await supabase.from('contact').insert({
    customer_id: profile.id,
    customer_email: profile.email,
    customer_phone: profile.phone ?? null,
    title,
    body: bodyText,
    status: 'open',
  })

  if (error) {
    return NextResponse.json({ error: '문의 등록에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
