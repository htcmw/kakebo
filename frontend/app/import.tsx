/**
 * 가져오기 — 파일 업로드 UI (#28, FR-IM-01 수직 슬라이스 1).
 *  - CSV/XLS/XLSX 선택(expo-document-picker, 네이티브·웹 공통).
 *  - 확장자·크기(≤10MB) 검증 후 파일 카드 표시(파일명·크기·형식).
 *  - "다음: 미리보기"는 스텁 — 파싱/미리보기는 #29에서 구현.
 */
import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import {
  formatBytes,
  pickImportFile,
  type SelectedImportFile,
} from '@/lib/import/file';

const FORMAT_LABEL: Record<SelectedImportFile['format'], string> = {
  csv: 'CSV',
  xls: 'Excel (XLS)',
  xlsx: 'Excel (XLSX)',
};

export default function ImportScreen() {
  const [file, setFile] = useState<SelectedImportFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [nextNote, setNextNote] = useState(false);

  async function onPick() {
    setPicking(true);
    setNextNote(false);
    const outcome = await pickImportFile();
    setPicking(false);
    if (outcome.status === 'selected') {
      setFile(outcome.file);
      setError(null);
    } else if (outcome.status === 'error') {
      setError(outcome.message);
    }
    // canceled: 상태 유지
  }

  function onRemove() {
    setFile(null);
    setError(null);
    setNextNote(false);
  }

  function onNext() {
    // #29(파싱·미리보기)로 file(uri/name/size/format)을 넘길 자리.
    setNextNote(true);
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <StatusBar style="dark" />
      <ScrollView contentContainerClassName="p-6 gap-4">
        <View>
          <Text className="text-title font-extrabold text-ink">가져오기</Text>
          <Text className="mt-1 text-body text-ink-2">
            은행·카드사에서 내보낸 CSV/엑셀을 올리세요.
          </Text>
        </View>

        {/* 드롭존 느낌의 점선 카드(클릭 시 피커) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="파일 선택"
          onPress={onPick}
          disabled={picking}
          className="items-center rounded-card border-2 border-dashed border-border-strong bg-surface-2 px-6 py-10 active:opacity-80"
        >
          <View className="h-12 w-12 items-center justify-center rounded-card bg-primary-soft">
            <Text className="text-xl font-extrabold text-primary">↑</Text>
          </View>
          <Text className="mt-3 text-body font-bold text-ink">
            {picking ? '파일 선택 중…' : '파일 선택'}
          </Text>
          <Text className="mt-1 text-caption text-ink-3">
            CSV · XLS · XLSX · 최대 10MB
          </Text>
        </Pressable>

        {error && (
          <View className="rounded-card border border-border bg-surface p-4">
            <Text className="text-label font-bold text-danger">올릴 수 없는 파일</Text>
            <Text className="mt-1 text-body text-ink-2">{error}</Text>
          </View>
        )}

        {file && (
          <View className="rounded-card border border-border bg-surface p-4 shadow-card">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-chip bg-primary-soft">
                <Text className="text-label font-extrabold text-primary-dark">
                  {file.format.toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-body font-bold text-ink" numberOfLines={1}>
                  {file.name}
                </Text>
                <Text className="mt-0.5 text-caption text-ink-3">
                  {FORMAT_LABEL[file.format]} · {formatBytes(file.size)}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="파일 제거"
                onPress={onRemove}
                className="rounded-chip px-3 py-1.5 active:opacity-70"
              >
                <Text className="text-label font-semibold text-ink-2">제거</Text>
              </Pressable>
            </View>

            <View className="mt-4 flex-row gap-2">
              <Pressable
                accessibilityRole="button"
                onPress={onPick}
                className="flex-1 items-center rounded-chip border border-border-strong bg-surface py-3 active:opacity-80"
              >
                <Text className="text-label font-bold text-ink-2">다시 선택</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={onNext}
                className="flex-1 items-center rounded-chip bg-primary py-3 active:opacity-90"
              >
                <Text className="text-label font-bold text-white">다음: 미리보기</Text>
              </Pressable>
            </View>

            {nextNote && (
              <Text className="mt-3 text-caption text-ink-3">
                파싱·미리보기는 다음 단계(#29)에서 구현됩니다.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
