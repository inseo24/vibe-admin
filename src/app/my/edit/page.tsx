import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileEditForm from './ProfileEditForm'

export default async function ProfileEditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email, phone')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">정보 수정</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <ProfileEditForm
          initialName={profile.name ?? ''}
          initialPhone={profile.phone ?? ''}
          email={profile.email}
        />
      </div>
    </main>
  )
}
