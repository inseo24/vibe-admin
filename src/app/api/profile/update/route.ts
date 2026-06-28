import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  const body = await request.json()
  const name = typeof body.name === 'string' ? body.name.trim() : undefined
  const phone = typeof body.phone === 'string' && body.phone.trim() ? body.phone.trim() : null

  if (name !== undefined && !name) {
    return NextResponse.json({ error: '이름을 입력해 주세요.' }, { status: 400 })
  }

  const updateData: Record<string, string | null> = {}
  if (name !== undefined) updateData.name = name
  if ('phone' in body) updateData.phone = phone

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: '프로필 수정에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
