# ADR-0018: expo-sqlite 웹 SELECT 버그 — patch-package로 수정

| 항목 | 내용 |
|------|------|
| 상태 | ✅ Accepted |
| 날짜 | 2026-07-22 |
| 단계 | Construction |
| 이슈 | #36 |

## 맥락 (Context)

#35(웹 OPFS 배선) 완료 후, `expo-sqlite ~57.0.1`의 **웹 동기 워커 채널**에 결과 길이 인코딩 결함이 드러났다. `WorkerChannel.sendWorkerResult`가 결과 길이를 SharedArrayBuffer에 **1바이트로만** 기록(`resultArray.set(new Uint32Array([length]))` — Uint8Array로의 원소단위 변환) → **직렬화 결과가 ≥256바이트인 SELECT가 웹에서 `Unexpected end of JSON input`으로 깨진다.** 쓰기·마이그레이션·소량 count는 안전.

Drizzle의 expo-sqlite 드라이버는 sync 전용(`getAllSync`)이라 이 경로를 그대로 탄다. **거래 목록(FR-TX-01)** 등 대용량 read가 필요한 Bolt 1 전에 방침이 필요했다. 후보: (a) upstream 수정 대기, (b) patch-package로 수정, (c) 웹 대용량 read를 async 경로로 우회.

## 결정 (Decision)

**patch-package로 upstream 버그를 직접 수정한다.**

- `node_modules/expo-sqlite/web/WorkerChannel.ts`의 길이 기록을 **4바이트 정수로** 고친다 — 읽기 측(`new Uint32Array(resultArray.buffer, 0, 1)[0]`)과 대칭:
  ```
  - resultArray.set(new Uint32Array([length]), 0);
  + new Uint32Array(resultArray.buffer, 0, 1)[0] = length;
  ```
- `patch-package`(+ `postinstall-postinstall`)를 devDependency로 추가하고 `postinstall: "patch-package"`로 **설치 시 자동 재적용**. 패치는 `frontend/patches/expo-sqlite+57.0.1.patch`로 레포에 커밋한다.

### 기각한 대안
- **(a) 대기**: 언제 고쳐질지 불확실(웹 sync 경로라 우선순위 낮음). 그때까지 웹 대용량 read 불가 → Bolt 1 거래 목록이 막히고, count 기반 임시 우회를 계속 쌓다 걷어내야 함(throwaway).
- **(c) async 우회**: 웹 읽기를 Promise로 바꾸면 로딩 상태 + **변경 알림(반응성) 계층**이 필요해지고, 네이티브(sync)/웹(async)로 데이터 계층이 갈라진다. 버그 하나 피하려다 구조 비용이 큼.

## 근거

- 버그가 명확하고(길이 1→4바이트) 수정이 **한 줄**이라 정확·저위험.
- **sync 경로를 유지** → 네이티브·웹 동일 코드, 반응성/알림 계층 불필요(ADR-0011/0017 웹 동일성 유지).
- `patches/*.patch`가 "무엇을 왜 고쳤나"를 기록 → 추적 가능. upstream이 고치면 SDK 올리고 patch 삭제. patch가 안 맞으면 install 시 **경고로 감지**(조용히 깨지지 않음).
- `patch-package`는 MIT·무료, **dev 의존성**(사용자 번들에 안 나감) → ADR-0013(오픈·무료·과금유도 없음) 부합.

## 결과 (Consequences)

- (+) 웹에서 대용량 SELECT 정상 — 거래 목록 등 실기능이 웹에서 동작.
- (+) 네이티브 불변(웹 전용 경로만 수정), sync 데이터 계층 단순 유지.
- (−) 유지관리 포인트 1개 — expo-sqlite SDK 업그레이드 시 patch 재확인/제거 필요.
- (−) dev 의존성 2개 추가(`patch-package`, `postinstall-postinstall`).
- (→) upstream 수정 반영 시 이 ADR 변경 이력에 patch 제거를 기록.

## 관련 문서

- ADR-0017(로컬 DB 런타임 배선 — 웹 OPFS), ADR-0011(웹 동일성), ADR-0013(오픈·무료 원칙)
- #35(웹 배선에서 버그 진단), #36(본 수정)
- `frontend/patches/expo-sqlite+57.0.1.patch`

## 변경 이력

- **v0.1 (2026-07-22)**: 최초. expo-sqlite ~57 웹 동기 채널 길이 인코딩 버그를 patch-package로 수정(4바이트 기록), postinstall 자동 재적용. 대기·async 우회 기각. 홈 화면 대용량 SELECT 렌더로 검증.
