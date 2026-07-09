# 개발 진행 이력 (Development Log)

프로젝트가 "어떻게 진행되어 왔는지"의 서술형 기록. 상세 근거는 각 ADR·커밋 참조. 시간순.

| 시점 | 사건 | 산출/근거 |
| :-- | :-- | :-- |
| 2026-06 | 제품 비전 확정 — 신혼부부 2인 가계부, 자동연동 없이 export→import | 비전서 v0.2, ADR-0001 |
| 2026-06 | 인증은 이메일 매직링크로 결정(당시) | ADR-0002 |
| 2026-06 | 문서 구조 확정 — phase 정본 + views 인덱스 | ADR-0003 |
| 2026-07 초 | 요구사항 v1.0 확정(FR/NFR, 인수조건) | 요구사항 v1.0(드라이브) |
| 2026-07 | **UI 설계** — P0 전 화면 인터랙티브 목업 | `designs/ui-mockup.html`, `04-ui-design.md` |
| 2026-07 | 계좌·카드·이체 도입 — 카드 정산=이체, 내부/외부 구분, 이중집계 방지 | ADR-0004, 0005, `02a`, `03-transfer-matching` |
| 2026-07 | 카드 할부 두 관점(구매시점/월청구) 채택 | ADR-0006 |
| 2026-07 | 문서를 드라이브→로컬 레포로 이관(구조만), 커밋 컨벤션 스킬 도입 | `docs/`, `.claude/skills/commit-conventions` |
| 2026-07 | **아키텍처 전환** — 로컬 우선 + S3 백업, 인증은 서버 쓸 때만 | ADR-0007, 0008, `01-architecture` |
| 2026-07 | 로그인 제거(로컬 진입), 모노레포 구조(docs/designs/frontend/backend + AGENTS.md) | 목업 갱신, `AGENTS.md` |
| 2026-07 | 2026 트렌드 검토(SDD·컨텍스트 엔지니어링·오케스트레이션·로컬 우선), 스택 방향 = Expo | `05-repo-and-stack.md` |
| 2026-07 | **작업 방식 채택** — 에이전틱 엔지니어링·멀티에이전트 오케스트레이션·검증 중심 | ADR-0009, `06-agentic-workflow`, `.claude/agents/` |
| 2026-07 | 기술 선택 근거 문서화(UI/프론트/백엔드) | ADR-0010, 0011, 0012 |
| 2026-07 | **스택 확정** — Expo+NativeWind+로컬 SQLite, Phase2 S3 서버리스 백업 | ADR-0010~0012 Accepted |
| 2026-07 | 기술 선택 원칙(오픈소스·무료·과금유도 없음) 채택, 스택 감사·조정(EAS 선택적, 백엔드 R2/오픈 대안) | ADR-0013 |
| 2026-07 | ADR 결정 지도(카테고리·관계도) 추가로 결정 구조화 | `decisions/README.md` |
| 2026-07 | ADR을 카테고리 **폴더 구조**로 재편(사람이 트리로 검증 가능) | `decisions/0N-*/` |
| 2026-07 | 네이밍 개선 — 역할명(product-owner/frontend-engineer/backend-engineer/qa-verifier) 통일, 파일명 연도 제거 | `development-process.md` §7 |
| 2026-07 | UI/UX 디자인 역할 `ui-ux-designer` 추가(designs/ 담당) | `.claude/agents/ui-ux-designer.md` |
| 2026-07 | 역할별 결과물 체크리스트(백로그) 작성 | `meta/role-deliverables.md` |

> 이 로그는 요약이다. 각 결정의 맥락·근거·결과는 해당 ADR을, 변경 단위는 git 커밋(컨벤션 `Refs:`)을 본다.

### 갱신 규칙
큰 결정·전환이 생길 때마다 한 줄 추가하고, 근거 ADR/문서를 링크한다.
