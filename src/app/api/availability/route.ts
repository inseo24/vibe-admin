import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/availability?date=YYYY-MM-DD            (하루)
// GET /api/availability?from=YYYY-MM-DD&days=7     (범위)
// 잡힌(requested/approved) 슬롯의 시작 시각과 상태만 반환한다.
// 고객 개인정보는 절대 포함하지 않는다 (scheduled_at, status 만).
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  const sp = request.nextUrl.searchParams
  const date = sp.get('date')
  const from = sp.get('from') ?? date
  const days = date ? 1 : Math.min(Math.max(parseInt(sp.get('days') ?? '7', 10) || 7, 1), 31)

  if (!from || !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
    return NextResponse.json({ error: '날짜 형식이 올바르지 않습니다.' }, { status: 400 })
  }

  const dayStart = new Date(`${from}T00:00:00+09:00`)
  const rangeStart = dayStart.toISOString()
  const rangeEnd = new Date(dayStart.getTime() + days * 86400000 - 1000).toISOString()

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('appointments')
    .select('scheduled_at, status')
    .in('status', ['requested', 'approved'])
    .gte('scheduled_at', rangeStart)
    .lte('scheduled_at', rangeEnd)

  if (error) {
    return NextResponse.json({ error: '가용성 조회에 실패했습니다.' }, { status: 500 })
  }

  const slots = (data ?? []).map((r) => ({ at: r.scheduled_at, status: r.status }))
  return NextResponse.json({ slots })
}
