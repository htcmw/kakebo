# SQLite 물리 스키마 (DDL 확정)

| 항목 | 내용 |
| :-- | :-- |
| 문서 버전 | v0.1 |
| 작성일 | 2026-07-16 |
| 단계 | Construction |
| 상태 | 🟢 확정 |
| 이슈 | #25 (SQLite 스키마 DDL 확정) |
| 선행 | [데이터 모델](02-data-model.md), [이체 매칭](03-transfer-matching.md), [계좌·카드 요구사항](../01-inception/02a-requirements-accounts-cards.md) |
| 근거 ADR | **0015(금액·통화 표현, 정본 결정)**, 0004·0005·0006·0007, 0011(Expo/expo-sqlite), 0013(오픈·무료) |

논리 데이터 모델(02-data-model.md)을 **로컬 SQLite 물리 스키마**로 확정한 정본. 구현체는 **Drizzle ORM**(`frontend/db/schema.ts`)이며, 이 문서는 그 **타입 매핑·불변식·결정 근거**를 서술한다.

> 정본은 로컬(ADR-0007). 이 스키마는 네이티브(expo-sqlite)와 웹(SQLite WASM + OPFS) **양쪽 동일** 적용을 전제로, 표준 SQLite + json1 범위만 사용한다(확장 의존 없음).

---

## 1. 도구·저장 형식 결정

| 결정 | 선택 | 근거 |
| :-- | :-- | :-- |
| ORM/스키마 | **Drizzle ORM** (스키마=TypeScript) | 타입 안전 쿼리 + `drizzle-kit` 마이그레이션, expo-sqlite 1급 지원, MIT 무료(ADR-0013) |
| 스키마 정본 | `frontend/db/schema.ts` | 코드가 진실원, SQL 마이그레이션은 `drizzle-kit generate` 파생물 |
| 마이그레이션 | `drizzle-kit` + SQLite `user_version` | 버전 관리. **배선은 #26 스캐폴드 경계** |

### 논리 → SQLite 타입 매핑

SQLite엔 uuid·enum·array·numeric·timestamptz·bool 타입이 없어 전부 번역한다.

| 논리 타입 | SQLite/Drizzle | 비고 |
| :-- | :-- | :-- |
| `uuid` (PK/FK) | `text` | 앱에서 UUID v4 생성 |
| `timestamptz` | `text` (ISO8601 UTC) | 기본값 `strftime('%Y-%m-%dT%H:%M:%fZ','now')`, 정렬·비교 가능 |
| `date` | `text` `'YYYY-MM-DD'` | |
| 월 (month) | `text` `'YYYY-MM'` | 예산·할부 시작월 |
| 금액 | `integer` (최소단위) | §2 참조 — 부동소수 오차 차단 |
| `enum` | `text` + `CHECK(...)` | Drizzle `{ enum: [...] }` 로 TS 타입, 안전 핵심 컬럼은 CHECK 병행 |
| `text[]` | `text` (JSON, json1) | 예: `accounts.aliases`, 기본값 `'[]'` |
| `bool` | `integer` `{ mode: 'boolean' }` | 0/1 |

---

## 2. 금액·통화·라운딩 (핵심 결정)

> 결정 맥락: 앱은 한화가 기본이나 **해외결제(USD 등)** 가 발생한다. "달러로 얼마, 한화로 얼마 나갔는지" 둘 다 남기되, 집계는 단순하게 유지하고, **라운딩은 숨기지 않는다.** 이 절의 결정 정본은 **[ADR-0015](../decisions/02-finance-logic/adr-0015-money-currency-representation.md)** 이며, 이 문서는 그 물리 구현이다.

### 2.1 최소단위 정수 저장
모든 금액은 **해당 통화의 최소단위(minor unit) `integer`** 로 저장한다.

