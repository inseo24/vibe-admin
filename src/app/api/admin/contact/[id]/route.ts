import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { ContactStatus } from '@/types/database'

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
  const validStatuses = ['open', 'in_progress', 'answered', 'closed']

  const updateData: Record<string, string | null> = {}
  if (body.status && validStatuses.includes(body.status)) {
    updateData.status = body.status as ContactStatus
  }
  if (body.admin_reply !== undefined) {
    updateData.admin_reply = body.admin_reply || null
    if (body.status === 'answered') {
      updateData.answered_at = new Date().toISOString()
    }
  }

  const { error } = await supabase.from('contact').update(updateData).eq('id', id)
  if (error) return NextResponse.json({ error: '저장에 실패했습니다.' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
