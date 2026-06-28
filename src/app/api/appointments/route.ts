import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SLOT_MINUTES, isValidBooking, intervalsOverlap } from '@/lib/booking'
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
  const duration = typeof body.duration === 'number' ? body.duration : SLOT_MINUTES
  const customer_message = typeof body.customer_message === 'string' && body.customer_message.trim()
    ? body.customer_message.trim()
    : null

  if (!scheduled_at) {
    return NextResponse.json({ error: '예약 시간을 선택해 주세요.' }, { status: 400 })
  }

  // 유효한 예약(연속 슬롯·영업시간·소요시간)인지 검증 (클라이언트 값 신뢰 금지)
  if (!isValidBooking(scheduled_at, duration)) {
    return NextResponse.json({ error: '예약할 수 없는 시간입니다.' }, { status: 400 })
  }
  if (new Date(scheduled_at).getTime() < Date.now()) {
    return NextResponse.json({ error: '이미 지난 시간은 예약할 수 없습니다.' }, { status: 400 })
  }

  // 중복 예약 방지: 같은 날 requested/approved 예약과 시간 구간이 겹치면 거절
  // (다른 고객 정보는 노출하지 않고, 충돌 여부만 service role 로 확인)
  const admin = createAdminClient()
  const newStart = new Date(scheduled_at).getTime()
  const dateStr = scheduled_at.slice(0, 10)
  const dayStart = new Date(`${dateStr}T00:00:00+09:00`).toISOString()
  const dayEnd = new Date(`${dateStr}T23:59:59+09:00`).toISOString()
  const { data: sameDay } = await admin
    .from('appointments')
    .select('scheduled_at, duration')
    .in('status', ['requested', 'approved'])
    .gte('scheduled_at', dayStart)
    .lte('scheduled_at', dayEnd)

  const clash = (sameDay ?? []).some((e) =>
    intervalsOverlap(newStart, duration, new Date(e.scheduled_at).getTime(), e.duration)
  )
  if (clash) {
    return NextResponse.json({ error: '이미 예약된 시간이 포함되어 있습니다. 다른 시간을 선택해 주세요.' }, { status: 409 })
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