| 통화 | 소수 자리 | 최소단위 | 사람이 보는 값 → 저장값 |
| :-- | :-: | :-- | :-- |
| KRW | 0 | 원 | 68,000원 → `68000` |
| USD | 2 | 센트 | $50.00 → `5000` |
| JPY | 0 | 엔 | ¥1,200 → `1200` |

- **이유**: `REAL`(부동소수)은 `0.1+0.2 ≠ 0.3` 오차가 누적된다. 최소단위 정수는 정확하다.
- **소수 자릿수는 컬럼에 저장하지 않는다.** `currency`(ISO 4217) 코드에서 앱 계층이 파생한다. 매핑 상수(KRW=0, USD=2, JPY=0 …)는 앱의 통화 유틸에 둔다.

### 2.2 세 필드로 통화 표현 (null 없음)
거래는 통화 관련 **세 값을 항상 채운다**(nullable 금지 — 소비 측 분기·버그 제거).

| 컬럼 | 의미 | 국내 12,000원 | 해외 $50 |
| :-- | :-- | :-- | :-- |
| `amount` | 원거래 통화의 금액(최소단위) | `12000` | `5000` |
| `currency` | 원거래 통화(ISO 4217) | `KRW` | `USD` |
| `base_amount` | 기본통화(한화) 청구금액(최소단위) | `12000` | `68000` |

- **집계는 언제나 `base_amount`(기본통화) 하나로** 합산한다 → MVP는 단일 통화 로직으로 단순.
- **해외 판별** = `currency <> household.base_currency` (null 체크 아님).
- **환율은 저장하지 않는다.** 표시가 필요하면 `base_amount / amount`로 파생하며, 이 파생 환율로 금액을 **역산하지 않는다**(두 정수가 진실원).

### 2.3 라운딩 적시 — `base_amount_source`
`base_amount`가 어디서 왔는지를 **항상 기록**해, 라운딩 발생 여부를 감사 가능하게 한다.

| 값 | 의미 | 라운딩 |
| :-- | :-- | :-- |
| `domestic` | 국내 거래 (`amount == base_amount`, 환산 없음) | 없음 |
| `statement` | 카드 명세서의 **실제 청구액을 그대로 기록** | 없음(카드사 확정값) |
| `converted` | 앱이 환율로 계산 | **발생** — 이 값이 곧 "환산·라운딩됨"의 적시 |

**라운딩 규칙(명문)**: `converted` 산출 시 기본통화의 최소단위로 **반올림(round half up)** 한다. `statement`·`domestic`은 라운딩을 적용하지 않는다. (규칙을 하나로 고정 — 구현은 이 문서를 정본으로 따른다.)

---

## 3. 테이블 (12) · 관계

```
households 1─N members
households 1─N accounts        cards N─1 accounts(결제계좌)
households 1─N cards
households 1─N categories
households 1─N transactions    transactions N─0..1 categories
households 1─N budgets         budgets N─1 categories
households 1─N transfer_rules
households 1─N import_batches
transactions 1─0..1 installments        (installments.parent_transaction_id, UNIQUE)
transactions ─ transfer_links ─ transactions/cards   (이체 짝)
mapping_profiles  (전역 or 가계)
```

### 데이터 모델과의 차이(구현 결정)
| 항목 | 데이터 모델(논리) | 물리 스키마 결정 | 이유 |
| :-- | :-- | :-- | :-- |
| 할부 연결 | Transaction`.installment_id` ↔ Installment`.parent_transaction_id` (양방향) | **단방향** `installments.parent_transaction_id` (UNIQUE) 만 유지 | SQLite 순환 FK 회피, 1:0..1 표현 충분 |
| `sharing`(enum+member) | 단일 필드 | `sharing_scope` + `sharing_member_id` **분해** | 정규화 |
| 금액 | `numeric` 부호 있음 | `integer` 최소단위 + `currency` + `base_amount` + `base_amount_source` | §2 |
| `mapping_profile.scope` | 전역/가계 | `scope` enum + `household_id` nullable(전역 시 null) | MVP 전역만(결정 D) |

