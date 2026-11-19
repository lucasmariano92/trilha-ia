import type { Flashcard, Question } from '../../types/curriculum';
import { balance } from '../question-utils';

type Idx = 0 | 1 | 2 | 3;
const pad = (n: number) => String(n).padStart(2, '0');

/** Fábrica de questões de um módulo: id q{módulo}-{nn}, gabarito equilibrado, pendente de revisão humana. */
export function questionFactory(moduleId: string) {
  const worldId = Number(moduleId.split('.')[0]);
  return (
    n: number,
    objectiveIds: string[],
    stem: string,
    options: [string, string, string, string],
    correct: Idx,
    rationale: string,
    distractorRationales: Partial<Record<Idx, string>>,
    difficulty: Question['difficulty'],
    cognitive: Question['cognitive'],
    referenceIds: string[],
  ): Question =>
    balance(
      {
        id: `q${moduleId}-${pad(n)}`, worldId, moduleId, objectiveIds, stem, options, correct, rationale, distractorRationales,
        difficulty, cognitive, referenceIds, review: 'pendente-revisao', contentStatus: 'complementar',
        reviewNote: 'Escrita na Etapa D; aguarda revisão por uma pessoa antes de uso em simulado completo.',
      },
      n,
    );
}

export function cardFactory(moduleId: string) {
  const worldId = Number(moduleId.split('.')[0]);
  return (n: number, objectiveIds: string[], front: string, back: string, referenceIds: string[]): Flashcard => ({
    id: `f${moduleId}-${pad(n)}`, moduleId, worldId, objectiveIds, front, back, referenceIds, status: 'complementar',
  });
}

import type { Activity, Challenge, Lesson, Objective } from '../../types/curriculum';

/** Conteúdo estruturado de um módulo (três níveis). */
export interface ModuleContent {
  objectives: Objective[];
  lessons: Lesson[];
  activities: Activity[];
  challenge: Challenge;
  questions: Question[];
  flashcards: Flashcard[];
  referenceIds: string[];
}
