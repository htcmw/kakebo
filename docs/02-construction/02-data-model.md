# 데이터 모델 (초안)

| 항목 | 내용 |
| :-- | :-- |
| 문서 버전 | v0.1 (초안) |
| 작성일 | 2026-07-06 |
| 단계 | Construction |
| 상태 | 🟡 초안 |
| 선행 | 요구사항 v1.0, 델타(02a), ADR-0001·0004·0005·0006 |

MVP의 **논리 데이터 모델**입니다. 물리 스키마·저장소 기술은 아키텍처 확정 후 구체화합니다.

> **정본은 로컬**(ADR-0007). 로컬 저장소(예: SQLite)에 이 모델을 두고, 서버는 전체를 압축한 S3 단일 아카이브로 스냅샷 백업만 한다. Postgres/RLS·행 수준 격리(NFR-SEC-02)와 가계 단위 공유는 **Phase 2(서버)** 에 한정된다. 로컬 MVP는 인증이 없고(ADR-0008) 사실상 1인/1기기이므로, 가계-멤버 구조는 확장을 막지 않는 선에서 유지한다.

---

## 1. 개요 (ER)

```
Household 1─N Member
Household 1─N Account
Household 1─N Card         Card N─1 Account (결제계좌)
Household 1─N Category
Household 1─N Transaction  Transaction N─1 Category(옵션)
Household 1─N Budget       Budget N─1 Category
Household 1─N MappingProfile
Household 1─N ImportBatch
Household 1─N TransferRule
Transaction 1─0..1 Installment
Transaction ─ TransferLink ─ Transaction/Card   (이체 짝)
```

핵심 불변식(이중집계 방지):
- **지출·수입 집계는 `kind IN (expense, income)` 만 대상**으로 한다. `kind=transfer`는 언제나 제외. (ADR-0004)
- 카드 정산·계좌 송금은 반드시 `kind=transfer`로 분류되고, 각 정산/송금은 **한 번만** 존재한다.
- 할부의 월별 청구분은 **거래로 저장하지 않고** Installment 스케줄에서 파생한다. (ADR-0006)

---

## 2. 엔터티

### Household
| 필드 | 타입 | 비고 |
| :-- | :-- | :-- |
| id | uuid PK | |
| name | text | 예: "규관·윤선네" |
| created_at | timestamptz | |

### Member
| id | uuid PK |
| household_id | uuid FK → Household |
| email | text | 인증 이메일(매직링크, ADR-0002) |
| name | text |
| created_at | timestamptz |

> MVP는 가계당 2인 고정이나 N인 확장을 막지 않는다.

### Account (신규 · FR-AC-01)
| 필드 | 타입 | 비고 |
| :-- | :-- | :-- |
| id | uuid PK | |
| household_id | uuid FK | |
| name | text | 예: "신한 주거래" |
| bank | text | 기관명 |
| account_no_mask | text | 표시용 마스킹(110-***-4521) |
| account_no_hash | text | 내부/외부 매칭용 정규화(숫자만) 해시. 원문 비저장 |
| account_no_tail_hash | text | 마지막 4~6자리 해시 — 부분 마스킹 대응 |
| aliases | text[] | 별칭·예금주명 등 적요 텍스트 매칭용 |
| owner_member_id | uuid FK, null | null이면 공동 소유 |
| created_at | timestamptz | |

> 잔액은 저장 컬럼이 아니라 거래로부터 **파생**(집계)한다.
> 계좌번호는 원문 대신 정규화 해시로 저장·매칭한다(NFR-PRV). 매칭 규칙은 [이체 매칭 규칙](03-transfer-matching.md) 참조.

### Card (신규 · FR-AC-02)
| 필드 | 타입 | 비고 |
| :-- | :-- | :-- |
| id | uuid PK | |
| household_id | uuid FK | |
| name | text | 예: "현대카드 M" |
| issuer | text | 발급사 |
| owner_member_id | uuid FK | |
| settlement_account_id | uuid FK → Account | **결제계좌** |
| billing_day | int, null | 결제일(예: 25) |
| created_at | timestamptz | |

### Category
| id | uuid PK |
| household_id | uuid FK |
| name | text |
| emoji | text, null |
| is_default | bool | 가계 생성 시 시드(FR-CT-01) |
| kind | enum(expense/income/fee) | 'fee'는 할부수수료 등 |