---

## 4. DB로 강제하는 불변식

| 불변식 | 강제 수단 | 근거 |
| :-- | :-- | :-- |
| 중복 적재 차단 | `transactions.dedup_key` **UNIQUE** | 요구사항 결정 B |
| 이체는 카테고리·공동개인 없음 | `CHECK(kind<>'transfer' OR (category_id IS NULL AND sharing_scope IS NULL))` | ADR-0004/0005 |
| kind 값 집합 | `CHECK(kind IN ('expense','income','transfer'))` | |
| base_amount 출처 집합 | `CHECK(base_amount_source IN ('domestic','statement','converted'))` | §2.3 |
| 카테고리 kind 집합 | `CHECK(kind IN ('expense','income','fee'))` | |
| 각 출금은 한 번만 이체 | `transfer_links.out_transaction_id` **UNIQUE** | 매칭규칙 §4 유일성 |
| 예산 = 카테고리×월 유일 | `(category_id, month)` **UNIQUE** | FR-BG |
| 할부 1:0..1 | `installments.parent_transaction_id` **UNIQUE** | ADR-0006 |
| 참조 무결성 | `PRAGMA foreign_keys = ON` (연결마다) | SQLite 기본 OFF |

> 그 외 enum(예: source_kind, counterparty_kind, transfer status)은 Drizzle `{ enum }` TS 타입으로 강제하고, DB CHECK는 안전 핵심(kind·base_amount_source·counterparty_kind)에 집중한다.

### 인덱스 (집계 성능)
`transactions`: `(kind, occurred_on)`, `(category_id)`, `(source_kind, source_id)`, `(counterparty_kind, counterparty_id)`, `(import_batch_id)`, UNIQUE `dedup_key`.
그 외 각 테이블의 `household_id`, `cards.settlement_account_id`, `transfer_links(in_ref_kind, in_ref_id)`.

---

## 5. 이중집계 방지 뷰 — `v_ledger`

지출/수입 집계는 **항상** `kind IN ('expense','income')` 만 대상으로 한다(ADR-0004). 이 규칙을 쿼리마다 반복하지 않도록 **뷰로 못박는다**. (마이그레이션에 포함 — #26)

```sql
CREATE VIEW v_ledger AS
SELECT
  id, household_id, occurred_on,
  base_amount, currency, amount,
  kind, category_id, sharing_scope, sharing_member_id,
  source_kind, source_id
FROM transactions
WHERE kind IN ('expense', 'income');   -- transfer는 원천 제외
```

- 대시보드·예산·분담 합산은 `v_ledger.base_amount`(기본통화)를 쓴다.
- 할부 '월 청구' 관점은 `transactions`에 저장하지 않고 `installments` 스케줄에서 **파생**한다(ADR-0006). '구매 시점' 관점은 원거래 `base_amount`.

---

## 6. 열린 항목 (후속)

- **계좌번호 해시 알고리즘·솔트**: 원문 비저장(NFR-PRV). 알고리즘·솔트는 import 파이프라인 구현(#29 이후) 확정. (데이터 모델 §4)
- **웹(OPFS) 드라이버 배선**: Drizzle의 expo-sqlite 통합은 네이티브 1급. 웹 SQLite WASM+OPFS 연결·마이그레이션 실행 검증은 **#26 스캐폴드**에서. (ADR-0011 웹 동일성)
- **통화 최소단위/포맷 유틸**: `currency → 소수자리` 매핑 상수·표시 포맷터는 앱 유틸로 구현.
- **RLS/행 격리**: Phase 2 서버 한정(로컬 범위 밖).

---

### 변경 이력
- **v0.1 (2026-07-16)**: 최초 확정. 논리 모델 → Drizzle SQLite 스키마. 금액=최소단위 정수 + 통화 3필드(null 없음) + `base_amount_source` 라운딩 적시, 불변식 CHECK/UNIQUE, `v_ledger` 뷰. (#25)
