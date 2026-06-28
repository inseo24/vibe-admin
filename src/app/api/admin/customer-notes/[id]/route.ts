import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface Context {
  params: Promise<{ id: string }>
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const { error } = await supabase.from('customer_notes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: '삭제에 실패했습니다.' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
