# ADR-0011: 프론트엔드 코어 스택

| 항목 | 내용 |
|------|------|
| 상태 | ✅ Accepted |
| 날짜 | 2026-07-08 |
| 단계 | Construction |

> 확정(2026-07-08): 제안대로 채택.

## 맥락 (Context)

모바일(iOS/Android)+웹을 반응형으로 지원하고(NFR-PLT-01), **로컬 정본**(ADR-0007)·**무인증 MVP**(ADR-0008)로 동작하는 앱 코어를 정한다. 2026 크로스플랫폼의 사실상 표준은 **Expo(React Native)** 이며, 웹은 React Strict DOM(RSD)로 수렴 중.

## 결정

| 영역 | 선택 | 
| :-- | :-- |
| 프레임워크 | **Expo (React Native)** — iOS/Android/Web 단일 코드베이스, SDK 55+/New Architecture |
| 언어 | **TypeScript** |
| 라우팅 | **Expo Router**(파일 기반, 태블릿 SplitView 등) |
| 웹 레이어 | **React Strict DOM**(성숙 전까지 RNW 병행 가능) |
| 로컬 저장 | **expo-sqlite**(네이티브) / **SQLite WASM + OPFS**(웹) — 로컬 정본 |
| 상태관리 | 경량(예: **Zustand**) + 쿼리는 로컬 DB 접근 계층으로 |
| 스타일링 | ADR-0010 (NativeWind 등) |

> **과금유도 회피(ADR-0013)**: Expo SDK/CLI/Router는 MIT·영구 무료. 유료 소지는 **EAS 클라우드 서비스**(Build/Update/Submit)뿐이며 **선택적**으로만 쓴다 — 빌드는 로컬 또는 GitHub Actions 무료 러너(`eas build --local`), OTA는 자가호스팅 가능. EAS 없이도 프로덕션 앱을 만들 수 있다.

## 근거

- Expo는 2026 표준이자 생태계가 활발(New Arch 필수화, Expo Router 앱 프레임워크화, OTA 효율화).
- **웹으로 시작→네이티브로 확장** 흐름이 기존 웹 목업과 연속적.
- SQLite는 관계형 쿼리(합산·필터·집계)가 많은 가계부에 적합하고, 웹은 OPFS로 진짜 로컬 DB 확보.
- 상태는 로컬 DB가 진실원이므로 무거운 전역 상태 대신 경량 라이브러리로 충분.

## 결과 (Consequences)

- (+) 하나의 코드베이스로 모바일+웹, 로컬 우선 충족.
- (−) RN/Expo 학습·네이티브 빌드 파이프라인 필요.
- (→) 로컬 스키마를 [데이터 모델](../../02-construction/02-data-model.md) 기반 SQLite DDL로 구체화.
- (→) import 파서(인코딩·정규화·이체 판별)를 클라이언트 모듈로 구현.
- 확정 시 Accepted로.

## 관련 문서
- [레포·스택 문서](../../02-construction/05-repo-and-stack-2026.md), ADR-0010(UI), ADR-0012(백엔드), ADR-0007/0008
