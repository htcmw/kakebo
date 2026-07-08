# 개발 프로세스 (정의)

| 항목 | 내용 |
| :-- | :-- |
| 문서 버전 | v0.1 |
| 작성일 | 2026-07-08 |
| 상태 | 🟢 활성 규칙 |

kakebo를 "어떻게 만드는가"의 정본. 방법론·워크플로·규칙을 한 곳에서 연결한다(내용은 각 정본 문서를 링크, 복제하지 않음 — ADR-0003).

## 1. 방법론: AI-DLC

Inception(비전·요구사항·유저스토리) → Construction(아키텍처·데이터·UI·구현·테스트) → Operations(배포·운영). 짧은 사이클(bolt)로 진행.

## 2. 단일 진실원

- 스펙·설계 정본 = `docs/` (SDD). 결정 = `docs/decisions/` ADR(시간순 불변).
- 인덱스 = `docs/00-overview/README.md`. 에이전트 지침 = `AGENTS.md`.

## 3. 작업 루프 (에이전틱 · ADR-0009)

의도(사람) → 계획 → 실행(에이전트) → 검증(verifier/사람) → 기록. 상세: [`../02-construction/06-agentic-workflow.md`](../02-construction/06-agentic-workflow.md).

- 범위 분리 시 서브에이전트(`.claude/agents/`)로 오케스트레이션.
- "완료"는 Definition of Done(인수조건·드리프트·커밋·ADR·리뷰) 통과 시.

## 4. 결정 기록

기술·아키텍처·제품 결정은 **ADR**로 남긴다. 기술 선택은 "왜 골랐는지"를 반드시 포함(ADR-0010~0012, 그리고 `../02-construction/05-repo-and-stack-2026.md`).

## 5. 버전관리·커밋

- 한 커밋 = 한 관심사, 단계별 커밋. 규칙: [`.claude/skills/commit-conventions`](../../.claude/skills/commit-conventions/SKILL.md).
- 형식 `type(scope): subject` + `Refs: ADR-xxxx, FR-xxx`.

## 6. 검증

FR 인수조건 → 테스트/체크로 연결. 스펙↔코드 드리프트 감시. 검증 통과 전엔 미완료.

## 7. 문서 규칙

파일명 영문 `NN-kebab`, 내용 한국어 가능. 정본은 phase 폴더 한 벌(ADR-0003). 진행 이력은 [`../00-overview/development-log.md`](../00-overview/development-log.md).

### 변경 이력
- **v0.1 (2026-07-08)**: 최초. AI-DLC·에이전틱 워크플로·커밋·검증·문서 규칙을 프로세스로 통합.
