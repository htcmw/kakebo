# ADR-0010: UI 스택 (디자인 시스템 · 스타일링)

| 항목 | 내용 |
|------|------|
| 상태 | 🟡 제안 (확정 대기) |
| 날짜 | 2026-07-08 |
| 단계 | Construction |

## 맥락 (Context)

Expo(React Native) 위에서 iOS/Android/Web에 **동일한 UI**를 입힐 스타일링·컴포넌트 시스템을 골라야 한다. 2026 주류는 **NativeWind**(Tailwind 유틸리티를 AOT 컴파일), **Tamagui**(컴파일러 기반, 웹=atomic CSS/네이티브=View로 최적화), **Gluestack UI v3**(무스타일·접근성 프리미티브 + NativeWind)로 좁혀진다.

기존 자산: `designs/ui-mockup.html`이 이미 **디자인 토큰 + Tailwind風 유틸리티** 스타일로 되어 있다(공동=teal, 지훈=blue, 서연=pink 등).

## 결정 (제안)

- **스타일링: NativeWind**(Tailwind 유틸리티). + 접근성 프리미티브가 필요하면 **Gluestack UI v3**(무스타일 + NativeWind).
- **디자인 시스템**: 목업의 토큰(색·타이포·라운드·간격)을 그대로 디자인 토큰으로 정착.
- 대안: **Tamagui**(성능·단일 API 우수하나 학습·빌드 복잡도↑) — 성능이 병목이 되면 재검토.

## 근거

- **웹→네이티브 이식 비용 최소**: 목업이 이미 Tailwind風이라 NativeWind로 거의 1:1 매핑.
- **웹+네이티브 단일 코드**(NFR-PLT-01)와 자연스럽게 맞물림.
- Gluestack v3의 무스타일·접근성 프리미티브로 향후 접근성(NFR-A11Y) 확보 용이.
- 유틸리티 우선 스타일이 2026 RN 스타일링의 주류 흐름.

## 결과 (Consequences)

- (+) 목업의 룩앤필을 빠르게 앱으로 이식.
- (−) 유틸리티 클래스 남발 시 가독성 저하 → 공통 컴포넌트로 추출.
- (→) 디자인 토큰을 코드(테마)로 정의, `designs/`의 토큰과 동기화.
- 확정 시 상태를 Accepted로.

## 관련 문서
- [레포·스택 문서](../02-construction/05-repo-and-stack-2026.md), [UI 설계](../02-construction/04-ui-design.md)
- ADR-0011(프론트엔드), ADR-0007/0008
