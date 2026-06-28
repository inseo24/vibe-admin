import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  const body = await request.json()
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const phone = typeof body.phone === 'string' && body.phone.trim() ? body.phone.trim() : null

  if (!name) {
    return NextResponse.json({ error: '이름을 입력해 주세요.' }, { status: 400 })
  }

  // 이미 프로필이 있는지 확인
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: '이미 프로필이 존재합니다.' }, { status: 409 })
  }

  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    email: user.email!,
    name,
    phone,
    role: 'customer',
    privacy_agreed_at: new Date().toISOString(),
  })

  if (error) {
    return NextResponse.json({ error: '프로필 생성에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
