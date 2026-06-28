#!/usr/bin/env bash
# scripts/setup-local.sh
# 로컬 개발 환경 세팅 보조 스크립트

set -euo pipefail
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

step()  { echo -e "\n${BLUE}►${NC} $1"; }
ok()    { echo -e "${GREEN}  [OK]${NC} $1"; }
info()  { echo -e "${YELLOW}  [INFO]${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo ""
echo "========================================"
echo "  vibe-admin 로컬 환경 설정"
echo "========================================"

# 1. 사전 점검
step "사전 환경 점검 실행..."
bash "$SCRIPT_DIR/preflight.sh" || exit 1

# 2. 패키지 설치
step "패키지 설치..."
if command -v pnpm &> /dev/null; then
  info "pnpm 사용"
  pnpm install
else
  info "npm 사용"
  npm install
fi
ok "패키지 설치 완료"

# 3. .env.local 확인
step ".env.local 확인..."
if [ ! -f ".env.local" ]; then
  info ".env.local 이 없습니다. .env.example 을 복사합니다."
  cp .env.example .env.local
  info ".env.local 을 열어 Supabase URL, anon key, service role key를 입력하세요."
  info "  NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>"
  info "  NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>"
  info "  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>"
else
  ok ".env.local 이미 존재합니다."
fi

# 4. Supabase init 확인
step "Supabase 설정 확인..."
if [ -f "supabase/config.toml" ]; then
  ok "supabase/config.toml 이미 존재합니다."
else
  info "supabase/config.toml 이 없습니다. supabase init 을 실행합니다."
  supabase init --workdir supabase || true
fi

# 5. Supabase local start (선택)
echo ""
read -rp "Supabase local 개발 서버를 시작하시겠습니까? (y/N) " START_LOCAL
if [[ "${START_LOCAL:-N}" =~ ^[Yy]$ ]]; then
  step "Supabase local 서버 시작..."
  supabase start
  ok "Supabase local 서버 시작됨"
  echo ""
  info "DB migration 적용:"
  info "  supabase db push"
  echo ""
else
  info "Supabase local 서버 시작 건너뜀"
  info "나중에 실행하려면: supabase start"
fi

# 6. Vercel link (선택)
echo ""
read -rp "Vercel 프로젝트에 연결하시겠습니까? (y/N) " VERCEL_LINK
if [[ "${VERCEL_LINK:-N}" =~ ^[Yy]$ ]]; then
  step "Vercel 프로젝트 연결..."
  vercel link
  step "환경변수 pull..."
  vercel env pull .env.local
  ok "Vercel 환경변수 .env.local 에 저장됨"
else
  info "Vercel 연결 건너뜀"
  info "나중에 실행하려면: vercel link && vercel env pull .env.local"
fi

# 7. Migration 안내
echo ""
echo "========================================"
echo "  DB Migration 적용 방법"
echo "========================================"
echo ""
echo "  [로컬 Supabase 사용 시]"
echo "  supabase db push"
echo ""
echo "  [원격 Supabase 프로젝트에 직접 적용 시]"
echo "  supabase db push --linked"
echo "  또는 Supabase Dashboard → SQL Editor에서"
echo "  supabase/migrations/20260628000000_init_vibe_admin_schema.sql 내용 실행"
echo ""
echo "========================================"
echo -e "${GREEN}  설정 완료!${NC}"
echo "========================================"
echo ""
echo "  개발 서버 시작: npm run dev"
echo "  린트 실행: npm run lint"
echo "  빌드 테스트: npm run build"
echo ""
