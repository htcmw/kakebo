/**
 * 루트 레이아웃.
 *  - global.css 임포트로 NativeWind 유틸리티 활성화.
 *  - 앱 시작 시 Drizzle 마이그레이션을 useMigrations 훅으로 적용.
 *    (전략 근거는 아래 결정 노트 및 보고서 참조: migrate() 직접호출 대신 훅 채택)
 */
import '../global.css';

import { Stack } from 'expo-router';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { ActivityIndicator, Text, View } from 'react-native';

import { db } from '@/db/client';
import migrations from '@/drizzle/migrations';

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas p-6">
        <Text className="text-lg font-bold text-danger">DB 마이그레이션 실패</Text>
        <Text className="mt-2 text-center text-ink-2">{error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color="#0d9488" />
        <Text className="mt-3 text-ink-2">로컬 DB 준비 중…</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
