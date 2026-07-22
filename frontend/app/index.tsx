/**
 * 동작 확인용 최소 홈 화면 (#26 · #35 · #36).
 *  - 로컬 SQLite 가 열리고 마이그레이션이 적용됐음을 화면에 표시(네이티브·웹 공통).
 *  - 실제 기능 화면은 후속 이슈. NativeWind 유틸리티가 렌더됨을 겸사 확인.
 *
 * 이력: #35 에서 발견한 expo-sqlite 웹 동기 워커의 길이-인코딩 버그(≥256B SELECT →
 * "Unexpected end of JSON input")를 #36 에서 patch-package 로 수정.
 * 이제 대용량 SELECT(테이블/뷰 이름 12+1개)가 웹에서도 정상 렌더된다 → 패치 시각 증거.
 */
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { count, sql } from 'drizzle-orm';

import { db, DB_NAME } from '@/db/client';
import { households } from '@/db/schema';

type DbState = {
  tables: string[];
  views: string[];
  households: number;
};

export default function Home() {
  const [state, setState] = useState<DbState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // 대용량 결과(이름 목록) — #36 패치 후 웹에서도 안전.
      const objects = db.all<{ name: string; type: string }>(
        sql`SELECT name, type FROM sqlite_master
            WHERE type IN ('table','view')
              AND name NOT LIKE 'sqlite_%'
              AND name <> '__drizzle_migrations'
            ORDER BY name`,
      );
      const [{ value: householdCount }] = db
        .select({ value: count() })
        .from(households)
        .all();

      setState({
        tables: objects.filter((o) => o.type === 'table').map((o) => o.name),
        views: objects.filter((o) => o.type === 'view').map((o) => o.name),
        households: householdCount,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <StatusBar style="dark" />
      <ScrollView contentContainerClassName="p-6 gap-4">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary">
            <Text className="text-lg font-extrabold text-white">가</Text>
          </View>
          <View>
            <Text className="text-xl font-extrabold text-ink">kakebo</Text>
            <Text className="text-sm text-ink-2">부부 가계부 · 로컬 우선 MVP</Text>
          </View>
        </View>

        {error ? (
          <View className="rounded-2xl border border-border bg-surface p-5">
            <Text className="text-base font-bold text-danger">DB 오류</Text>
            <Text className="mt-2 text-ink-2">{error}</Text>
          </View>
        ) : !state ? (
          <View className="rounded-2xl border border-border bg-surface p-5">
            <Text className="text-ink-2">DB 상태 확인 중…</Text>
          </View>
        ) : (
          <>
            <View className="rounded-2xl border border-primary/30 bg-primary-soft p-5">
              <Text className="text-base font-extrabold text-primary-dark">
                DB ready — {state.tables.length} tables · {state.views.length} view
              </Text>
              <Text className="mt-1 text-sm text-primary-dark/80">
                {DB_NAME} · households {state.households}건
              </Text>
            </View>

            <View className="rounded-2xl border border-border bg-surface p-5">
              <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-3">
                Tables
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {state.tables.map((t) => (
                  <View key={t} className="rounded-lg bg-canvas px-3 py-1.5">
                    <Text className="text-[13px] font-semibold text-ink-2">{t}</Text>
                  </View>
                ))}
              </View>

              <Text className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-ink-3">
                Views
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {state.views.map((v) => (
                  <View key={v} className="rounded-lg bg-primary-soft px-3 py-1.5">
                    <Text className="text-[13px] font-semibold text-primary-dark">{v}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
