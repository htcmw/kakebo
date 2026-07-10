#!/usr/bin/env bash
# kakebo GitHub 프로젝트 관리 초기 세팅 (1회 실행)
# 요구: gh CLI 로그인 + project 권한
#   gh auth login
#   gh auth refresh -s project,repo
# 실행: bash scripts/github-setup.sh
#
# 멱등성: 이미 있는 항목은 건너뛰거나 갱신(--force)한다. 다시 돌려도 안전.
set -uo pipefail

# --- 사전 점검: gh 설치·로그인 ---
if ! command -v gh >/dev/null 2>&1; then
  echo "✗ gh(GitHub CLI)가 설치돼 있지 않습니다."
  echo "  설치: brew install gh   (또는 https://cli.github.com)"
  echo "  그다음: gh auth login  &&  gh auth refresh -s project,repo"
  exit 1
fi
if ! gh auth status >/dev/null 2>&1; then
  echo "✗ gh 로그인이 필요합니다:  gh auth login"
  exit 1
fi

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
OWNER=${REPO%%/*}
echo "▶ 대상 레포: $REPO"

# ---------------------------------------------------------------------------
# 1) 라벨
# ---------------------------------------------------------------------------
echo "▶ 라벨 생성..."
mklabel() { gh label create "$1" --color "$2" --description "$3" --force >/dev/null 2>&1 && echo "  · $1"; }
# area (역할/폴더)
mklabel "area:docs"      "1D76DB" "product-owner / docs"
mklabel "area:design"    "C5DEF5" "ui-ux-designer / designs"
mklabel "area:frontend"  "0E8A16" "frontend-engineer / frontend"
mklabel "area:backend"   "5319E7" "backend-engineer / backend (Phase 2)"
mklabel "area:qa"        "D93F0B" "qa-verifier / 검증"
# type
mklabel "type:feature"   "0E8A16" "구현 작업"
mklabel "type:spec"      "1D76DB" "요구사항·설계·문서"
mklabel "type:design"    "C5DEF5" "UI/UX 시안"
mklabel "type:bug"       "D73A4A" "버그"
mklabel "type:test"      "FBCA04" "테스트"
mklabel "type:chore"     "CFD3D7" "설정·잡무"
# priority
mklabel "priority:P0"    "B60205" "MVP 필수"
mklabel "priority:P1"    "D93F0B" "MVP 포함, 후순위"
mklabel "priority:P2"    "FEF2C0" "MVP 이후"
# phase
mklabel "phase:1"        "0052CC" "로컬 MVP"
mklabel "phase:2"        "5319E7" "서버 백업/공유"

# ---------------------------------------------------------------------------
# 2) 마일스톤 (= 로드맵 단위)
# ---------------------------------------------------------------------------
echo "▶ 마일스톤 생성..."
mkmilestone() {
  if gh api "repos/$REPO/milestones?state=all" -q '.[].title' 2>/dev/null | grep -qxF "$1"; then
    echo "  · $1 (이미 있음)"; return
  fi
  gh api --method POST "repos/$REPO/milestones" -f title="$1" -f description="$2" >/dev/null 2>&1 \
    && echo "  · $1 (생성)" || echo "  · $1 (실패)"
}
mkmilestone "Bolt 0 — 기반"          "Expo 스캐폴드 · 로컬 SQLite · 요구사항 baseline"
mkmilestone "Bolt 1 — Import 코어"   "1개 기관 CSV → 정규화 → 저장 → 목록 (수직 슬라이스)"
mkmilestone "Bolt 2 — 거래·분류"     "목록·검색·카테고리·공동/개인 태깅"
mkmilestone "Bolt 3 — 대시보드"      "합산·분담·카테고리·추이"
mkmilestone "Bolt 4 — 예산"          "카테고리별 예산·소진율"
mkmilestone "Bolt 5 — 확장·고도화"   "다기관 매핑 · 이체/할부 고도화"
mkmilestone "Phase 2 — 백업/공유"    "S3 스냅샷 백업 · 인증 · (향후) 동기화"

# ---------------------------------------------------------------------------
# 3) 시드 이슈 (백로그 → Issues). 제목 중복이면 건너뜀
# ---------------------------------------------------------------------------
echo "▶ 시드 이슈 생성..."
ISSUE_URLS=()
mkissue() { # title, milestone, labels(csv), body
  local title="$1" ms="$2" labels="$3" body="$4"
  local existing
  # 특수문자 제목의 검색 누락을 피하려고 전체 목록에서 정확 매칭
  existing=$(gh issue list --state all --limit 300 --json title,url \
             -q ".[] | select(.title==\"$title\") | .url" | head -1)
  if [ -n "$existing" ]; then echo "  · (있음) $title"; ISSUE_URLS+=("$existing"); return; fi
  local url
  url=$(gh issue create --title "$title" --milestone "$ms" --label "$labels" --body "$body")
  [ -n "$url" ] && { echo "  · $title"; ISSUE_URLS+=("$url"); }
}

mkissue "요구사항 baseline 레포 통합·동결" "Bolt 0 — 기반" "type:spec,area:docs,priority:P0,phase:1" \
  "요구사항 v1.0 + 델타(계좌·카드·이체·할부)를 하나의 baseline 문서로 레포에 통합하고 확정. Refs: 요구사항, 02a"
mkissue "SQLite 스키마(DDL) 확정" "Bolt 0 — 기반" "type:spec,area:frontend,priority:P0,phase:1" \
  "논리 데이터 모델 → 물리 SQLite DDL(테이블·인덱스·제약). Refs: docs/02-construction/02-data-model.md"
mkissue "Expo 앱 스캐폴드(TS·Router·NativeWind)" "Bolt 0 — 기반" "type:feature,area:frontend,priority:P0,phase:1" \
  "Expo 프로젝트 초기화, Expo Router, NativeWind 설정. Refs: ADR-0010, ADR-0011"
mkissue "디자인 토큰 정의(NativeWind 매핑)" "Bolt 0 — 기반" "type:design,area:design,priority:P1,phase:1" \
  "목업 토큰(색·타이포·간격)을 NativeWind 테마로. Refs: ADR-0010, designs/ui-mockup.html"

mkissue "import: 파일 업로드 UI" "Bolt 1 — Import 코어" "type:feature,area:frontend,priority:P0,phase:1" \
  "CSV/엑셀 업로드(≤10MB), 형식 검증. Refs: FR-IM-01"
mkissue "import: 인코딩 감지 + CSV 파서(1개 기관)" "Bolt 1 — Import 코어" "type:feature,area:frontend,priority:P0,phase:1" \
  "CP949/EUC-KR/UTF-8 자동 감지, 기관 매핑 프로파일. Refs: FR-IM-02, FR-IM-03"
mkissue "import: 정규화 + 중복 감지" "Bolt 1 — Import 코어" "type:feature,area:frontend,priority:P0,phase:1" \
  "표준 스키마 정규화, 중복 키(날짜+금액+적요+출처). Refs: FR-IM-04"
mkissue "import: 미리보기·확정 → SQLite 저장" "Bolt 1 — Import 코어" "type:feature,area:frontend,priority:P0,phase:1" \
  "신규/중복/오류/이체 구분 미리보기, 확정 시 저장. Refs: FR-IM-05, FR-AC-04"
mkissue "거래 목록 화면" "Bolt 1 — Import 코어" "type:feature,area:frontend,priority:P0,phase:1" \
  "저장된 거래를 목록으로. Refs: FR-TX-01"

mkissue "테스트 계획 초안" "Bolt 1 — Import 코어" "type:test,area:qa,priority:P1,phase:1" \
  "단위/통합/E2E 범위, 인수조건↔테스트 매핑. Refs: 06-agentic-workflow §3"
mkissue "모바일 반응형 화면 설계" "Bolt 2 — 거래·분류" "type:design,area:design,priority:P1,phase:1" \
  "데스크톱 목업 → 모바일 레이아웃. Refs: NFR-PLT-01"

# ---------------------------------------------------------------------------
# 4) Projects(v2) 보드 (작업 현황) — best-effort (project 권한 필요)
# ---------------------------------------------------------------------------
echo "▶ Project 보드..."
# 기존 'kakebo' 프로젝트가 있으면 재사용, 없으면 생성 (@me = 개인 계정)
PROJ_NUM=$(gh project list --owner "@me" --format json \
           -q '.projects[] | select(.title=="kakebo") | .number' 2>/dev/null | head -1)
if [ -z "${PROJ_NUM:-}" ]; then
  PROJ_NUM=$(gh project create --owner "@me" --title "kakebo" --format json -q .number)
  echo "  · Project #$PROJ_NUM 생성"
else
  echo "  · Project #$PROJ_NUM 재사용"
fi
if [ -n "${PROJ_NUM:-}" ]; then
  # repo에 연결 (레포 Projects 탭에 표시)
  gh project link "$PROJ_NUM" --owner "@me" --repo "${REPO##*/}" \
    && echo "  · repo(${REPO##*/})에 연결" || echo "  · repo 연결 실패(위 에러 참고, 또는 웹에서 연결)"
  n=0
  for u in "${ISSUE_URLS[@]}"; do
    gh project item-add "$PROJ_NUM" --owner "@me" --url "$u" >/dev/null 2>&1 && n=$((n+1))
  done
  echo "  · 이슈 ${n}건 보드에 추가 (Board/Roadmap View는 프로젝트에서 New view로 추가)"
else
  echo "  · ✗ 프로젝트 생성 실패 — 위 에러 확인"
fi

echo "✅ 완료. Issues·Milestones·(선택)Project 보드가 세팅됐습니다."
echo "   로드맵: ROADMAP.md · 사용법: docs/meta/github-workflow.md"
