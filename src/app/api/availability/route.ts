import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/availability?date=YYYY-MM-DD
// 해당 날짜에 이미 잡힌(requested/approved) 슬롯의 시작 시각만 반환한다.
// 고객 개인정보는 절대 포함하지 않는다 (scheduled_at 만).
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  const date = request.nextUrl.searchParams.get('date')
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: '날짜 형식이 올바르지 않습니다.' }, { status: 400 })
  }

  // 하루 범위 (KST)
  const dayStart = new Date(`${date}T00:00:00+09:00`).toISOString()
  const dayEnd = new Date(`${date}T23:59:59+09:00`).toISOString()

  // service role 로 전체 예약 조회하되, scheduled_at 만 반환 (개인정보 미노출)
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('appointments')
    .select('scheduled_at')
    .in('status', ['requested', 'approved'])
    .gte('scheduled_at', dayStart)
    .lte('scheduled_at', dayEnd)

  if (error) {
    return NextResponse.json({ error: '가용성 조회에 실패했습니다.' }, { status: 500 })
  }

  const taken = (data ?? []).map((r) => r.scheduled_at)
  return NextResponse.json({ taken })
}
