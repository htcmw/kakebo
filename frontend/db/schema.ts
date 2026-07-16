/**
 * kakebo (couplebudget) — 로컬 SQLite 스키마 (Drizzle ORM)
 *
 * 논리 데이터 모델(docs/02-construction/02-data-model.md)을 물리 SQLite로 확정한 정본.
 * 스펙·결정 근거: docs/02-construction/07-sqlite-schema.md
 * 근거 ADR: 0004(카드=지출원천), 0005(내부/외부 이체), 0006(할부 두 관점), 0007(로컬 정본)
 *
 * 핵심 규약 (스펙 문서 §금액·통화·라운딩 참조)
 *  - 금액은 모두 INTEGER, 해당 통화의 **최소단위**(minor unit): USD=센트, KRW=원.
 *  - 통화 3필드는 항상 채움(null 없음): amount/currency(원거래) + base_amount(기본통화 청구액).
 *  - base_amount_source 로 라운딩 발생 여부를 적시(domestic/statement/converted).
 *  - 소수 자릿수·환율은 저장하지 않고 currency 코드에서 앱 계층이 파생.
 *
 * 이중집계 방지 불변식은 CHECK 제약 + v_ledger 뷰로 DB에서 강제(마이그레이션 참조).
 */
import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

/** ISO8601 UTC 타임스탬프 기본값 (예: 2026-07-16T04:03:11.123Z) — 네이티브·WASM 공통 */
const nowUtc = sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`;

/* ─────────────────────────── 가계 · 멤버 ─────────────────────────── */

export const households = sqliteTable('households', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  /** 기본통화(ISO 4217). 집계·표시의 기준. MVP 단일 통화 로직. */
  baseCurrency: text('base_currency').notNull().default('KRW'),
  createdAt: text('created_at').notNull().default(nowUtc),
});

export const members = sqliteTable('members', {
  id: text('id').primaryKey(),
  householdId: text('household_id')
    .notNull()
    .references(() => households.id),
  /** 인증 이메일(매직링크)은 Phase 2 서버에서만 사용 → MVP는 없을 수 있음 */
  email: text('email'),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull().default(nowUtc),
});

/* ─────────────────────────── 계좌 · 카드 ─────────────────────────── */

export const accounts = sqliteTable(
  'accounts',
  {
    id: text('id').primaryKey(),
    householdId: text('household_id')
      .notNull()
      .references(() => households.id),
    name: text('name').notNull(),
    bank: text('bank').notNull(),
    /** 표시용 마스킹 계좌번호(110-***-4521). 없을 수 있음 */
    accountNoMask: text('account_no_mask'),
    /** 매칭용 정규화(숫자만) 해시. 원문 비저장(NFR-PRV). 없을 수 있음 */
    accountNoHash: text('account_no_hash'),
    /** 마지막 4~6자리 해시 — 부분 마스킹 대응 */
    accountNoTailHash: text('account_no_tail_hash'),
    /** 적요 텍스트 매칭용 별칭·예금주명. null 대신 빈 배열 */
    aliases: text('aliases', { mode: 'json' })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    /** null = 공동 소유 (의미상 null) */
    ownerMemberId: text('owner_member_id').references(() => members.id),
    /** 계좌 통화(외화 계좌 대비). 기본은 가계 기본통화 */
    currency: text('currency').notNull().default('KRW'),
    createdAt: text('created_at').notNull().default(nowUtc),
  },
  (t) => [index('idx_accounts_household').on(t.householdId)],
);

export const cards = sqliteTable(
  'cards',
  {
    id: text('id').primaryKey(),
    householdId: text('household_id')
      .notNull()
      .references(() => households.id),
    name: text('name').notNull(),
    issuer: text('issuer').notNull(),
    ownerMemberId: text('owner_member_id')
      .notNull()
      .references(() => members.id),
    /** 결제계좌(FR-AC-02) */
    settlementAccountId: text('settlement_account_id')
      .notNull()
      .references(() => accounts.id),
    /** 결제일(예: 25). 미지정 가능 */
    billingDay: integer('billing_day'),
    createdAt: text('created_at').notNull().default(nowUtc),
  },
  (t) => [
    index('idx_cards_household').on(t.householdId),
    index('idx_cards_settlement').on(t.settlementAccountId),
  ],
);

/* ─────────────────────────── 카테고리 ─────────────────────────── */

export const categories = sqliteTable(
  'categories',
  {
    id: text('id').primaryKey(),
    householdId: text('household_id')
      .notNull()
      .references(() => households.id),
    name: text('name').notNull(),
    /** 이모지 아이콘. 선택 */
    emoji: text('emoji'),
    isDefault: integer('is_default', { mode: 'boolean' })
      .notNull()
      .default(false),
    /** 'fee' = 할부수수료 등 */
    kind: text('kind', { enum: ['expense', 'income', 'fee'] }).notNull(),
  },
  (t) => [
    index('idx_categories_household').on(t.householdId),
    check('ck_categories_kind', sql`${t.kind} IN ('expense','income','fee')`),
  ],
);

/* ─────────────────────────── 거래 ─────────────────────────── */

export const transactions = sqliteTable(
  'transactions',
  {
    id: text('id').primaryKey(),
    householdId: text('household_id')
      .notNull()
      .references(() => households.id),
    /** 거래일(이용일) 'YYYY-MM-DD' */
    occurredOn: text('occurred_on').notNull(),

    // ── 금액·통화 (세 필드 항상 채움 · 최소단위 정수) ──
    /** 원거래 통화의 금액(최소단위). 부호: 지출 −, 수입 +, 이체는 흐름 방향 */
    amount: integer('amount').notNull(),
    /** 원거래 통화(ISO 4217). 국내면 기본통화와 동일 */
    currency: text('currency').notNull().default('KRW'),
    /** 기본통화(한화) 청구금액(최소단위). 집계는 항상 이 값을 사용 */
    baseAmount: integer('base_amount').notNull(),
    /**
     * base_amount 출처 = 라운딩 발생 적시(감사용).
     *  domestic  : 국내 거래(환산 없음, amount == base_amount)
     *  statement : 명세서 실제 청구액을 그대로 기록(우리가 라운딩 안 함)
     *  converted : 앱이 환율로 계산(라운딩 발생) — 라운딩 규칙은 스펙 문서 참조
     */
    baseAmountSource: text('base_amount_source', {
      enum: ['domestic', 'statement', 'converted'],
    }).notNull(),

    /** 적요/가맹점. null 대신 빈 문자열 */
    description: text('description').notNull().default(''),
    /** 집계 대상 판별의 축 */
    kind: text('kind', {
      enum: ['expense', 'income', 'transfer'],
    }).notNull(),
    /** transfer는 null (의미상) */
    categoryId: text('category_id').references(() => categories.id),

    // ── 공동/개인 (FR-SH) : enum+member_id 를 두 컬럼으로 분해 ──
    /** shared | member. transfer는 null */
    sharingScope: text('sharing_scope', { enum: ['shared', 'member'] }),
    sharingMemberId: text('sharing_member_id').references(() => members.id),

    // ── 출처 / 상대 (다형 참조라 하드 FK 없음) ──
    sourceKind: text('source_kind', {
      enum: ['account', 'card', 'manual'],
    }).notNull(),
    /** Account.id 또는 Card.id. manual이면 null */
    sourceId: text('source_id'),
    counterpartyKind: text('counterparty_kind', {
      enum: ['internal_account', 'internal_card', 'external', 'none'],
    })
      .notNull()
      .default('none'),
    /** 내부일 때 Account/Card id */
    counterpartyId: text('counterparty_id'),
    /** 외부 수취처 라벨(예: "○○부동산 월세") */
    counterpartyLabel: text('counterparty_label'),

    /** 수동 입력이면 null */
    importBatchId: text('import_batch_id').references(() => importBatches.id),
    dedupKey: text('dedup_key').notNull(),
    createdByMemberId: text('created_by_member_id')
      .notNull()
      .references(() => members.id),
    createdAt: text('created_at').notNull().default(nowUtc),
  },
  (t) => [
    // 중복적재 차단 (요구사항 결정 B)
    uniqueIndex('uq_transactions_dedup').on(t.dedupKey),
    // 집계 인덱스
    index('idx_tx_kind_date').on(t.kind, t.occurredOn),
    index('idx_tx_category').on(t.categoryId),
    index('idx_tx_source').on(t.sourceKind, t.sourceId),
    index('idx_tx_counterparty').on(t.counterpartyKind, t.counterpartyId),
    index('idx_tx_import_batch').on(t.importBatchId),
    // 불변식 (ADR-0004/0005)
    check('ck_tx_kind', sql`${t.kind} IN ('expense','income','transfer')`),
    check(
      'ck_tx_base_source',
      sql`${t.baseAmountSource} IN ('domestic','statement','converted')`,
    ),
    // 이체는 카테고리·공동개인 없음
    check(
      'ck_tx_transfer_nulls',
      sql`${t.kind} <> 'transfer' OR (${t.categoryId} IS NULL AND ${t.sharingScope} IS NULL)`,
    ),
  ],
);

/* ─────────────────────────── 할부 (FR-TX-04) ─────────────────────────── */
// 원거래 1건 : 할부스케줄 0..1. 순환 FK를 피하려 링크는 이 방향만 둔다
// (거래의 할부는 parent_transaction_id 로 역조회).
export const installments = sqliteTable(
  'installments',
  {
    id: text('id').primaryKey(),
    householdId: text('household_id')
      .notNull()
      .references(() => households.id),
    /** 원거래(구매일·전액). 1:0..1 이므로 unique */
    parentTransactionId: text('parent_transaction_id')
      .notNull()
      .references(() => transactions.id),
    months: integer('months').notNull(),
    /** 월 청구액(최소단위, 기본통화) */
    perAmount: integer('per_amount').notNull(),
    interestBearing: integer('interest_bearing', { mode: 'boolean' })
      .notNull()
      .default(false),
    /** 할부수수료(최소단위, 기본통화). 없으면 0 (null 회피) */
    feeTotal: integer('fee_total').notNull().default(0),
    /** 첫 청구월 'YYYY-MM' */
    startMonth: text('start_month').notNull(),
  },
  (t) => [
    uniqueIndex('uq_installments_parent').on(t.parentTransactionId),
    index('idx_installments_household').on(t.householdId),
  ],
);

/* ─────────────────────────── 이체 링크 (짝 맞추기) ─────────────────────────── */

export const transferLinks = sqliteTable(
  'transfer_links',
  {
    id: text('id').primaryKey(),
    householdId: text('household_id')
      .notNull()
      .references(() => households.id),
    /** 출금 측 거래 */
    outTransactionId: text('out_transaction_id')
      .notNull()
      .references(() => transactions.id),
    /** 입금 측 종류 */
    inRefKind: text('in_ref_kind', { enum: ['transaction', 'card'] }).notNull(),
    /** Transaction.id(계좌 송금) 또는 Card.id(카드 정산) */
    inRefId: text('in_ref_id').notNull(),
    transferType: text('transfer_type', {
      enum: ['card_settlement', 'account_transfer'],
    }).notNull(),
    status: text('status', {
      enum: ['auto', 'manual', 'confirmed'],
    }).notNull(),
    createdAt: text('created_at').notNull().default(nowUtc),
  },
  (t) => [
    // 유일성 불변식: 각 출금은 한 번만 이체로 잡힌다 (매칭규칙 §4)
    uniqueIndex('uq_transfer_out').on(t.outTransactionId),
    index('idx_transfer_in').on(t.inRefKind, t.inRefId),
  ],
);

/* ─────────────────────────── 이체 규칙 ─────────────────────────── */

export const transferRules = sqliteTable(
  'transfer_rules',
  {
    id: text('id').primaryKey(),
    householdId: text('household_id')
      .notNull()
      .references(() => households.id),
    /** 적요 키워드 → 항상 이체 후보 */
    keyword: text('keyword').notNull(),
    note: text('note'),
    createdAt: text('created_at').notNull().default(nowUtc),
  },
  (t) => [index('idx_transfer_rules_household').on(t.householdId)],
);

/* ─────────────────────────── 예산 (FR-BG) ─────────────────────────── */

export const budgets = sqliteTable(
  'budgets',
  {
    id: text('id').primaryKey(),
    householdId: text('household_id')
      .notNull()
      .references(() => households.id),
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id),
    /** 대상 월 'YYYY-MM' */
    month: text('month').notNull(),
    /** 예산액(최소단위, 기본통화) */
    amount: integer('amount').notNull(),
    createdAt: text('created_at').notNull().default(nowUtc),
  },
  (t) => [
    // 카테고리 × 월 유일
    uniqueIndex('uq_budget_category_month').on(t.categoryId, t.month),
  ],
);

/* ─────────────────────────── 매핑 프로파일 (import) ─────────────────────────── */
// MVP는 전역(global)만 사용 → household_id 는 global일 때 null (결정 D)
export const mappingProfiles = sqliteTable('mapping_profiles', {
  id: text('id').primaryKey(),
  /** 전역이면 null, 가계 전용이면 FK */
  householdId: text('household_id').references(() => households.id),
  /** 기관명 */
  name: text('name').notNull(),
  scope: text('scope', { enum: ['global', 'household'] })
    .notNull()
    .default('global'),
  /** 컬럼/날짜/금액 파싱 규칙(JSON) */
  rules: text('rules', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
  createdAt: text('created_at').notNull().default(nowUtc),
});

/* ─────────────────────────── import 배치 ─────────────────────────── */

export const importBatches = sqliteTable(
  'import_batches',
  {
    id: text('id').primaryKey(),
    householdId: text('household_id')
      .notNull()
      .references(() => households.id),
    importedAt: text('imported_at').notNull().default(nowUtc),
    fileName: text('file_name').notNull(),
    /** 기관명(추정 실패 시 null 가능) */
    institution: text('institution'),
    memberId: text('member_id').references(() => members.id),
    countNew: integer('count_new').notNull().default(0),
    countDuplicate: integer('count_duplicate').notNull().default(0),
    countError: integer('count_error').notNull().default(0),
    countTransfer: integer('count_transfer').notNull().default(0),
  },
  (t) => [index('idx_import_batches_household').on(t.householdId)],
);

/* ─────────────────────────── 타입 export ─────────────────────────── */

export type Household = typeof households.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Card = typeof cards.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Installment = typeof installments.$inferSelect;
export type TransferLink = typeof transferLinks.$inferSelect;
export type TransferRule = typeof transferRules.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type MappingProfile = typeof mappingProfiles.$inferSelect;
export type ImportBatch = typeof importBatches.$inferSelect;
