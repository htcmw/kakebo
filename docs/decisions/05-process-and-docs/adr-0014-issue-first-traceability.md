# ADR-0014: 이슈 우선 — 모든 작업을 GitHub 이슈에 연결

| 항목 | 내용 |
|------|------|
| 상태 | ✅ Accepted |
| 날짜 | 2026-07-08 |
| 단계 | Construction (meta) |

## 맥락 (Context)

GitHub로 프로젝트를 관리한다(로드맵=Milestones, 백로그=Issues, 작업현황=Projects 보드). 추적성을 위해 **모든 변경이 어떤 작업(이슈)에서 비롯됐는지** 연결되어야 한다. 지금까지 커밋은 ADR/FR만 참조해 GitHub 이슈와의 연결이 없었다.

## 결정 (Decision)

**모든 작업은 이슈에서 시작하고, 브랜치·커밋·PR을 그 이슈에 연결한다(issue-first).**

- **이슈 없는 작업 금지.** 사소한 변경도 최소 하나의 이슈(필요하면 `type:chore`)에 연결한다.
- **커밋 footer에 이슈 필수**: 관련은 `Refs: #12`, 완료는 `Closes #12`(GitHub 표준 키워드). ADR/FR 병기 가능 — 예: `Refs: #12, ADR-0004`.
- **브랜치명에 이슈 번호 포함**: `feat/12-import-parser`, `docs/8-requirements-baseline`.
- **PR은 `Closes #N`**으로 이슈를 연결·자동 종료한다.

## 근거

- 작업 ↔ 결정(ADR) ↔ 코드의 추적성 완성. `#N`은 GitHub가 자동 링크·종료해 보드/마일스톤 진행률이 자동 갱신된다.
- 리뷰·회고 시 "이 변경이 왜 있었나"를 이슈로 즉시 추적.

## 결과 (Consequences)

- (+) 모든 변경의 "왜"가 이슈로 추적되고, 로드맵·보드가 자동으로 최신화.
- (−) 아주 작은 변경에도 이슈가 필요(오버헤드) → `type:chore` 이슈로 가볍게 처리.
- (→) [`commit-conventions`](../../../.claude/skills/commit-conventions/SKILL.md), [`github-workflow`](../../meta/github-workflow.md), [`development-process`](../../meta/development-process.md)에 반영.
- (경계) **이 정책 도입 이전 커밋(초기 29개)은 소급하지 않는다.** GitHub 세팅으로 이슈가 생성된 이후의 작업부터 적용.

## 관련 문서
- [ADR-0009](adr-0009-agentic-workflow.md), [ADR 인덱스](../README.md)
- `../../meta/github-workflow.md`
