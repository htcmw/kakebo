# 레포 구조 · 기술 스택 · 2026 트렌드 검토

| 항목 | 내용 |
| :-- | :-- |
| 문서 버전 | v0.1 (초안) |
| 작성일 | 2026-07-08 |
| 단계 | Construction |
| 상태 | 🟡 초안 (검토·결정용) |
| 근거 | ADR-0007(로컬 우선), ADR-0008(인증 서버한정) |

"요즘 바이브 코딩 트렌드"와 "네이티브 vs 웹" 커뮤니티 추세(2026 상반기)를 조사해 이 프로젝트에 맞는 레포 구조·스택을 제안한다. 원문 출처는 문서 하단.

---

## 1. 2026 상반기 개발 트렌드 요약

### (1) 바이브 코딩 → 스펙 주도 개발(SDD)로 성숙
- AI 코딩은 주류가 됐다: 2026.1 기준 개발자 90%가 AI 도구를 상시 사용, **전체 코드의 41%가 AI 생성**. IDE형 어시스턴트(Claude Code, Cursor)가 시장의 약 절반.
- 그러나 "바이브 코딩"의 부작용(의도에서 드리프트, 없는 API 환각, 규모가 커지면 붕괴)이 드러나며, **스펙 주도 개발(Spec-Driven Development)** 이 그 대응으로 부상. 핵심 원칙: **버전관리되는 스펙이 코드보다 상위의 단일 진실원**이고, 스펙 → 계획 → 원자적 태스크 → 코드 순으로 간다.
- 실천: **스펙 파일 자체를 레포에 커밋**한다(에이전트가 git diff/blame으로 변경을 이해). GitHub Spec Kit, AWS Kiro, OpenSpec, Claude Code 등 주요 도구가 각자 SDD 방식을 탑재.
- → **우리 AI-DLC(비전·요구사항·ADR·설계를 문서로 커밋)는 이미 SDD 정렬**. 방향이 맞다.

### (2) 모노레포 + AI 에이전트
- 에이전트 워크플로는 **예측 가능한 구조와 단일 컨텍스트**에서 잘 동작. 최상위에 표준 **`AGENTS.md`**(에이전트용 프로젝트 지침)를 두고, 하위 디렉터리를 명확히 나누는 모노레포가 유리.
- "AI와 모노레포는 서로를 끌어올린다" — 모노레포가 통합 컨텍스트를 주고, AI가 복잡도를 탐색.

### (3) 네이티브 vs 웹 (크로스플랫폼)
- **Expo(React Native)가 사실상 표준**으로 성숙. 2026: SDK 55 / RN 0.83에서 **New Architecture 필수**(레거시 제거), **Expo Router가 앱 프레임워크화**(태블릿 2-pane용 SplitView 등), OTA는 Hermes 바이트코드 디핑으로 효율화.
- **웹+네이티브 단일 코드**: 과거 React Native for Web(RNW)은 유지보수 단계로, 스포트라이트가 **React Strict DOM(RSD)** 로 이동. "웹으로 시작해 재작성 없이 네이티브로 확장" 흐름.
- **Tauri**: v2로 **모바일까지 6개 플랫폼** 지원, Rust 백엔드 + OS WebView(번들 2.5~10MB로 Electron 대비 10~100배 작음). 데스크톱 중심·경량 앱에 강점(GitHub ~104K stars, YoY +35%).
- 선택 기준(커뮤니티 합의): **팀 스킬셋**(TS/React 다수 → RN, Kotlin → KMP, 신규팀 → Flutter)과 **공유 깊이**(UI 공유: Flutter/RN, 로직만: KMP, 데스크톱: Tauri/Electron).

### (4) 로컬 우선(local-first)
- 2026은 "**sync engine의 해**"(ElectricSQL·PowerSync·Yjs 등 프로덕션급 등장). 브라우저에서 **SQLite(WASM) + OPFS**가 크로스브라우저로 가능해져 웹도 진짜 로컬 DB 확보.
- 단, 커뮤니티 조언: "**MVP엔 sync engine이 대개 불필요**"(2015년 스타트업에 쿠버네티스 불필요와 같은 비유). 필요할 때 도입.
- → 우리 ADR-0007(로컬 정본) 방향과 일치. 공유(sync)는 정말 필요한 Phase 2에서 도입.

---

## 2. 이 프로젝트 권고

