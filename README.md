# vibe-admin

Next.js + Supabase 기반 사내/소규모 고객관리 어드민 템플릿.

비개발자도 바이브코딩으로 재사용할 수 있도록 설계된 템플릿 레포입니다.

---

## 주요 기능

- 이메일 매직링크 로그인 (Supabase Auth)
- 고객 프로필 생성 및 수정 (이름, 휴대폰 번호)
- 고객 예약 요청 / 내 예약 조회
- 고객 문의 등록 / 답변 확인
- 관리자 대시보드 (고객 목록, 예약 관리, 문의 관리, 내부 메모)
- 공개 스케줄 화면 (개인정보 미노출, 승인된 예약만 표시)
- 한국 개인정보보호법 기준 개인정보 처리 안내 UI 및 처리방침 페이지

---

## 테이블 설계 요약

| 테이블 | 설명 |
|--------|------|
| `profiles` | 고객/관리자 프로필. `id`는 Supabase Auth uid와 동일 값 사용. FK 제약 없음. |
| `appointments` | 예약 요청 및 승인. `customer_email`, `customer_phone` 스냅샷 저장. |
| `contact` | 고객 문의. `customer_email`, `customer_phone` 스냅샷 저장. |
| `customer_notes` | 관리자 전용 내부 메모. 고객에게 절대 미노출. |

FK 제약은 의도적으로 생략하고, 애플리케이션 레벨과 RLS로 접근을 제어합니다.

---

## 개인정보 및 보안 주의사항

- 이메일과 이름은 필수 처리 항목입니다.
- 휴대폰 번호는 **선택 수집 항목**입니다. 사용자가 입력하지 않으면 `phone`, `customer_phone` 값을 저장하지 않습니다.
- 예약 요청사항, 문의 본문, 관리자 메모에는 주민등록번호, 계좌번호, 카드번호, 비밀번호, 건강정보 등 민감정보를 입력받지 않도록 화면에서 안내합니다.
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용입니다. `NEXT_PUBLIC_*` 환경변수에 절대 포함하지 마세요.
- 공개 스케줄 화면과 API에서 고객 개인정보를 절대 노출하지 않습니다.
- 개인정보 처리방침(`/privacy`)의 사업자명, 문의 이메일, 보유기간, 위탁/국외이전 관련 문구는 실제 운영자 상황에 맞게 반드시 수정해야 합니다.
- 이 템플릿은 법률 자문이 아닙니다. 실제 운영 전 개인정보 처리방침과 동의 문구는 전문가 검토를 권장합니다.

---

## 환경변수 설정

| 변수 | 설명 | 사용 위치 |
|------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | 클라이언트/서버 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 키 | 클라이언트/서버 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role 키 | **서버 전용** (공개 스케줄 API) |
| `NEXT_PUBLIC_APP_URL` | 앱 URL (예: `https://yourdomain.com`) | 클라이언트/서버 |
| `DEFAULT_TIMEZONE` | 기본 타임존 (예: `Asia/Seoul`) | 서버 |

> `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트 코드, `'use client'` 파일, `NEXT_PUBLIC_*` 환경변수에 포함하지 마세요.

---

## 사전 준비 도구

- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org) (v18 이상)
- [GitHub CLI](https://cli.github.com): `brew install gh`
- [Vercel CLI](https://vercel.com/docs/cli): `npm install -g vercel`
- [Supabase CLI](https://supabase.com/docs/guides/cli): `brew install supabase/tap/supabase`

> Windows 사용자는 Git Bash 또는 WSL(Windows Subsystem for Linux) 사용을 권장합니다.

---

## 환경 점검

```bash
bash scripts/preflight.sh
```

개발에 필요한 도구 설치 여부, 로그인 상태, 환경변수 파일 존재 여부를 점검합니다.

---

## 로컬 실행 방법

```bash
# 1. 레포 클론
git clone https://github.com/inseo24/vibe-admin.git
cd vibe-admin

# 2. 환경 설정 및 패키지 설치 (대화형 스크립트)
bash scripts/setup-local.sh

# 3. 또는 수동 설정
cp .env.example .env.local
# .env.local에 Supabase 키 값 입력 후

npm install
npm run dev
```

---

## 데이터베이스 스키마 적용

테이블, RLS 정책, 함수를 만드는 방법은 두 가지입니다.

### 방법 1 — SQL Editor 붙여넣기 (비개발자 추천, 가장 확실)

CLI 설치/로그인 없이, 키 노출 없이 바로 됩니다.

1. `supabase/setup-database.sql` 파일 전체 내용을 복사합니다.
   ```bash
   # macOS: 클립보드로 복사 (화면에 아무것도 안 뜨면 정상)
   cat supabase/setup-database.sql | pbcopy
   ```
2. Supabase 대시보드 → 왼쪽 **SQL Editor** → 빈 쿼리 창에 붙여넣기(`Cmd+V`)
3. **Run** 클릭 (또는 `Cmd+Enter`)
4. "Success. No rows returned" 가 뜨면 완료

> `supabase/setup-database.sql` 은 맨 위에 정리(drop) 블록이 있어 여러 번 실행해도 안전합니다.
> 단, **이미 운영 중인 데이터가 있으면 기존 테이블을 지우므로 실행하지 마세요.**

### 방법 2 — Supabase CLI (`supabase db push`)

```bash
# 로컬 Supabase 사용 시 (Docker 필요)
supabase start
supabase db push

