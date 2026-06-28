import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { formatTimeKST } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  // 서비스 롤 키 사용: anon RLS를 우회하여 서버에서만 approved 예약 조회
  // SUPABASE_SERVICE_ROLE_KEY는 서버 전용. 절대 클라이언트 코드에 노출 금지.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('scheduled_at, duration')
    .eq('status', 'approved')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: '스케줄을 불러올 수 없습니다.' }, { status: 500 })
  }

  // 개인정보 필드 제외: customer_id, customer_email, customer_phone, customer_message, admin_message 미포함
  const schedule = (appointments ?? []).map((apt) => ({
    scheduled_at: apt.scheduled_at,
    duration: apt.duration,
    label: `${formatTimeKST(apt.scheduled_at)} 예약 완료`,
  }))

  return NextResponse.json(schedule, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
    },
  })
}
