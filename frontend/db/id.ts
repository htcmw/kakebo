/**
 * 로컬 레코드 ID 생성 (UUID v4).
 * 로컬 정본 DB의 PK 용도 — 암호학적 강도가 필요 없어 Math.random 기반으로 충분하다.
 * (원문 비저장·매칭용 해시는 별도, NFR-PRV / 07-sqlite-schema.md §6)
 */
export function newId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