# 원격 Supabase 프로젝트에 직접 적용 시
supabase login
supabase link --project-ref <your-project-ref>
supabase db push   # DB 비밀번호 입력 필요
```

> CLI는 `supabase/migrations/` 폴더의 마이그레이션 파일을 사용합니다.
> `setup-database.sql` 과 동일한 스키마이지만, CLI를 쓸 때는 migrations 폴더가 기준입니다.

---

## Vercel 배포

```bash
# 1. Vercel CLI로 배포
vercel

# 2. Vercel 대시보드에서 환경변수 설정
#    NEXT_PUBLIC_SUPABASE_URL
#    NEXT_PUBLIC_SUPABASE_ANON_KEY
#    SUPABASE_SERVICE_ROLE_KEY  ← 반드시 서버 전용으로 설정
#    NEXT_PUBLIC_APP_URL

# 3. 프로덕션 배포
vercel --prod
```

---

## 첫 관리자 계정 만드는 방법

1. `/login`에서 이메일로 가입합니다.
2. 이메일 링크를 클릭하여 로그인 후 `/onboarding`에서 프로필을 생성합니다.
3. Supabase Dashboard → SQL Editor에서 다음을 실행합니다:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin@email.com';
```

> 관리자 승격은 일반 화면에서 제공하지 않습니다. SQL Editor 또는 서버 전용 API에서만 가능합니다.

---

## RLS 정책 요약

| 테이블 | 고객 | 관리자 |
|--------|------|--------|
| `profiles` | 자기 row만 조회 / name·phone만 수정 | 전체 조회·수정 |
| `appointments` | 자기 예약만 조회·생성 (status=requested 강제) | 전체 조회·상태 변경 |
| `contact` | 자기 문의만 조회·생성 (status=open 강제) | 전체 조회·답변·상태 변경 |
| `customer_notes` | 접근 불가 | 전체 조회·생성·수정·삭제 |

- `is_admin()` 함수: `SECURITY DEFINER`, `STABLE`, `SET search_path = public`으로 RLS 재귀 문제 방지.
- 공개 스케줄 API: `anon` 사용자에게 `appointments` SELECT 권한 없음. 서버에서 service role 키로 조회 후 `scheduled_at`, `duration`, `label`만 반환.

---

## RLS 검증 방법 (Supabase SQL Editor)

```sql
-- 1. anon 사용자는 profiles를 조회할 수 없어야 한다
SET ROLE anon;
SELECT * FROM public.profiles; -- 결과 없음 또는 에러

-- 2. customer는 customer_notes를 조회할 수 없어야 한다
-- (Supabase Dashboard에서 고객 JWT로 테스트)
SELECT * FROM public.customer_notes; -- 결과 없음

-- 3. customer는 profiles.role을 admin으로 변경할 수 없어야 한다
UPDATE public.profiles SET role = 'admin' WHERE id = auth.uid(); -- RLS 차단

-- 4. customer A는 customer B의 appointments를 조회할 수 없어야 한다
SELECT * FROM public.appointments WHERE customer_id != auth.uid(); -- 결과 없음
```

---

## 비개발자가 수정해야 하는 설정값 목록

| 항목 | 위치 | 내용 |
|------|------|------|
| Supabase URL/키 | `.env.local` | Supabase 프로젝트 설정에서 복사 |
| 앱 URL | `.env.local` → `NEXT_PUBLIC_APP_URL` | 실제 도메인으로 변경 |
| 개인정보 처리방침 사업자 정보 | `src/app/privacy/page.tsx` → `OPERATOR_INFO` | 사업자명, 대표자, 문의 이메일 등 |
| 개인정보 처리 안내 기준일 | `src/app/privacy/page.tsx`, `src/app/onboarding/page.tsx` | 실제 시행일로 변경 |
| 관리자 계정 | Supabase SQL Editor | 가입 후 role을 admin으로 변경 |

---

## 상세 문서

역할별 문서는 [`docs/`](docs/README.md) 폴더에 정리되어 있습니다.

- [기획](docs/01-기획.md) · [아키텍처](docs/02-아키텍처.md) · [데이터베이스](docs/03-데이터베이스.md)
- [보안·개인정보](docs/04-보안-개인정보.md) · [테스트·QA](docs/05-테스트-QA.md) · [운영·배포](docs/06-운영-배포.md)
- [프롬프트 회고](docs/07-프롬프트-회고.md) — 코드 기준으로 프롬프트를 어떻게 구성했어야 했는지

---

## 레포 URL 변경 방법

기본 레포: `https://github.com/inseo24/vibe-admin`

다른 레포를 사용하려면:

```bash
git remote set-url origin https://github.com/<your-username>/<your-repo>.git
```
