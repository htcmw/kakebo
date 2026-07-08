# AGENTS.md — kakebo (couplebudget)

AI 에이전트·기여자를 위한 프로젝트 공통 지침. (2026 모노레포+AI 관행, 스펙 주도 개발)

## 이 프로젝트는

로컬 우선 신혼부부 가계부 앱. 은행/카드 export 파일을 import해 두 사람의 가계를 합산 관리. 데이터 정본은 **로컬**, 서버는 백업용(Phase 2). 방법론은 **AI-DLC**(Inception → Construction → Operations).

## 단일 진실원 (Source of Truth)

- **`docs/`** 가 스펙·결정의 정본이다. 코드보다 상위. 무엇을 만들지는 여기서 확인한다.
- 결정은 `docs/decisions/`의 **ADR**로 남긴다(시간순 불변 로그). 새 결정은 새 ADR.
- `docs/00-overview/README.md`가 문서 인덱스.

## 작업 방식 (에이전틱 워크플로 · ADR-0009)

루프: **의도(사람) → 계획 → 실행(에이전트) → 검증(사람/verifier) → 기록**. 스펙 없이 큰 구현을 시작하지 않고, 결정이 바뀌면 코드보다 먼저 문서(ADR/요구사항)를 갱신한다. 상세: `docs/02-construction/06-agentic-workflow.md`.

**오케스트레이션**: 범위가 분리되면 역할별 서브에이전트(`.claude/agents/`)로 나눠 실행한다 — `spec-writer`(docs), `frontend-dev`(frontend), `backend-dev`(backend), `verifier`(검증). 작은 변경은 단일 에이전트로(비례 적용).

**검증 게이트 (Definition of Done)**: FR 인수조건 충족 + 스펙↔코드 드리프트 없음 + 커밋 컨벤션(`Refs:`) + 새 결정은 ADR + verifier/사람 리뷰 통과. 이걸 만족해야 "완료".

## 기술 선택 근거

모든 기술 선택은 **왜 골랐는지**를 문서로 남긴다(UI/프론트/백엔드 각각). ADR-0010(UI)·0011(프론트엔드)·0012(백엔드) 및 `docs/02-construction/05-repo-and-stack-2026.md` 참조.

## 개발 프로세스·이력

프로세스 정의는 `docs/meta/development-process.md`, 진행 이력은 `docs/00-overview/development-log.md`.

## 레포 구조

```
docs/       스펙·ADR·설계 (정본)
designs/    UI/UX 목업·와이어프레임 (designs/ui-mockup.html)
frontend/   Expo 앱 (iOS/Android/Web) — Phase 1
backend/    서버(백업/복원) — Phase 2
.claude/skills/  프로젝트 스킬
```

## 커밋 규칙

- `.claude/skills/commit-conventions` 를 따른다: `type(scope): subject` + 한국어 subject + `Refs: ADR-xxxx, FR-xxx` footer.
- 한 커밋 = 한 관심사. 단계별로 쪼개 커밋.

## 핵심 결정 (요약, 상세는 ADR)

- 자동연동 미사용, 수동 export→import (ADR-0001)
- 카드 이용내역=지출 단일 원천, 정산은 이체 / 내부·외부 구분 (ADR-0004, 0005)
- 할부 두 관점(구매시점/월청구) (ADR-0006)
- 로컬 우선 + S3 백업, 인증은 서버 쓸 때만 (ADR-0007, 0008)

## 스택 방향 (제안, 미확정)

Expo(React Native, iOS/Android/Web 단일 코드베이스) + 로컬 SQLite. 상세: `docs/02-construction/05-repo-and-stack-2026.md`.
