import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const body = await request.json()
  const customer_id = body.customer_id
  const customer_email = body.customer_email ?? null
  const customer_phone = body.customer_phone ?? null
  const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim() : null
  const noteBody = typeof body.body === 'string' ? body.body.trim() : ''

  if (!customer_id || !noteBody) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
  }

  const { data: note, error } = await supabase
    .from('customer_notes')
    .insert({ customer_id, customer_email, customer_phone, admin_id: user.id, title, body: noteBody })
    .select()
    .single()

  if (error) return NextResponse.json({ error: '메모 저장에 실패했습니다.' }, { status: 500 })

  return NextResponse.json({ ok: true, note }, { status: 201 })
}
