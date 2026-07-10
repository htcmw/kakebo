# GitHub 사용법 (프로젝트 관리)

| 항목 | 내용 |
| :-- | :-- |
| 문서 버전 | v0.1 |
| 작성일 | 2026-07-08 |
| 상태 | 🟢 활성 규칙 |

kakebo를 GitHub로 관리하는 방식. 레포: `htcmw/kakebo`. 초기 세팅은 `scripts/github-setup.sh`(gh CLI)로 한 번에.

## 무엇을 어디서 관리하나

| 관리 대상 | GitHub 기능 | 비고 |
| :-- | :-- | :-- |
| **로드맵** | Milestones + [`ROADMAP.md`](../../ROADMAP.md) | Milestone = Bolt/Phase 단위 |
| **백로그** | Issues | 출처: `role-deliverables.md`. 라벨로 분류 |
| **작업 현황** | Projects(v2) 보드 | Todo → In Progress → In Review → Done |
| **결정 기록** | 레포 `docs/decisions/` (ADR) | GitHub Issue가 아니라 레포 정본 |
| **변경 단위** | Commits + Pull Requests | 커밋 컨벤션 + PR 리뷰 |

## 라벨 체계

- **area**: `area:docs` · `area:design` · `area:frontend` · `area:backend` · `area:qa` (역할/폴더 매핑)
- **type**: `type:feature` · `type:spec` · `type:design` · `type:bug` · `type:test` · `type:chore`
- **priority**: `priority:P0` · `priority:P1` · `priority:P2`
- **phase**: `phase:1` · `phase:2`

## 이슈 → 보드 → 브랜치 → PR → 머지 (흐름)

1. **이슈 생성**: 백로그 항목을 이슈로. 템플릿(feature/spec/design/bug) 사용, 라벨·Milestone·Project 지정.
2. **보드 반영**: Project 보드에서 Todo → In Progress로 이동(착수 시).
3. **브랜치**: 커밋 스코프와 맞춘 이름 — `feat/import-parser`, `docs/requirements-baseline`, `fix/...`.
4. **커밋**: [`commit-conventions`](../../.claude/skills/commit-conventions/SKILL.md) 준수. 본문/footer에 이슈 링크 — `Refs #12`.
5. **PR**: 템플릿의 **Definition of Done 체크리스트** 통과. 본문에 `Closes #12`로 이슈 자동 종료 연결. 리뷰(사람 또는 `qa-verifier`) 후 머지.
6. **머지 → 보드 Done**, 이슈 자동 종료, Milestone 진행률 갱신.

## 애자일/에이전틱 워크플로와의 매핑

- Milestone(Bolt) = 하나의 반복 단위(수직 슬라이스).
- 이슈 = 의도(요구사항/인수조건) 단위 작업. 서브에이전트(`.claude/agents/`)가 area 라벨로 담당 매핑.
- PR의 DoD 체크리스트 = [`06-agentic-workflow.md`](../02-construction/06-agentic-workflow.md) §3 검증 게이트.

## 최초 세팅 (1회)

```bash
# gh CLI 로그인 + project 권한
gh auth login
gh auth refresh -s project,repo

# 라벨·마일스톤·Project 보드·시드 이슈 생성
bash scripts/github-setup.sh
```

이후엔 이슈/PR/보드로 굴린다. 상세는 `scripts/github-setup.sh` 주석 참고.