| 주제 | 권고 | 근거 |
| :-- | :-- | :-- |
| 클라이언트 | **Expo (iOS/Android/Web 단일 코드베이스)** | NFR-PLT-01(모바일+웹 반응형) 충족, 기존 웹 목업과 연속, 2026 표준·활발한 생태계 |
| 웹 지원 | Expo + React Strict DOM(또는 당분간 RNW) | 웹으로 시작→네이티브 확장 흐름 |
| 로컬 저장 | **expo-sqlite**(네이티브) / **SQLite WASM + OPFS**(웹) | 로컬 정본(ADR-0007), 관계형 쿼리 유리 |
| 백엔드 | **MVP 없음.** Phase 2에서 S3 백업/복원(서버리스) | ADR-0007/0008, 서버 최소화 |
| 동기화 | MVP 미도입. Phase 2 공유 시 PowerSync/ElectricSQL/Yjs 검토 | "MVP엔 sync engine 불필요" |
| 방법론 | AI-DLC 유지 + **`AGENTS.md` 추가** | SDD·모노레포+AI 트렌드 정렬 |

> 대안: 데스크톱을 1급으로 두고 싶다면 Tauri(경량·Rust)가 후보지만, 부부의 일상 사용이 모바일 중심이고 이미 웹 목업이 있으므로 **Expo가 적합**하다고 판단. 최종 확정은 팀 스킬셋 고려.

---

## 3. 레포 구조 제안 (모노레포)

```
kakebo/
  AGENTS.md            # 에이전트·기여자 공통 지침 (단일 진실원=docs/, 커밋 규칙, SDD 흐름)
  README.md            # 프로젝트 개요
  docs/                # 스펙·ADR·설계 (SDD 단일 진실원) — 현존
  designs/             # UI/UX — 인터랙티브 목업·와이어프레임·디자인 토큰 — 현존
  frontend/            # Expo 앱 (iOS/Android/Web) — Phase 1
  backend/             # 서버(백업/복원) — Phase 2 (MVP엔 골격만)
  .claude/skills/      # 프로젝트 스킬(commit-conventions 등) — 현존
```

- `docs`·`designs`는 이미 있고, 요청대로 **`frontend`·`backend`를 추가**해 4개 축(docs / ui-ux / frontend / backend)을 모두 둔다.
- 최상위 **`AGENTS.md`** 로 에이전트가 규칙·구조·진실원을 한 곳에서 파악하게 한다(2026 모노레포+AI 관행).
- `backend`는 Phase 2 전까지 README·골격만 유지(로컬 우선이므로 MVP엔 서버 없음).

---

## 4. 열린 항목 / 절단선

- Expo 확정 여부(팀 스킬셋), 웹 레이어를 RSD로 갈지 시점.
- 로컬 저장 스키마를 데이터 모델(02) 기반으로 SQLite DDL로 구체화.
- 백업 아카이브 포맷·암호화(아키텍처 문서와 연계).
- 모바일 반응형 화면 설계(별도 단계, NFR-PLT-01).

### 변경 이력
- **v0.1 (2026-07-08)**: 2026 상반기 트렌드(SDD·모노레포+AI·네이티브 vs 웹·로컬 우선) 조사, Expo 기반 스택·모노레포 구조 권고.

---

## 출처

- Keyhole Software — Vibe Coding Trends 2026: https://keyholesoftware.com/vibe-coding-trends-2026/
- Hostinger — Vibe coding statistics 2026: https://www.hostinger.com/blog/vibe-coding-statistics
- Augment Code — What Is Spec-Driven Development: https://www.augmentcode.com/guides/what-is-spec-driven-development
- Microsoft for Developers — Spec-Driven Development, AI-Native Engineering: https://developer.microsoft.com/blog/spec-driven-development-ai-native-engineering
- Addy Osmani — How to write a good spec for AI agents: https://addyosmani.com/blog/good-spec/
- Spectro Cloud — Will AI turn 2026 into the year of the monorepo: https://www.spectrocloud.com/blog/will-ai-turn-2026-into-the-year-of-the-monorepo
- Monorepo Tools — Monorepos & AI: https://monorepo.tools/ai
- Xavor — Expo framework trends for React Native 2026: https://www.xavor.com/blog/expo-framework-trends-for-react-native/
- codenote.net — Cross-Platform Dev Tools Comparison 2026: https://codenote.net/en/posts/cross-platform-dev-tools-comparison-2026/
- Swmansion — React Native in 2026 Trends & Predictions: https://blog.swmansion.com/react-native-in-2026-trends-our-predictions-463a837420c7
- Smashing Magazine — The Architecture of Local-First Web Development: https://www.smashingmagazine.com/2026/05/architecture-local-first-web-development/
- AppScale — Local-First Architecture: CRDTs & Sync Engines: https://appscale.blog/en/blog/local-first-architecture-crdts-sync-engines-offline-first-2026
- RxDB — Why Local-First Software Is the Future: https://rxdb.info/articles/local-first-future.html
