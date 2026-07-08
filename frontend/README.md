# frontend

couplebudget 클라이언트 앱. **Phase 1(로컬 우선 MVP)** 의 본체.

## 방향 (제안, 미확정)

- **Expo (React Native)** — iOS/Android/Web 단일 코드베이스. (NFR-PLT-01 모바일+웹)
- 웹 레이어: React Strict DOM(또는 당분간 RNW).
- **로컬 정본**: expo-sqlite(네이티브) / SQLite WASM + OPFS(웹). (ADR-0007)
- **인증 없음**: 로컬 사용은 로그인 불필요. (ADR-0008)
- import 파이프라인(CSV/엑셀 파싱·인코딩·정규화·중복·이체 판별)은 클라이언트에서 동작.

## 범위

- UI/UX 정본은 `../designs/ui-mockup.html`, 화면 명세는 `../docs/02-construction/04-ui-design.md`.
- 데이터 모델은 `../docs/02-construction/02-data-model.md`.

## 상태

🟡 아직 스캐폴드 전. 스택 확정(`../docs/02-construction/05-repo-and-stack-2026.md`) 후 초기화 예정.
