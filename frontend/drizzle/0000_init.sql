CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`household_id` text NOT NULL,
	`name` text NOT NULL,
	`bank` text NOT NULL,
	`account_no_mask` text,
	`account_no_hash` text,
	`account_no_tail_hash` text,
	`aliases` text DEFAULT '[]' NOT NULL,
	`owner_member_id` text,
	`currency` text DEFAULT 'KRW' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`household_id`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_accounts_household` ON `accounts` (`household_id`);--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` text PRIMARY KEY NOT NULL,
	`household_id` text NOT NULL,
	`category_id` text NOT NULL,
	`month` text NOT NULL,
	`amount` integer NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`household_id`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_budget_category_month` ON `budgets` (`category_id`,`month`);--> statement-breakpoint
CREATE TABLE `cards` (
	`id` text PRIMARY KEY NOT NULL,
	`household_id` text NOT NULL,
	`name` text NOT NULL,
	`issuer` text NOT NULL,
	`owner_member_id` text NOT NULL,
	`settlement_account_id` text NOT NULL,
	`billing_day` integer,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`household_id`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`settlement_account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_cards_household` ON `cards` (`household_id`);--> statement-breakpoint
CREATE INDEX `idx_cards_settlement` ON `cards` (`settlement_account_id`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`household_id` text NOT NULL,
	`name` text NOT NULL,
	`emoji` text,
	`is_default` integer DEFAULT false NOT NULL,
	`kind` text NOT NULL,
	FOREIGN KEY (`household_id`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ck_categories_kind" CHECK("categories"."kind" IN ('expense','income','fee'))
);
--> statement-breakpoint
CREATE INDEX `idx_categories_household` ON `categories` (`household_id`);--> statement-breakpoint
CREATE TABLE `households` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`base_currency` text DEFAULT 'KRW' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `import_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`household_id` text NOT NULL,
	`imported_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`file_name` text NOT NULL,
	`institution` text,
	`member_id` text,
	`count_new` integer DEFAULT 0 NOT NULL,
	`count_duplicate` integer DEFAULT 0 NOT NULL,
	`count_error` integer DEFAULT 0 NOT NULL,
	`count_transfer` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`household_id`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_import_batches_household` ON `import_batches` (`household_id`);--> statement-breakpoint
CREATE TABLE `installments` (
	`id` text PRIMARY KEY NOT NULL,
	`household_id` text NOT NULL,
	`parent_transaction_id` text NOT NULL,
	`months` integer NOT NULL,
	`per_amount` integer NOT NULL,
	`interest_bearing` integer DEFAULT false NOT NULL,
	`fee_total` integer DEFAULT 0 NOT NULL,
	`start_month` text NOT NULL,
	FOREIGN KEY (`household_id`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parent_transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_installments_parent` ON `installments` (`parent_transaction_id`);--> statement-breakpoint
CREATE INDEX `idx_installments_household` ON `installments` (`household_id`);--> statement-breakpoint
CREATE TABLE `mapping_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`household_id` text,
	`name` text NOT NULL,
	`scope` text DEFAULT 'global' NOT NULL,
	`rules` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`household_id`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`household_id` text NOT NULL,
	`email` text,
	`name` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`household_id`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`household_id` text NOT NULL,
	`occurred_on` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'KRW' NOT NULL,
	`base_amount` integer NOT NULL,
	`base_amount_source` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`kind` text NOT NULL,
	`category_id` text,
	`sharing_scope` text,
	`sharing_member_id` text,
	`source_kind` text NOT NULL,
	`source_id` text,
	`counterparty_kind` text DEFAULT 'none' NOT NULL,
	`counterparty_id` text,
	`counterparty_label` text,
	`import_batch_id` text,
	`dedup_key` text NOT NULL,
	`created_by_member_id` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`household_id`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sharing_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`import_batch_id`) REFERENCES `import_batches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ck_tx_kind" CHECK("transactions"."kind" IN ('expense','income','transfer')),
	CONSTRAINT "ck_tx_base_source" CHECK("transactions"."base_amount_source" IN ('domestic','statement','converted')),
	CONSTRAINT "ck_tx_transfer_nulls" CHECK("transactions"."kind" <> 'transfer' OR ("transactions"."category_id" IS NULL AND "transactions"."sharing_scope" IS NULL))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_transactions_dedup` ON `transactions` (`dedup_key`);--> statement-breakpoint
CREATE INDEX `idx_tx_kind_date` ON `transactions` (`kind`,`occurred_on`);--> statement-breakpoint
CREATE INDEX `idx_tx_category` ON `transactions` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_tx_source` ON `transactions` (`source_kind`,`source_id`);--> statement-breakpoint
CREATE INDEX `idx_tx_counterparty` ON `transactions` (`counterparty_kind`,`counterparty_id`);--> statement-breakpoint
CREATE INDEX `idx_tx_import_batch` ON `transactions` (`import_batch_id`);--> statement-breakpoint
CREATE TABLE `transfer_links` (
	`id` text PRIMARY KEY NOT NULL,
	`household_id` text NOT NULL,
	`out_transaction_id` text NOT NULL,
	`in_ref_kind` text NOT NULL,
	`in_ref_id` text NOT NULL,
	`transfer_type` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`household_id`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`out_transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_transfer_out` ON `transfer_links` (`out_transaction_id`);--> statement-breakpoint
CREATE INDEX `idx_transfer_in` ON `transfer_links` (`in_ref_kind`,`in_ref_id`);--> statement-breakpoint
CREATE TABLE `transfer_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`household_id` text NOT NULL,
	`keyword` text NOT NULL,
	`note` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`household_id`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_transfer_rules_household` ON `transfer_rules` (`household_id`);--> statement-breakpoint
-- ── 이중집계 방지 뷰 (07-sqlite-schema.md §5) — 수동 추가 ──
-- 지출/수입 집계는 항상 kind IN ('expense','income') 만 대상(ADR-0004). transfer 는 원천 제외.
CREATE VIEW `v_ledger` AS
SELECT
  id, household_id, occurred_on,
  base_amount, currency, amount,
  kind, category_id, sharing_scope, sharing_member_id,
  source_kind, source_id
FROM transactions
WHERE kind IN ('expense', 'income');