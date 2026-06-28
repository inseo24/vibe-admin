import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { AppointmentStatus } from '@/types/database'

interface Context {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const body = await request.json()
  const status: AppointmentStatus = body.status

  const validStatuses = ['requested', 'approved', 'rejected', 'cancelled', 'completed', 'no_show']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: '유효하지 않은 상태입니다.' }, { status: 400 })
  }

  const updateData: Record<string, string | null> = { status }
  if (status === 'approved') updateData.approved_at = new Date().toISOString()
  if (status === 'cancelled') updateData.cancelled_at = new Date().toISOString()
  if (status === 'completed') updateData.completed_at = new Date().toISOString()

  if (body.admin_message !== undefined) {
    updateData.admin_message = body.admin_message
  }

  const { error } = await supabase.from('appointments').update(updateData).eq('id', id)
  if (error) return NextResponse.json({ error: '상태 변경에 실패했습니다.' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
