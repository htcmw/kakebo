/**
 * 홈 화면 — 로컬 시드(FR-HM-01 · #37) 결과 표시.
 *  - 가계 1개 + 멤버 2명(규관·윤선)을 로컬 DB에서 읽어 보여준다.
 *  - 색: 규관=memberA(파랑), 윤선=memberB(분홍) — 시드 순서/디자인 토큰과 정합.
 *  - 실제 기능 화면(거래·대시보드 등)은 후속 이슈(Bolt 1~).
 */
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { db, DB_NAME } from '@/db/client';
import { households, members } from '@/db/schema';

type HomeData = {
  householdName: string | null;
  members: { id: string; name: string }[];
};

// 멤버 색 = 시드 순서(0: 규관/memberA, 1: 윤선/memberB). 리터럴이라 NativeWind가 스캔함.
const MEMBER_CHIP = ['bg-memberA-soft', 'bg-memberB-soft'];
const MEMBER_TEXT = ['text-memberA', 'text-memberB'];

export default function Home() {
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const [hh] = db.select().from(households).limit(1).all();
      const ms = db.select().from(members).orderBy(members.name).all();
      setData({
        householdName: hh?.name ?? null,
        members: ms.map((m) => ({ id: m.id, name: m.name })),
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
        ) : !data ? (
          <View className="rounded-2xl border border-border bg-surface p-5">
            <Text className="text-ink-2">불러오는 중…</Text>
          </View>
        ) : (
          <>
            <View className="rounded-2xl border border-border bg-surface p-5">
              <Text className="text-xs font-semibold uppercase tracking-wide text-ink-3">
                우리 가계
              </Text>
              <Text className="mt-1 text-xl font-extrabold text-ink">
                {data.householdName ?? '(없음)'}
              </Text>

              <View className="mt-4 flex-row flex-wrap gap-2">
                {data.members.map((m, i) => (
                  <View
                    key={m.id}
                    className={`rounded-chip px-3 py-1.5 ${MEMBER_CHIP[i] ?? 'bg-canvas'}`}
                  >
                    <Text className={`text-label font-bold ${MEMBER_TEXT[i] ?? 'text-ink-2'}`}>
                      {m.name}
                    </Text>
                  </View>
                ))}
              </View>
              <Text className="mt-3 text-caption text-ink-3">
                멤버 {data.members.length}명 · 공동/개인 태깅 기준(FR-SH)
              </Text>
            </View>

            <Text className="px-1 text-caption text-ink-3">
              로컬 SQLite · {DB_NAME} · 무인증(로컬 우선)
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
