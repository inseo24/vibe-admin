-- =============================================================================
-- vibe-admin: 데이터베이스 초기 설정 (Supabase SQL Editor 붙여넣기용)
-- =============================================================================
--
-- 사용법 (비개발자용):
--   1. Supabase 대시보드 → 왼쪽 메뉴 "SQL Editor" 클릭
--   2. 이 파일 전체 내용을 복사해서 빈 쿼리 창에 붙여넣기 (Cmd+V)
--   3. 오른쪽 아래 "Run" 클릭 (또는 Cmd+Enter)
--   4. "Success. No rows returned" 메시지가 나오면 완료
--
-- 이 파일은 supabase/migrations/ 의 마이그레이션과 동일한 스키마를 만듭니다.
-- 차이점: 맨 위에 정리(drop) 블록이 있어 여러 번 실행해도 안전합니다.
-- (CLI `supabase db push` 를 쓰는 경우 이 파일 대신 migrations 폴더가 사용됩니다.)
--
-- ⚠️ 주의: 아래 "0. 기존 객체 정리"는 vibe-admin 테이블을 DROP 합니다.
--          이미 운영 중인 데이터가 있다면 실행하지 마세요.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. 기존 객체 정리 (재실행 안전성 — 처음 설치라면 아무 영향 없음)
-- -----------------------------------------------------------------------------
drop table if exists public.customer_notes cascade;
drop table if exists public.contact cascade;
drop table if exists public.appointments cascade;
drop table if exists public.profiles cascade;
drop function if exists public.is_admin() cascade;
drop function if exists public.set_updated_at() cascade;
drop type if exists public.contact_status cascade;
drop type if exists public.appointment_status cascade;
drop type if exists public.user_role cascade;

-- -----------------------------------------------------------------------------
-- 1. ENUM 타입
-- -----------------------------------------------------------------------------
create type public.user_role as enum ('customer', 'admin');

create type public.appointment_status as enum (
  'requested',
  'approved',
  'rejected',
  'cancelled',
  'completed',
  'no_show'
);

create type public.contact_status as enum (
  'open',
  'in_progress',
  'answered',
  'closed'
);

-- -----------------------------------------------------------------------------
-- 2. 테이블 생성
-- -----------------------------------------------------------------------------

