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

| # | 제목 | 상태 |
| :-- | :-- | :-- |
| 0001 | 금융 자동연동 미사용, 수동 export→import | ✅ Accepted |
| 0002 | MVP 인증은 이메일 매직링크 | ⚠️ 부분 대체 (→0008) |
| 0003 | 문서 구조 — phase 정본 + views 인덱스 | ✅ Accepted |
| 0004 | 카드 이용내역 = 지출의 단일 원천, 정산은 이체 | ✅ Accepted |
| 0005 | 내부 이동 vs 외부 지출 구분 | ✅ Accepted |
| 0006 | 카드 할부 — 두 관점(구매시점/월청구) 제공 | ✅ Accepted |
| 0007 | 로컬 우선 데이터 관리, 서버는 백업(S3 단일 압축) | ✅ Accepted |
| 0008 | 인증은 서버(백업/동기화) 사용 시에만 | ✅ Accepted |
| 0009 | 에이전틱 개발 워크플로 채택(에이전틱·오케스트레이션·검증) | ✅ Accepted |
| 0010 | UI 스택(NativeWind·디자인 시스템) | ✅ Accepted |
| 0011 | 프론트엔드 코어 스택 (Expo) | ✅ Accepted |
| 0012 | 백엔드 스택 (Phase 2 · S3 백업) | ✅ Accepted |

> 0001~0003의 본문은 기존 확정본(드라이브)에 있으며 이 레포에는 재작성하지 않았습니다. 0004~0008은 본 세션에서 신규 작성했습니다.

## 관리 원칙 (요약)

1. 정본은 phase 폴더에 하나만. `views/`·`decisions/`는 링크/기록.
2. 파일명은 영문 `NN-kebab-name`, 내용은 한국어 가능.
3. 버전은 파일명이 아니라 문서 상단 상태 필드 + 하단 변경 이력으로.
4. 코드 밀착 문서(데이터 모델·API·테스트)는 Construction에서 레포로 수렴, `CLAUDE.md`는 레포 루트.
5. 커밋 메시지는 `.claude/skills/commit-conventions` 규칙(Conventional Commits + 추적성 footer)을 따른다.
