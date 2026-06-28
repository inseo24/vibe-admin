#!/usr/bin/env bash
# scripts/preflight.sh
# 개발 시작 전 필요한 도구와 로그인 상태를 점검합니다.

set -euo pipefail
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'

ok()   { echo -e "${GREEN}[OK]${NC}   $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; }

echo ""
echo "========================================"
echo "  vibe-admin 환경 점검"
echo "========================================"
echo ""

PASS=true

# git
if command -v git &> /dev/null; then
  ok "git $(git --version | awk '{print $3}')"
else
  fail "git 미설치 — https://git-scm.com 에서 설치하세요."
  PASS=false
fi

# Node.js
if command -v node &> /dev/null; then
  ok "node $(node --version)"
else
  fail "Node.js 미설치 — https://nodejs.org 에서 설치하세요."
  PASS=false
fi

# npm
if command -v npm &> /dev/null; then
  ok "npm $(npm --version)"
else
  fail "npm 미설치"
  PASS=false
fi

# pnpm (선택)
if command -v pnpm &> /dev/null; then
  ok "pnpm $(pnpm --version)"
else
  warn "pnpm 미설치 (선택 사항) — npm install -g pnpm"
fi

# gh
if command -v gh &> /dev/null; then
  ok "gh $(gh --version | head -1)"
else
  warn "GitHub CLI 미설치 — brew install gh"
fi

# vercel
if command -v vercel &> /dev/null; then
  ok "vercel $(vercel --version 2>&1 | head -1)"
else
  warn "Vercel CLI 미설치 — npm install -g vercel"
fi

# supabase
if command -v supabase &> /dev/null; then
  ok "supabase $(supabase --version)"
else
  warn "Supabase CLI 미설치 — brew install supabase/tap/supabase"
fi

echo ""
echo "--- 로그인 상태 ---"

# gh auth
if command -v gh &> /dev/null; then
  if gh auth status &> /dev/null 2>&1; then
    ok "GitHub CLI 로그인됨"
  else
    warn "GitHub CLI 로그인 필요 — gh auth login"
  fi
fi

# vercel whoami
if command -v vercel &> /dev/null; then
  if vercel whoami &> /dev/null 2>&1; then
    ok "Vercel CLI 로그인됨"
  else
    warn "Vercel CLI 로그인 필요 — vercel login"
  fi
fi

echo ""
echo "--- 환경변수 파일 ---"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "$PROJECT_DIR/.env.local" ]; then
  ok ".env.local 존재 (내용 출력 안 함)"
else
  warn ".env.local 없음 — .env.example 을 복사해 값을 채워주세요."
  warn "  cp .env.example .env.local"
fi

if [ -f "$PROJECT_DIR/.env.example" ]; then
  ok ".env.example 존재"
else
  fail ".env.example 없음"
  PASS=false
fi

echo ""
echo "--- Git 상태 ---"

if [ -d "$PROJECT_DIR/.git" ]; then
  ok "git repository 확인됨"
  REMOTE=$(git -C "$PROJECT_DIR" remote get-url origin 2>/dev/null || echo "")
  if [ -n "$REMOTE" ]; then
    ok "remote origin: $REMOTE"
  else
    warn "remote origin 미설정"
  fi
  BRANCH=$(git -C "$PROJECT_DIR" branch --show-current 2>/dev/null || echo "unknown")
  ok "현재 branch: $BRANCH"
  if [ -n "$(git -C "$PROJECT_DIR" status --porcelain 2>/dev/null)" ]; then
    warn "워킹 트리에 변경사항 있음"
  else
    ok "워킹 트리 깨끗함"
  fi
else
  fail "git repository가 아닙니다."
  PASS=false
fi

echo ""
echo "========================================"
if $PASS; then
  echo -e "${GREEN}  점검 완료 — 필수 항목 통과${NC}"
else
  echo -e "${RED}  점검 실패 — 위 FAIL 항목을 해결하세요${NC}"
  exit 1
fi
echo "========================================"
echo ""