create table public.profiles (
  id               uuid primary key,
  role             public.user_role not null default 'customer',
  email            text not null unique,
  name             text,
  phone            text,
  privacy_agreed_at timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
comment on table public.profiles is '고객/관리자 프로필. id는 auth.users.id와 동일 값 사용.';

create table public.appointments (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid not null,
  customer_email   text not null,
  customer_phone   text,
  customer_message text,
  scheduled_at     timestamptz not null,
  duration         integer not null default 60,
  status           public.appointment_status not null default 'requested',
  admin_message    text,
  approved_at      timestamptz,
  cancelled_at     timestamptz,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
comment on table public.appointments is '예약 요청 및 승인 테이블. FK 제약 없이 customer_id/email/phone 스냅샷으로 관리.';

create table public.contact (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid not null,
  customer_email   text not null,
  customer_phone   text,
  status           public.contact_status not null default 'open',
  title            text not null,
  body             text not null,
  admin_reply      text,
  answered_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
comment on table public.contact is '고객 문의사항 테이블. answered_at 오타 주의(answred_at 아님).';

create table public.customer_notes (
  id             uuid primary key default gen_random_uuid(),
  customer_id    uuid not null,
  customer_email text,
  customer_phone text,
  admin_id       uuid not null,
  title          text,
  body           text not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
comment on table public.customer_notes is '관리자 전용 내부 메모. 고객에게 절대 노출 금지.';

-- -----------------------------------------------------------------------------
-- 3. updated_at 자동 갱신 트리거
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_appointments_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

create trigger set_contact_updated_at
  before update on public.contact
  for each row execute function public.set_updated_at();

create trigger set_customer_notes_updated_at
  before update on public.customer_notes
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 4. 인덱스
-- -----------------------------------------------------------------------------
create index idx_profiles_role    on public.profiles(role);
create index idx_profiles_email   on public.profiles(email);

create index idx_appointments_customer_id          on public.appointments(customer_id);
create index idx_appointments_status_scheduled_at  on public.appointments(status, scheduled_at);
create index idx_appointments_created_at           on public.appointments(created_at desc);

create index idx_customer_notes_customer_id on public.customer_notes(customer_id);
create index idx_customer_notes_admin_id    on public.customer_notes(admin_id);

create index idx_contact_customer_id        on public.contact(customer_id);
create index idx_contact_status_created_at  on public.contact(status, created_at desc);

-- -----------------------------------------------------------------------------
-- 5. RLS 활성화
-- -----------------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.appointments    enable row level security;
alter table public.customer_notes  enable row level security;
alter table public.contact         enable row level security;

-- -----------------------------------------------------------------------------
-- 6. is_admin() 헬퍼 함수
-- RLS 재귀 방지: profiles 테이블을 직접 조회하되 security definer + search_path 고정
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- -----------------------------------------------------------------------------
-- 7. RLS 정책
-- -----------------------------------------------------------------------------

-- profiles ------------------------------------------------------------------

-- 자기 row 조회
create policy "profiles: customer select own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

-- 관리자 전체 조회 (is_admin이 true면 모든 row)
create policy "profiles: admin select all"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

-- 최초 프로필 생성 (insert): 반드시 서버 action/route를 통해 처리
-- id = auth.uid(), role = 'customer', privacy_agreed_at은 서버 설정
create policy "profiles: customer insert own"
  on public.profiles for insert
  to authenticated
  with check (
    id = auth.uid()
    and role = 'customer'
  );

-- 고객 자기 name/phone 수정 허용. role/email/privacy_agreed_at은 변경 불가.
-- 컬럼 단위 제한은 RLS 만으로 완벽히 보장하기 어려우므로
-- update 경로는 server action/API route에서만 name, phone만 변경한다.
create policy "profiles: customer update own name/phone"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() and not public.is_admin())
  with check (id = auth.uid() and role = 'customer');

-- 관리자 전체 update (관리자 승격은 SQL Editor 또는 서버 전용 API에서만)
create policy "profiles: admin update all"
  on public.profiles for update
  to authenticated
  using (public.is_admin());

-- appointments ---------------------------------------------------------------

create policy "appointments: customer select own"
  on public.appointments for select
  to authenticated
  using (customer_id = auth.uid());

create policy "appointments: admin select all"
  on public.appointments for select
  to authenticated
  using (public.is_admin());

-- 고객 insert: customer_id = auth.uid(), status = 'requested' 강제
create policy "appointments: customer insert own"
  on public.appointments for insert
  to authenticated
  with check (
    customer_id = auth.uid()
    and status = 'requested'
  );

-- 관리자 전체 update (상태 변경, admin_message 등)
create policy "appointments: admin update all"
  on public.appointments for update
  to authenticated
  using (public.is_admin());

-- customer_notes (관리자 전용) -------------------------------------------------

create policy "customer_notes: admin only select"
  on public.customer_notes for select
  to authenticated
  using (public.is_admin());

create policy "customer_notes: admin only insert"
  on public.customer_notes for insert
  to authenticated
  with check (public.is_admin());

create policy "customer_notes: admin only update"
  on public.customer_notes for update
  to authenticated
  using (public.is_admin());

create policy "customer_notes: admin only delete"
  on public.customer_notes for delete
  to authenticated
  using (public.is_admin());

-- contact --------------------------------------------------------------------

create policy "contact: customer select own"
  on public.contact for select
  to authenticated
  using (customer_id = auth.uid());

create policy "contact: admin select all"
  on public.contact for select
  to authenticated
  using (public.is_admin());

-- 고객 insert: customer_id = auth.uid(), status = 'open' 강제
create policy "contact: customer insert own"
  on public.contact for insert
  to authenticated
  with check (
    customer_id = auth.uid()
    and status = 'open'
  );

-- 관리자 전체 update (답변, 상태 변경)
create policy "contact: admin update all"
  on public.contact for update
  to authenticated
  using (public.is_admin());

-- =============================================================================
-- 완료. 아래로 테이블 4개가 생성되었는지 확인할 수 있습니다.
--   select table_name from information_schema.tables
--   where table_schema = 'public' order by table_name;
-- =============================================================================
