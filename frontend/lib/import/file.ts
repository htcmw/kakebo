/**
 * import 파일 선택·검증 (#28, FR-IM-01 수직 슬라이스 1).
 *
 * 이 모듈은 "업로드 UI" 단계의 정본 로직만 담는다:
 *  - 파일 선택(expo-document-picker, 네이티브·웹 공통)
 *  - 검증: 확장자(.csv/.xls/.xlsx) + 크기(≤10MB)
 *  - #29(파싱·미리보기)로 넘길 안정적 인터페이스 SelectedImportFile 제공.
 *
 * 파싱·인코딩·정규화·중복·이체 판별은 이번 범위 밖(#29 이후).
 */
import * as DocumentPicker from 'expo-document-picker';

export type ImportFileFormat = 'csv' | 'xls' | 'xlsx';

/** #29 로 넘기는 선택 파일의 최소 계약(파싱기가 uri 로 내용을 읽는다). */
export interface SelectedImportFile {
  /** 로컬 파일 URI (네이티브: cache 복사본 / 웹: blob URL) */
  uri: string;
  /** 원본 파일명 */
  name: string;
  /** 바이트 크기 (알 수 없으면 0) */
  size: number;
  /** 확장자에서 판별한 형식 */
  format: ImportFileFormat;
  /** 브라우저·OS가 준 MIME (없을 수 있음) */
  mimeType?: string;
}

export const MAX_IMPORT_BYTES = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_FORMATS: readonly ImportFileFormat[] = ['csv', 'xls', 'xlsx'];

/** 피커 필터용 MIME 힌트. 최종 판정은 확장자 검증이 담당(사용자가 '모든 파일'로 우회 가능). */
const PICKER_MIME_TYPES = [
  'text/csv',
  'text/comma-separated-values',
  'application/vnd.ms-excel', // .xls (일부 .csv 도)
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
];

/** 파일명에서 소문자 확장자 추출 ('a.b.CSV' → 'csv', 확장자 없으면 ''). */
export function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  if (dot < 0 || dot === name.length - 1) return '';
  return name.slice(dot + 1).toLowerCase();
}

/** 바이트 → 사람이 읽는 크기 (0 B / 12.3 KB / 4.5 MB). */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}

export type ValidationResult =
  | { ok: true; file: SelectedImportFile }
  | { ok: false; message: string };

/** 확장자·크기 검증. UI·테스트가 함께 쓰는 순수 함수. */
export function validateAsset(
  asset: Pick<DocumentPicker.DocumentPickerAsset, 'name' | 'size' | 'uri' | 'mimeType'>,
): ValidationResult {
  const ext = extensionOf(asset.name);
  if (!ACCEPTED_FORMATS.includes(ext as ImportFileFormat)) {
    return {
      ok: false,
      message: `지원하지 않는 형식입니다: ${ext ? `.${ext}` : '(확장자 없음)'} · CSV·XLS·XLSX만 올릴 수 있어요`,
    };
  }
  const size = asset.size ?? 0;
  if (size > MAX_IMPORT_BYTES) {
    return {
      ok: false,
      message: `파일이 너무 큽니다: ${formatBytes(size)} · 최대 ${formatBytes(MAX_IMPORT_BYTES)}까지`,
    };
  }
  return {
    ok: true,
    file: {
      uri: asset.uri,
      name: asset.name,
      size,
      format: ext as ImportFileFormat,
      mimeType: asset.mimeType,
    },
  };
}

export type PickOutcome =
  | { status: 'selected'; file: SelectedImportFile }
  | { status: 'canceled' }
  | { status: 'error'; message: string };

/** 파일 선택 다이얼로그를 열고 검증 결과를 반환(네이티브·웹 공통). */
export async function pickImportFile(): Promise<PickOutcome> {
  try {
    const res = await DocumentPicker.getDocumentAsync({
      type: PICKER_MIME_TYPES,
      multiple: false,
      copyToCacheDirectory: true, // 네이티브에서 이후 파싱이 즉시 읽도록
    });
    if (res.canceled) return { status: 'canceled' };
    const asset = res.assets?.[0];
    if (!asset) return { status: 'error', message: '파일을 읽지 못했습니다. 다시 시도해 주세요.' };

    const validated = validateAsset(asset);
    if (!validated.ok) return { status: 'error', message: validated.message };
    return { status: 'selected', file: validated.file };
  } catch (e) {
    return {
      status: 'error',
      message: e instanceof Error ? e.message : '파일 선택 중 오류가 발생했습니다.',
    };
  }
}
