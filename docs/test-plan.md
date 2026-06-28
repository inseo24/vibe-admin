# QA 체크리스트 및 테스트 계획

## 기본 원칙

- MVP이므로 과도한 테스트 프레임워크를 도입하지 않습니다.
- 권한, RLS, 개인정보 노출 방지, 예약/문의 핵심 플로우를 필수 검증합니다.
- 자동화 테스트가 없는 경우 이 체크리스트를 수동으로 검증합니다.

---

## 1. 인증 / 프로필

- [ ] 비로그인 사용자가 `/my`에 접근하면 `/login`으로 리다이렉트된다.
- [ ] 비로그인 사용자가 `/admin`에 접근하면 `/login`으로 리다이렉트된다.
- [ ] 신규 로그인 사용자(`profiles` row 없음)가 로그인하면 `/onboarding`으로 이동한다.
- [ ] 최초 프로필 생성 시 `role`은 항상 `customer`로 저장된다.
- [ ] 고객이 직접 Supabase로 `profiles.role`을 `admin`으로 변경할 수 없다.
- [ ] 고객이 `name`, `phone`만 수정 가능하다. `role`, `email`, `privacy_agreed_at`은 수정 불가.
- [ ] 휴대폰 번호를 입력하지 않아도 프로필 저장이 가능하다.
- [ ] 휴대폰 번호 미입력 시 `phone`은 `null`로 저장된다.
- [ ] 개인정보 처리 안내 체크박스를 체크하지 않으면 저장 버튼이 비활성화된다.
- [ ] 개인정보 처리 안내 기준일(2026.06.28)이 화면에 표시된다.

---

## 2. 예약

- [ ] 고객은 자기 예약만 조회할 수 있다. 다른 고객 예약은 조회 불가.
- [ ] 고객이 예약 생성 시 `status`는 `requested`로 저장된다.
- [ ] 예약 생성 API가 클라이언트에서 전달한 `customer_id`/`customer_email`/`customer_phone`을 사용하지 않고, 서버에서 로그인 사용자 기준으로 저장한다.
- [ ] 관리자는 전체 예약을 조회할 수 있다.
- [ ] 관리자가 예약 상태를 `approved`, `rejected`, `cancelled`, `completed`, `no_show`로 변경할 수 있다.
- [ ] 예약 요청사항 입력창에 민감정보 입력 금지 안내가 표시된다.

---

## 3. 공개 스케줄 API

- [ ] `/api/public-schedule` 응답에 `status = 'approved'`인 예약만 포함된다.
- [ ] 응답 필드에 `customer_id`, `customer_email`, `customer_phone`, `customer_message`, `admin_message`가 없다.
- [ ] 응답 필드는 `scheduled_at`, `duration`, `label`만 포함된다.
- [ ] `/schedule` 화면에서 고객 이름, 이메일, 휴대폰 번호, 요청사항이 노출되지 않는다.
- [ ] 비로그인(anon) 사용자가 직접 Supabase로 `appointments` 테이블을 SELECT할 수 없다.

---

## 4. 문의사항 (contact)

- [ ] 고객은 자기 문의만 조회할 수 있다. 다른 고객 문의 조회 불가.
- [ ] 고객이 문의 생성 시 `status`는 `open`으로 저장된다.
- [ ] 고객이 `admin_reply`, `answered_at`, `status`를 직접 수정할 수 없다.
- [ ] 문의 생성 API가 서버에서 로그인 사용자 기준으로 `customer_id`/`email`/`phone`을 저장한다.
- [ ] 관리자가 전체 문의를 조회하고 답변/상태 변경이 가능하다.
- [ ] 문의 상태가 `answered`로 변경될 때 `answered_at`이 서버에서 현재 시각으로 저장된다.
- [ ] 문의 본문 입력창에 민감정보 입력 금지 안내가 표시된다.

---

## 5. 관리자 내부 메모 (customer_notes)

- [ ] 고객은 `customer_notes`를 조회할 수 없다.
- [ ] 고객 화면 API에서 `customer_notes`를 import/query하지 않는다.
- [ ] 관리자가 고객별 내부 메모를 작성/조회/삭제할 수 있다.
- [ ] 관리자 메모 입력창에 민감정보 입력 금지 안내가 표시된다.

---

## 6. 개인정보 / 보안

- [ ] `.env.local`, `.env.production`, Supabase access token이 git에 포함되지 않는다.
- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트 컴포넌트 또는 `NEXT_PUBLIC_*`에서 사용되지 않는다.
- [ ] 로그에 이메일, 휴대폰 번호, 문의 본문, 관리자 메모가 그대로 출력되지 않는다.
- [ ] `/privacy` 페이지에 개인정보 처리방침 시행일이 표시된다.
- [ ] 관리자가 아닌 사용자가 `/admin` 접근 시 `/my`로 리다이렉트된다.

---

## 7. RLS 검증 (Supabase SQL Editor)

```sql
-- anon 사용자는 private 테이블을 조회할 수 없다
SET ROLE anon;
SELECT * FROM public.profiles;        -- 결과 없음
SELECT * FROM public.appointments;    -- 결과 없음
SELECT * FROM public.contact;         -- 결과 없음
SELECT * FROM public.customer_notes;  -- 결과 없음

-- customer는 customer_notes를 조회할 수 없다
-- (고객 JWT로 테스트)
SELECT * FROM public.customer_notes; -- 결과 없음

-- customer는 profiles.role을 admin으로 변경할 수 없다
UPDATE public.profiles SET role = 'admin' WHERE id = auth.uid();
-- → RLS 정책에 의해 차단되거나 0 rows affected

-- customer A는 customer B의 appointments를 조회할 수 없다
SELECT * FROM public.appointments WHERE customer_id != auth.uid();
-- → 결과 없음 (RLS: customer_id = auth.uid() 조건만 통과)
```

---

## 자동화하지 못한 항목

아래 항목은 현재 수동 검증이 필요합니다:

- Supabase RLS 정책 실제 동작 (SQL Editor 수동 실행)
- 이메일 매직링크 실제 수신 및 로그인 플로우
- 공개 스케줄 API 응답 내 개인정보 미포함 여부
- 관리자 역할 승격 후 `/admin` 접근 여부
- 휴대폰 번호 미입력 시 null 저장 여부

---

## 운영자가 직접 확인해야 하는 보안 항목

- [ ] Supabase RLS가 프로덕션 환경에서 실제로 활성화되어 있는가
- [ ] `appointments` 테이블에 `anon` SELECT 정책이 없는가
- [ ] Vercel 환경변수에서 `SUPABASE_SERVICE_ROLE_KEY`가 서버 전용으로 설정되어 있는가
- [ ] 개인정보 처리방침의 사업자 정보가 실제 정보로 업데이트되었는가
- [ ] Git 히스토리에 `.env` 파일이 포함된 커밋이 없는가 (`git log --all -- .env*`)
