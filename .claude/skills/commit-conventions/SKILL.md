---
name: commit-conventions
description: Standardized git commit messages for the kakebo (couplebudget) project. Use whenever creating a git commit or writing a commit message. Enforces Conventional Commits format `type(scope): subject` with Korean subjects, ADR/FR traceability footers, and splitting work into one-concern commits.
---

# Commit 메시지 컨벤션 (kakebo)

이 레포의 커밋은 아래 표준을 따른다. 커밋을 만들 때마다 이 규칙으로 메시지를 작성한다.

## 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

## 규칙

- **type** (필수, 영문 소문자): `feat` `fix` `docs` `design` `refactor` `test` `chore` `build` `ci` `perf` `style` `revert`
- **scope** (권장, 영문): 변경 범위. 예: `ui` `mockup` `overview` `requirements` `adr` `data-model` `matching` `import` `transactions` `accounts` `budget` `categories` `meta`
- **subject** (필수): 한국어 명령형, 마침표 없음, 50자 이내 권장(최대 72). "무엇을" 요약
- **body** (선택): 왜/무엇을 상세히. 한 줄 72자 이내. 한국어 가능
- **footer** (선택): 추적성·이슈. `Refs: ADR-0004, FR-AC-04` / `BREAKING CHANGE: ...` / `Closes #12`

## 커밋 단위 원칙

- 한 커밋 = 한 관심사(one concern). 문서·기능·리팩터를 한 커밋에 섞지 않는다.
- 단계별로 논리적으로 쪼개 이력을 남긴다. 예: 스캐폴드 → 결정(ADR) → 요구사항 → 설계.
- 이 프로젝트는 추적성을 중시한다. 관련 ADR/FR ID를 footer의 `Refs:`에 남긴다.

## type 가이드

- `feat`: 새 기능·화면·산출물
- `design`: UI/UX 시안·목업 (시각 산출물 강조 시)
- `docs`: 요구사항·ADR·데이터모델·설계 등 문서
- `fix`: 버그 수정
- `refactor`: 동작 변화 없는 구조 개선
- `chore`: 설정·도구·메타(스킬·컨벤션 등)
- `test` `build` `ci` `perf` `style` `revert`: 표준 의미

## 예시

```
docs(adr): 카드 정산을 이체로 처리하는 결정 기록

카드 이용내역을 지출의 단일 원천으로 삼고, 카드대금 인출은
이체로 분류해 이중집계를 방지한다.

Refs: ADR-0004, FR-AC-04
```

```
feat(ui): couplebudget P0 인터랙티브 목업 추가

로그인·대시보드·거래·가져오기·카테고리·예산·계좌카드·설정 등
P0 전 화면 구현. 계좌/카드/이체/할부 개념 반영(웹 데스크톱 우선).

Refs: FR-AU, FR-DB, FR-TX, FR-IM, FR-AC-01~04, FR-TX-04
```
