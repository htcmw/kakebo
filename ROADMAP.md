# 로드맵 (Roadmap)

kakebo(couplebudget) 개발 로드맵. 애자일(AI-DLC 반복 bolt) 기준. 각 단위는 GitHub **Milestone**과 1:1로 매핑되고, 세부 작업은 **Issues**, 진행 현황은 **Projects 보드**로 관리한다. (사용법: [`docs/meta/github-workflow.md`](docs/meta/github-workflow.md))

## 큰 그림

```mermaid
flowchart LR
  B0["Bolt 0\n기반: 스캐폴드·로컬 DB"] --> B1["Bolt 1\nImport 수직 슬라이스"]
  B1 --> B2["Bolt 2\n거래·분류"] --> B3["Bolt 3\n대시보드"] --> B4["Bolt 4\n예산"] --> B5["Bolt 5\n멀티기관·이체/할부 고도화"]
  B5 --> P2["Phase 2\n서버 백업·공유"]
```

## Phase 1 — 로컬 MVP (무인증)

| Milestone | 목표 | 핵심 산출물 | 상태 |
| :-- | :-- | :-- | :-- |
| **Bolt 0 — 기반** | 앱 뼈대와 로컬 저장소 | Expo 스캐폴드, SQLite 스키마(DDL), 요구사항 baseline 통합 | ⬜ |
| **Bolt 1 — Import 코어** | 1개 기관 CSV → 정규화 → 저장 → 목록 (수직 슬라이스, 최대 리스크 검증) | import 파서·인코딩·정규화·중복, 거래 목록 | ⬜ |
| **Bolt 2 — 거래·분류** | 목록·검색·필터, 카테고리, 공동/개인 태깅 | FR-TX, FR-CT, FR-SH | ⬜ |
| **Bolt 3 — 대시보드** | 합산 요약·분담·카테고리·추이 | FR-DB | ⬜ |
| **Bolt 4 — 예산** | 카테고리별 예산·소진율 | FR-BG | ⬜ |
| **Bolt 5 — 확장·고도화** | 다기관 매핑, 이체 판별·할부 두 관점 고도화 | FR-IM 확장, FR-AC-04, FR-TX-04 | ⬜ |

## Phase 2 — 서버 (백업·공유)

| Milestone | 목표 | 핵심 산출물 | 상태 |
| :-- | :-- | :-- | :-- |
| **Phase 2 — 백업/복원** | S3-호환 스냅샷 백업, 인증 | 백업 API, 인증, 암호화 | ⬜ |
| **Phase 2 — 공유(향후)** | 2인 실시간 동기화 | sync engine 검토 | ⬜ |

## 원칙

- 각 Bolt는 **끝에서 끝까지 동작하는 얇은 슬라이스**를 목표로 한다(수직 슬라이스).
- Bolt 1(Import)을 최우선 — 제품의 심장이자 최대 기술 리스크라 먼저 검증한다.
- 실제 은행/카드 **export 파일 샘플**이 확보되는 기관부터 매핑을 추가한다.

> 상태(⬜/🟡/✅)는 Milestone 진행에 맞춰 갱신. 세부 백로그는 [`docs/meta/role-deliverables.md`](docs/meta/role-deliverables.md) → GitHub Issues로.
