// US 20185 Chunk 3 — session-only handover list per Program, so handovers
// created in Program Log (with their checklist results) survive switching
// Programs or leaving Program Log. Cleared on page reload; no persistence.

const byProgram = new Map<string, unknown[]>();

export function getSessionHandovers<T>(
  programId: string | number,
  seed: () => T[],
): T[] {
  const key = String(programId);
  if (!byProgram.has(key)) byProgram.set(key, seed());
  return byProgram.get(key) as T[];
}

export function setSessionHandovers<T>(programId: string | number, list: T[]) {
  byProgram.set(String(programId), list);
}
