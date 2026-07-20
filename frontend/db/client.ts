/**
 * 로컬 SQLite 정본 연결 (네이티브: expo-sqlite).
 *
 * - ADR-0007: 로컬 정본. ADR-0011: expo-sqlite(네이티브 1급).
 * - 마이그레이션은 앱 시작 시 useMigrations 훅으로 적용(_layout.tsx).
 * - 웹(OPFS) 드라이버는 이번 스캐폴드 범위 밖(후속). 07-sqlite-schema.md §6 참조.
 *
 * 참조 무결성: SQLite는 외래키가 기본 OFF이므로 연결 즉시 PRAGMA로 켠다
 * (07-sqlite-schema.md §4 "PRAGMA foreign_keys = ON (연결마다)").
 */
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

export const DB_NAME = 'kakebo.db';

/** expo-sqlite 원본 핸들 (마이그레이터/PRAGMA/저수준 접근용) */
export const expoDb = openDatabaseSync(DB_NAME, {
  enableChangeListener: true,
});

// 참조 무결성 강제 (SQLite 기본 OFF)
expoDb.execSync('PRAGMA foreign_keys = ON;');

/** 타입 안전 Drizzle 인스턴스 — 앱 전역에서 이 db 를 사용 */
export const db = drizzle(expoDb, { schema });

export type DB = typeof db;

/**
 * DB 준비 게이트. 네이티브는 동기 open 이라 이미 준비 완료 → 즉시 resolve.
 * (웹 client.web.ts 는 wasm 예열이 필요해 실제 비동기 작업을 수행한다.)
 */
export function ensureDbReady(): Promise<void> {
  return Promise.resolve();
}
