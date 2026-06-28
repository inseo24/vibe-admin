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
  const scheduled_at = body.scheduled_at
  const duration = typeof body.duration === 'number' ? body.duration : 60
  const customer_message = typeof body.customer_message === 'string' && body.customer_message.trim()
    ? body.customer_message.trim()
    : null

  if (!scheduled_at) {
    return NextResponse.json({ error: '예약 일시를 입력해 주세요.' }, { status: 400 })
  }

  const { error } = await supabase.from('appointments').insert({
    customer_id: profile.id,
    customer_email: profile.email,
    customer_phone: profile.phone ?? null,
    customer_message,
    scheduled_at,
    duration,
    status: 'requested',
  })

  if (error) {
    return NextResponse.json({ error: '예약 요청에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
