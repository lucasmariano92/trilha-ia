import type { AnswerRecord, UserData } from '../src/types/progress';
import { emptyUserData } from '../src/services/schema';

export const fresh = (): UserData => emptyUserData('2026-11-18T12:00:00.000Z');

let n = 0;
export function answer(objectiveId: string, correct: boolean, mode: AnswerRecord['mode'] = 'independente', extra: Partial<AnswerRecord> = {}): AnswerRecord {
  n++;
  return { questionId: `q${n}`, objectiveIds: [objectiveId], chosen: correct ? 0 : 1, correct, mode, at: `2026-11-18T12:${String(n % 60).padStart(2, '0')}:00.000Z`, ...extra };
}
