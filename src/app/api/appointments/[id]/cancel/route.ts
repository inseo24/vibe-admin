import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

interface Context {
  params: Promise<{ id: string }>
}

// 고객이 본인 예약을 취소한다.
// RLS로 고객 update 경로를 열지 않고, 서버에서 소유권/상태를 검증한 뒤
// service role 로 제한된 상태 변경만 수행한다.
export async function PATCH(_request: NextRequest, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: appt } = await admin
    .from('appointments')
    .select('id, customer_id, status')
    .eq('id', id)
    .single()

  if (!appt) {
    return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 })
  }
  // 소유권 검증: 본인 예약만 취소 가능
  if (appt.customer_id !== user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }
  // 취소 가능한 상태만 허용
  if (!['requested', 'approved'].includes(appt.status)) {
    return NextResponse.json({ error: '이미 처리된 예약은 취소할 수 없습니다.' }, { status: 400 })
  }

  const { error } = await admin
    .from('appointments')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: '예약 취소에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
