import 'server-only'
import { createClient } from '@supabase/supabase-js'

// 서버 전용 Supabase 클라이언트 (service role).
// RLS를 우회하므로 반드시 서버 코드에서만, 권한 확인 후 사용한다.
// 'server-only' import 로 클라이언트 번들에 포함되면 빌드가 실패한다.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
