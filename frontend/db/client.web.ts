/**
 * 로컬 SQLite 정본 연결 — 웹(OPFS) (#35).
 *
 * 네이티브(db/client.ts)와 동일한 schema.ts·drizzle/ 마이그레이션을 공유하되,
 * 웹에서는 expo-sqlite 가 wa-sqlite(WASM) + OPFS 를 웹워커에서 구동한다.
 *
 * 왜 async 워밍업이 필요한가:
 *  - Drizzle expo-sqlite 드라이버는 동기 API(execSync/getAllSync 등)를 쓴다.
 *  - 웹의 동기 API 는 메인스레드가 SharedArrayBuffer 를 스핀-대기(busy loop, 상한 존재)
 *    하며 워커 응답을 기다린다 → cross-origin isolation(COOP/COEP) 필수.
 *  - 최초 호출에서 wasm 콜드 컴파일이 스핀 상한을 넘겨 "Sync operation timeout" 발생.
 *  - 해결: 먼저 openDatabaseAsync 로 워커+wasm 을 비동기로 예열한 뒤 동기 핸들을 연다.
 *    이후 동기 연산은 예열된 워커에서 즉시 응답하므로 상한 내에 완료된다.
 *
 * 앱은 ensureDbReady() 를 먼저 await 한 뒤 db/expoDb 를 사용한다(_layout.tsx 게이트).
 */
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync, openDatabaseSync } from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

import * as schema from './schema';

export const DB_NAME = 'kakebo.db';

// live binding: ensureDbReady() 완료 후 채워진다(임포터는 최신값을 본다).
export let expoDb!: SQLiteDatabase;
export let db!: ReturnType<typeof drizzle<typeof schema>>;

export type DB = typeof db;

let readyPromise: Promise<void> | null = null;

/** 웹 SQLite 예열 + 동기 핸들/Drizzle 준비. 멱등(1회만 실행). */
export function ensureDbReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      // 워커 + wasm 콜드 컴파일을 비동기로 끝내 동기 스핀 타임아웃을 회피.
      const warm = await openDatabaseAsync(DB_NAME, { enableChangeListener: true });
      await warm.closeAsync();

      // 예열 완료 → 동기 핸들은 즉시 응답.
      expoDb = openDatabaseSync(DB_NAME, { enableChangeListener: true });
      expoDb.execSync('PRAGMA foreign_keys = ON;'); // 참조 무결성(기본 OFF)
      db = drizzle(expoDb, { schema });
    })();
  }
  return readyPromise;
}