### Transaction (변경 · FR-TX, FR-SH, FR-AC-04)
| 필드 | 타입 | 비고 |
| :-- | :-- | :-- |
| id | uuid PK | |
| household_id | uuid FK | |
| occurred_on | date | 거래일(이용일) |
| amount | numeric | 부호 있음(지출 −, 수입 +) |
| description | text | 적요/가맹점 |
| **kind** | enum(**expense/income/transfer**) | 집계 대상 판별의 축 |
| category_id | uuid FK, null | transfer는 null |
| sharing | enum(shared/member)+member_id, null | transfer는 null (FR-SH-01) |
| **source_kind** | enum(account/card/manual) | 어디서 발생 |
| source_id | uuid, null | Account.id 또는 Card.id |
| **counterparty_kind** | enum(internal_account/internal_card/external/none) | 이체 판별(ADR-0005) |
| counterparty_id | uuid, null | 내부일 때 Account/Card FK |
| counterparty_label | text, null | 외부 수취처 라벨(예: "○○부동산 월세") |
| installment_id | uuid FK, null | 할부 원거래면 연결 |
| import_batch_id | uuid FK, null | 수동 입력이면 null |
| dedup_key | text | 날짜+금액+적요+출처 (요구사항 결정 B) |
| created_by_member_id | uuid FK | |
| created_at | timestamptz | |

규칙:
- `kind=transfer` ⇒ category_id·sharing = null, counterparty_kind ∈ {internal_account, internal_card}.
- import 거래 기본 sharing = "가져온 멤버의 개인"(요구사항 결정 A), 변경 가능.
- 외부 수취 송금(월세 등)은 `kind=expense`, `counterparty_kind=external`.

### Installment (신규 · FR-TX-04, ADR-0006)
| id | uuid PK |
| household_id | uuid FK |
| parent_transaction_id | uuid FK → Transaction | 원거래(구매일·전액) |
| months | int | 총 개월 |
| per_amount | numeric | 월 청구액 |
| interest_bearing | bool | 유이자 여부 |
| fee_total | numeric, null | 할부수수료(있으면 별도 fee 거래로 집계) |
| start_month | date | 첫 청구월 |

> '월 청구' 관점: 선택 월 `m`에 대해 각 Installment의 청구분(해당 월이 스케줄 범위면 per_amount)을 파생 합산. '구매 시점' 관점: parent_transaction.amount를 구매월에 집계.

### TransferLink (신규 · FR-AC-04/05)
| id | uuid PK |
| household_id | uuid FK |
| out_transaction_id | uuid FK → Transaction | 출금 측 |
| in_ref_kind | enum(transaction/card) | 입금 측 종류 |
| in_ref_id | uuid | Transaction.id(계좌 송금) 또는 Card.id(카드 정산) |
| transfer_type | enum(card_settlement/account_transfer) | |
| status | enum(auto/manual/confirmed) | 인식 경로 |
| created_at | timestamptz |

> 짝이 맞춰지면 관련 거래는 `kind=transfer`로 확정되어 집계에서 빠진다.

### TransferRule (신규 · FR-AC-04)
| id | uuid PK | household_id | keyword | note |
> 적요에 keyword가 있으면 가져오기 시 자동으로 `kind=transfer` 후보로 표시.

### Budget · MappingProfile · ImportBatch
v1.0 §5 그대로 유지.
- **Budget**: id, household, category_id, month, amount (FR-BG).
- **MappingProfile**: id, 기관명, 컬럼/날짜/금액 규칙, scope(전역/가계) — MVP는 전역만(결정 D).
- **ImportBatch**: id, household, 일시, 파일명, 건수(신규/중복/오류/이체), 멤버, 기관.

---

## 3. 이중집계 방지 — 데이터 관점 요약

1. 지출/수입 쿼리는 항상 `WHERE kind IN ('expense','income')`. transfer는 원천적으로 제외. (ADR-0004)
2. 카드 이용내역 = 지출 원천. 카드대금 인출 = `kind=transfer, transfer_type=card_settlement`. (ADR-0004)
3. 내부/외부는 counterparty가 등록 계좌·카드(FK)인지로 결정. 외부는 지출. (ADR-0005)
4. 할부 월 청구는 거래로 저장하지 않고 Installment에서 파생. (ADR-0006)
5. 중복 적재는 dedup_key(날짜+금액+적요+출처)로 차단. (요구사항 결정 B)

---

## 4. 미결/후속

- account_no: 원문 비저장, 정규화 해시 + tail 해시만 저장으로 확정(NFR-PRV). 해시 알고리즘·솔트는 구현 시 확정.
- RLS: 가계 단위 행 격리 정책(NFR-SEC-02)은 아키텍처 문서에서 SQL 정책으로 확정.
- 할부 '월 청구' 파생: **MVP 포함 확정**(ADR-0006, 2026-07-07). 파생 계산 방식은 구현에서 확정.
- 이체 자동 매칭의 금액·날짜 허용오차는 실제 파일로 튜닝([매칭 규칙](03-transfer-matching.md) §7).

### 변경 이력
- **v0.1 (2026-07-06)**: 최초 초안. v1.0 엔터티 + 계좌·카드·이체·할부(ADR-0004~0006) 반영.
