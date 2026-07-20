/**
 * drizzle-kit 설정.
 *  - 스키마 정본: db/schema.ts (#25 확정).
 *  - driver 'expo': expo-sqlite 용 마이그레이션 번들(drizzle/migrations.js) 생성.
 *  - 생성 후 spec §5의 v_ledger 뷰를 초기 마이그레이션 .sql 에 수동 추가.
 * 근거: docs/02-construction/07-sqlite-schema.md §1
 */
import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config;
