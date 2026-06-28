import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SLOT_MINUTES, isValidSlot } from '@/lib/booking'
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
  const customer_message = typeof body.customer_message === 'string' && body.customer_message.trim()
    ? body.customer_message.trim()
    : null

  if (!scheduled_at) {
    return NextResponse.json({ error: '예약 시간을 선택해 주세요.' }, { status: 400 })
  }

  // 유효한 영업 슬롯인지 + 과거가 아닌지 검증 (클라이언트 값 신뢰 금지)
  if (!isValidSlot(scheduled_at)) {
    return NextResponse.json({ error: '예약할 수 없는 시간입니다.' }, { status: 400 })
  }
  if (new Date(scheduled_at).getTime() < Date.now()) {
    return NextResponse.json({ error: '이미 지난 시간은 예약할 수 없습니다.' }, { status: 400 })
  }

  // 중복 예약 방지: 동일 시각에 requested/approved 예약이 있으면 거절
  // (다른 고객 정보는 노출하지 않고, 충돌 여부만 service role 로 확인)
  const admin = createAdminClient()
  const { data: clash } = await admin
    .from('appointments')
    .select('id')
    .eq('scheduled_at', scheduled_at)
    .in('status', ['requested', 'approved'])
    .limit(1)

  if (clash && clash.length > 0) {
    return NextResponse.json({ error: '이미 예약된 시간입니다. 다른 시간을 선택해 주세요.' }, { status: 409 })
  }

  const { error } = await supabase.from('appointments').insert({
    customer_id: profile.id,
    customer_email: profile.email,
    customer_phone: profile.phone ?? null,
    customer_message,
    scheduled_at,
    duration: SLOT_MINUTES,
    status: 'requested',
  })

  if (error) {
    return NextResponse.json({ error: '예약 요청에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
