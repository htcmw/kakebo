/**
 * 로컬 초기 시드 (FR-HM-01 · #37).
 *
 * 로컬 무인증 MVP는 앱 최초 실행 시 **가계 1개 + 멤버 2명(규관·윤선)**을 로컬에 만든다.
 * 이 시드가 있어야 공동/개인(FR-SH) 태깅이 가능하다. (요구사항 baseline FR-HM-01, ADR-0007/0008)
 *
 * 멱등: households 가 이미 있으면 아무것도 하지 않는다(재실행 중복 방지).
 * 색 매핑: SEED_MEMBERS[0]=규관=memberA(파랑), [1]=윤선=memberB(분홍) — 디자인 토큰과 정합.
 */
import { count } from 'drizzle-orm';

import type { DB } from './client';
import { newId } from './id';
import { households, members } from './schema';

/** 시드 멤버 순서 = 색 순서(0: memberA, 1: memberB) */
export const SEED_MEMBERS = ['규관', '윤선'] as const;
export const SEED_HOUSEHOLD_NAME = '규관·윤선네';

export function seedIfEmpty(db: DB): { seeded: boolean } {
  const [{ value }] = db.select({ value: count() }).from(households).all();
  if (value > 0) return { seeded: false };

  const householdId = newId();
  db.insert(households).values({ id: householdId, name: SEED_HOUSEHOLD_NAME }).run();
  db.insert(members)
    .values(SEED_MEMBERS.map((name) => ({ id: newId(), householdId, name })))
    .run();

  return { seeded: true };
}
