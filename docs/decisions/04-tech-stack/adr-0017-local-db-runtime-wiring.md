# ADR-0017: 로컬 DB 런타임 배선 — expo-sqlite 네이티브 우선, 웹(OPFS) 후속

| 항목 | 내용 |
|------|------|
| 상태 | ✅ Accepted |
| 날짜 | 2026-07-16 |
| 단계 | Construction |
| 이슈 | #26 |

## 맥락 (Context)

#26 스캐폴드에서 #25의 Drizzle 스키마([`schema.ts`](../../../frontend/db/schema.ts))를 앱에 **실제로 배선**해야 한다. ADR-0011은 로컬 정본 저장을 **expo-sqlite(네이티브) / SQLite WASM+OPFS(웹)** 로 동일하게 두기를 요구한다. 여기서 세 가지를 정해야 했다: 런타임 드라이버, 마이그레이션 실행 방식, 웹 지원 시점.

웹 SQLite(WASM+OPFS)는 COOP/COEP 헤더·wasm 에셋 배선·별도 마이그레이션 실행 경로 검증이 필요해, 스캐폴드 단계에서 함께 처리하면 리스크·범위가 커진다.

## 결정 (Decision)

1. **런타임 드라이버 = expo-sqlite(네이티브)** + `drizzle-orm/expo-sqlite`. 연결 시 `PRAGMA foreign_keys = ON`. (`frontend/db/client.ts`)
2. **마이그레이션 = `drizzle-kit generate` 산출물 + `useMigrations` 훅**으로 앱 시작 시 적용하고, 준비 전 라우트 렌더를 **게이팅**(준비 중/실패 UI). `migrate()` 직접 호출 대신 공식 권장 패턴.
3. **`v_ledger` 뷰**(spec §5)를 초기 마이그레이션에 포함.
4. **웹(OPFS) SQLite = 이번 스코프 보류.** `client.web.ts` 플랫폼 분기 여지만 구조로 열어두고, 배선은 **후속 이슈**로 분리한다. → **ADR-0011의 웹 동일성 요구를 일시적으로 부분 미충족**(결정 번복 아님, 구현 시점 분리).

## 근거

- 부부의 일상 사용은 모바일 중심(ADR-0011) → 네이티브에서 먼저 끝에서 끝까지 동작시키는 것이 가치 우선.
- 웹 SQLite는 헤더/에셋/실행경로라는 별개 리스크 → 스캐폴드에서 분리해야 각 단계가 얇은 슬라이스로 유지(로드맵 원칙).
- `useMigrations`는 `success/error` 상태를 UI에 직결해 "로컬 DB 준비/실패" 화면과 정합.

## 결과 (Consequences)

- (+) 네이티브(iOS/Android)에서 로컬 SQLite가 즉시 동작하고 마이그레이션이 자동 적용된다.
- (−) **웹에서는 DB가 열리지 않는다**(스코프 밖). 웹 데모는 후속 배선 전까지 제한.
- (→) **후속 이슈**: 웹(OPFS) 드라이버 배선 + `client.web.ts` 플랫폼 분기. 완료 시 ADR-0011 웹 동일성 충족.

## 관련 문서

- [SQLite 스키마 스펙](../../02-construction/07-sqlite-schema.md) §5·§6
- ADR-0007(로컬 정본), **ADR-0011(프론트 스택 — 웹 동일성, 본 ADR이 시점 분리)**, ADR-0015(스키마 내용)

## 변경 이력

- **v0.1 (2026-07-16)**: 최초. #26 스캐폴드에서 로컬 DB 런타임 배선(expo-sqlite 네이티브 + `useMigrations` + `v_ledger`) 확정, 웹 OPFS는 후속으로 분리.
