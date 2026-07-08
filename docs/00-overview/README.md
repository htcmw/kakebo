# kakebo (couplebudget) — 문서 저장소

신혼부부 가계부 앱의 기획·설계 문서 저장소입니다. 방법론은 **AI-DLC**(Inception → Construction → Operations)를 따릅니다.

이 트리는 레포에서 관리하며, 정본은 각 phase 폴더에 한 벌만 둡니다. (드라이브에서 로컬 git 관리로 전환됨.)

## 구조

```
docs/
  00-overview/      이 안내
  01-inception/     비전, 요구사항, 유저 스토리
  02-construction/  아키텍처, 데이터 모델, API, UI 설계, 테스트
  03-operations/    배포, 런북
  decisions/        ADR (결정 로그, 시간순 불변)
  meta/             작성 규칙
  views/            범주별 인덱스(링크만, 내용 복제 금지)
```

## 문서 상태

| 문서 | 위치 | 상태 |
| :-- | :-- | :-- |
| 제품 비전서 | (레포 미포함) | ✅ 확정 v0.2 · 드라이브 확정본 |
| 요구사항 명세 | (레포 미포함) | ✅ 확정 v1.0 · 드라이브 확정본 |
| 요구사항 델타 — 계좌·카드·이체·할부 | `01-inception/02a-requirements-accounts-cards.md` | 🟢 신규 (본 세션) |
| 아키텍처 (로컬 우선) | `02-construction/01-architecture.md` | 🟡 초안 |
| 데이터 모델 | `02-construction/02-data-model.md` | 🟡 초안 |
| 이체 매칭 규칙 (내부/외부 판별) | `02-construction/03-transfer-matching.md` | 🟡 초안 |
| UI 설계 | `02-construction/04-ui-design.md` | 🟡 초안 (목업 참조) |
| 레포 구조·스택·2026 트렌드 | `02-construction/05-repo-and-stack-2026.md` | 🟡 초안 |
| 에이전틱 개발 워크플로 | `02-construction/06-agentic-workflow.md` | 🟢 활성 규칙 |
| 개발 프로세스 (정의) | `meta/development-process.md` | 🟢 활성 규칙 |
| 개발 진행 이력 | `00-overview/development-log.md` | 🟢 유지 |
| UI 목업 (인터랙티브) | `../designs/ui-mockup.html` | 🟢 P0 전 화면 |

## 결정 로그 (ADR)

결정은 `decisions/` 아래 **카테고리 폴더**로 구조화되어 있다(폴더 트리로 성격을 바로 확인). 폴더: `01-product-and-data` / `02-finance-logic` / `03-architecture-and-auth` / `04-tech-stack` / `05-process-and-docs`. 폴더 안내와 관계도는 **[decisions/README](../decisions/README.md)**, 정본은 각 폴더의 `adr-XXXX-*.md`.

## 관리 원칙 (요약)

1. 정본은 phase 폴더에 하나만. `views/`·`decisions/`는 링크/기록.
2. 파일명은 영문 `NN-kebab-name`, 내용은 한국어 가능.
3. 버전은 파일명이 아니라 문서 상단 상태 필드 + 하단 변경 이력으로.
4. 코드 밀착 문서(데이터 모델·API·테스트)는 Construction에서 레포로 수렴, `CLAUDE.md`는 레포 루트.
5. 커밋 메시지는 `.claude/skills/commit-conventions` 규칙(Conventional Commits + 추적성 footer)을 따른다.
