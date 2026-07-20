# 디자인 토큰 (Design Tokens)

| 항목 | 내용 |
| :-- | :-- |
| 문서 버전 | v0.1 |
| 작성일 | 2026-07-20 |
| 상태 | 🟢 확정 |
| 정본 출처 | [`ui-mockup.html`](ui-mockup.html) `:root` |
| 매핑 | [`frontend/tailwind.config.js`](../frontend/tailwind.config.js) (NativeWind) |
| 근거 | ADR-0010(UI 스택 — "목업 토큰을 디자인 토큰으로 정착"), #27 |

목업의 `:root` 변수를 **디자인 시스템 정본**으로 옮긴 것. 앱은 이 토큰을 NativeWind 테마(`tailwind.config.js`)로 매핑해 사용한다. **색·타이포·라운드·섀도의 진실원은 이 문서이며, 목업과 코드는 여기에 맞춘다.**

---

## 1. 색 (Color)

### 브랜드 · 멤버
| 토큰 | HEX | NativeWind | 의미 |
| :-- | :-- | :-- | :-- |
| primary | `#0d9488` | `primary` | **공동/브랜드** (teal) |
| primary-dark | `#0b7a70` | `primary-dark` | primary 강조/텍스트 |
| primary-soft | `#e3f4f1` | `primary-soft` | primary 배경 |
| memberA | `#3b6ef6` | `memberA` | **멤버 A(지훈)** (blue) |
| memberA-soft | `#e7eefe` | `memberA-soft` | A 배경 |
| memberB | `#e0568f` | `memberB` | **멤버 B(서연)** (pink) |
| memberB-soft | `#fce7f0` | `memberB-soft` | B 배경 |

> 공동=teal, 지훈=blue, 서연=pink 는 앱 전반의 **의미 고정 색**(거래 공동/개인 태깅, 분담 등).

### 의미(Semantic) · 상태
| 토큰 | HEX | NativeWind | 의미 |
| :-- | :-- | :-- | :-- |
| income | `#0f9d58` | `income` | 수입(+) |
| expense | `#e04b4b` | `expense` | 지출(−) |
| warn | `#e8a33d` | `warn` | 경고/주의 |
| warn-soft | `#fcf1dd` | `warn-soft` | 경고 배경 |
| danger | `#dc2f45` | `danger` | 위험/오류 |

### 표면 · 텍스트 · 경계
| 토큰 | HEX | NativeWind | 의미 |
| :-- | :-- | :-- | :-- |
| canvas | `#f4f6f8` | `canvas` | 화면 배경 |
| surface | `#ffffff` | `surface` | 카드/패널 |
| surface-2 | `#f8fafc` | `surface-2` | 보조 표면 |
| border | `#e6eaef` | `border` | 기본 경계 |
| border-strong | `#d3dae2` | `border-strong` | 강조 경계 |
| ink | `#1b2733` | `ink` | 본문 텍스트 |
| ink-2 | `#5a6b7b` | `ink-2` | 보조 텍스트 |
| ink-3 | `#8a99a8` | `ink-3` | 흐린 텍스트/캡션 |

---

## 2. 타이포그래피 (Typography)

**폰트 패밀리**: `Pretendard`, `Apple SD Gothic Neo`, `Malgun Gothic`, 시스템 산세리프 폴백.
NativeWind: `font-sans` (기본). *네이티브에서 Pretendard 실제 로딩(expo-font)은 후속 — 미로딩 시 시스템 폰트 폴백.*

**크기 스케일** (목업 사용값을 의미 이름으로 정착):
| 토큰 | px | NativeWind | 용도 |
| :-- | :-: | :-- | :-- |
| caption | 11 | `text-caption` | 캡션/보조 라벨 |
| label | 12.5 | `text-label` | 라벨/칩/메타 |
| body | 13.5 | `text-body` | 본문 |
| title | 19 | `text-title` | 섹션 제목 |
| display | 24 | `text-display` | 큰 숫자/헤드라인 |
| display-lg | 26 | `text-display-lg` | 최상위 강조 숫자 |

**굵기**: 600(semibold) · 700(bold) · 800(extrabold) — `font-semibold` / `font-bold` / `font-extrabold`.

> 간격(spacing)은 Tailwind 기본 4px 스케일을 그대로 사용(목업과 정합). 별도 오버라이드 없음.

---

## 3. 라운드 · 섀도

| 토큰 | 값 | NativeWind | 용도 |
| :-- | :-- | :-- | :-- |
| radius-sm | 9px | `rounded-chip` | 칩/작은 요소 |
| radius | 14px | `rounded-card` | 카드/패널 |
| shadow | `0 1px 2px rgba(16,32,48,.04), 0 6px 20px rgba(16,32,48,.06)` | `shadow-card` | 카드 그림자 |
| shadow-lg | `0 12px 40px rgba(16,32,48,.16)` | `shadow-lg` | 모달/부상 요소 |

> RN/NativeWind의 그림자 표현은 플랫폼차가 있어, 섀도는 카드에 한해 최소로 사용.

---

## 4. 후속 / 열린 항목

- **다크 모드**: 목업은 라이트 전용. 다크 팔레트는 후속 결정(필요 시 ADR).
- **Pretendard 네이티브 로딩**: expo-font로 폰트 자산 로딩(후속). 현재는 시스템 폰트 폴백.
- **모바일 반응형 토큰**: 현재 토큰은 데스크톱 목업 기준. 반응형 조정은 #34에서.

### 변경 이력
- **v0.1 (2026-07-20)**: 최초. 목업 `:root` → 디자인 토큰 정본화(색·타이포·라운드·섀도), NativeWind 매핑. (#27, ADR-0010)
