# backend

**Phase 2 전용** — 서버는 백업/복원(및 향후 2인 공유) 용도. **로컬 우선 MVP에는 서버가 없다.** (ADR-0007)

## 방향 (제안, 미확정)

- **S3 단일 압축 아카이브**로 전체 데이터셋 스냅샷 백업/복원. 상시 서버·DB 없음.
- **인증은 이 단계에서만** 필요(수단 미정: 매직링크/클라우드 계정 등). (ADR-0008)
- 서버리스(예: Lambda + S3) 지향, 최소 운영.
- 2인 실시간 공유가 필요해지면 sync engine(PowerSync/ElectricSQL/Yjs) 검토.

## 상태

🟡 골격만. Phase 1(로컬 MVP) 이후 착수. 상세: `../docs/02-construction/01-architecture.md` Phase 2.
