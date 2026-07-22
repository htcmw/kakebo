/**
 * 루트 레이아웃.
 *  - global.css 임포트로 NativeWind 유틸리티 활성화.
 *  - 2단 게이트:
 *    1) ensureDbReady(): 웹은 wa-sqlite/OPFS 워커를 예열(네이티브는 즉시 resolve).
 *    2) useMigrations(): Drizzle 마이그레이션 적용(네이티브·웹 공통).
 *    → db 가 준비된 뒤에만 마이그레이션 훅을 마운트(웹의 async open 대응, #35).
 */
import '../global.css';

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { ActivityIndicator, Text, View } from 'react-native';

import { db, ensureDbReady } from '@/db/client';
import { seedIfEmpty } from '@/db/seed';
import migrations from '@/drizzle/migrations';

function Gate({ label }: { label: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-canvas">
      <ActivityIndicator color="#0d9488" />
      <Text className="mt-3 text-ink-2">{label}</Text>
    </View>
  );
}

function Fail({ title, message }: { title: string; message: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-canvas p-6">
      <Text className="text-lg font-bold text-danger">{title}</Text>
      <Text className="mt-2 text-center text-ink-2">{message}</Text>
    </View>
  );
}

/** db 준비 후에만 마운트 — 여기서 db 는 항상 유효(웹 live binding 포함). */
function Migrator() {
  const { success, error } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);

  // 마이그레이션 성공 후 로컬 초기 시드(FR-HM-01, 멱등) — 한 번만.
  useEffect(() => {
    if (!success) return;
    try {
      seedIfEmpty(db);
      setSeeded(true);
    } catch (e) {
      setSeedError(e instanceof Error ? e.message : String(e));
    }
  }, [success]);

  if (error) return <Fail title="DB 마이그레이션 실패" message={error.message} />;
  if (!success) return <Gate label="마이그레이션 적용 중…" />;
  if (seedError) return <Fail title="초기 데이터 생성 실패" message={seedError} />;
  if (!seeded) return <Gate label="초기 데이터 준비 중…" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      {/* 가져오기: 뒤로가기 위해 헤더 표시(#28) */}
      <Stack.Screen
        name="import"
        options={{ headerShown: true, title: '가져오기', headerBackTitle: '홈' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    ensureDbReady()
      .then(() => setReady(true))
      .catch((e) => setInitError(e instanceof Error ? e.message : String(e)));
  }, []);

  if (initError) return <Fail title="DB 초기화 실패" message={initError} />;
  if (!ready) return <Gate label="로컬 DB 준비 중…" />;

  return <Migrator />;
}
