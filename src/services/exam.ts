import type { Question } from '../types/curriculum';
import type { ActiveExam, ExamAttempt } from '../types/progress';
import { newId } from './dates';

/** Simulado completo: 60 questões, 1 h 50 min (seção 7 do prompt mestre). */
export const FULL_EXAM_QUESTIONS = 60;
export const FULL_EXAM_SECONDS = 110 * 60;
export const SECONDS_PER_QUESTION = FULL_EXAM_SECONDS / FULL_EXAM_QUESTIONS; // 110 s
export const TRAINING_MAX_QUESTIONS = 20;

/** Elegível para o simulado completo: somente questões REVISADAS por uma pessoa. */
export const eligibleForFullExam = (q: Question) => q.review === 'revisada';
/** Treino: aceita pendentes e provisórias, sempre identificadas na tela. */
export const eligibleForTraining = (_q: Question) => true;

export interface Eligibility {
  eligible: number;
  required: number;
  missing: number;
  canStart: boolean;
}

export function fullExamEligibility(bank: Question[]): Eligibility {
  const eligible = bank.filter(eligibleForFullExam).length;
  const missing = Math.max(0, FULL_EXAM_QUESTIONS - eligible);
  return { eligible, required: FULL_EXAM_QUESTIONS, missing, canStart: missing === 0 };
}

/** Embaralhamento com semente (Mulberry32 + Fisher–Yates), para testes reproduzíveis. */
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  let a = seed >>> 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Seleciona questões DISTINTAS, distribuindo entre módulos (round-robin) para cobrir mais assuntos.
 * Lança erro se não houver questões suficientes — nunca repete itens para completar a prova.
 */
export function selectQuestions(bank: Question[], count: number, seed: number): Question[] {
  const unique = [...new Map(bank.map((q) => [q.id, q])).values()];
  if (unique.length < count) throw new Error(`Banco insuficiente: ${unique.length} de ${count} questões.`);
  const byModule = new Map<string, Question[]>();
  for (const q of seededShuffle(unique, seed)) {
    const list = byModule.get(q.moduleId) ?? [];
    list.push(q);
    byModule.set(q.moduleId, list);
  }
  const groups = seededShuffle([...byModule.values()], seed + 1);
  const out: Question[] = [];
  while (out.length < count) {
    for (const g of groups) {
      const next = g.shift();
      if (next) out.push(next);
      if (out.length === count) break;
    }
  }
  return out;
}

export function createExam(
  bank: Question[],
  mode: 'completo' | 'treino',
  nowMs: number,
  seed: number = nowMs,
): ActiveExam {
  let pool: Question[];
  let count: number;
  if (mode === 'completo') {
    const e = fullExamEligibility(bank);
    if (!e.canStart) throw new Error(`Faltam ${e.missing} questões revisadas para o simulado completo.`);
    pool = bank.filter(eligibleForFullExam);
    count = FULL_EXAM_QUESTIONS;
  } else {
    pool = bank.filter(eligibleForTraining);
    count = Math.min(TRAINING_MAX_QUESTIONS, pool.length);
  }
  const qs = selectQuestions(pool, count, seed);
  return {
    id: newId(), mode, questionIds: qs.map((q) => q.id), answers: {}, flags: [], current: 0,
    startedAtMs: nowMs,
    durationSec: mode === 'completo' ? FULL_EXAM_SECONDS : Math.round(count * SECONDS_PER_QUESTION),
  };
}

/** Tempo restante calculado SEMPRE a partir do horário de início (recarregar a página não reinicia). */
export function remainingSeconds(exam: ActiveExam, nowMs: number): number {
  return Math.max(0, Math.ceil((exam.startedAtMs + exam.durationSec * 1000 - nowMs) / 1000));
}

export const isExpired = (exam: ActiveExam, nowMs: number) => remainingSeconds(exam, nowMs) === 0;

export function gradeExam(
  exam: ActiveExam,
  lookup: (id: string) => Question | undefined,
  nowMs: number,
  reason: ExamAttempt['reason'],
): ExamAttempt {
  const answers = exam.questionIds.map((id) => {
    const q = lookup(id);
    const chosen = exam.answers[id] ?? null;
    return { questionId: id, chosen, correct: !!q && chosen === q.correct };
  });
  const used = Math.min(exam.durationSec, Math.max(0, Math.round((nowMs - exam.startedAtMs) / 1000)));
  return {
    id: exam.id, mode: exam.mode, startedAt: new Date(exam.startedAtMs).toISOString(), finishedAt: new Date(nowMs).toISOString(),
    durationSec: exam.durationSec, usedSec: used, reason, answers,
    correct: answers.filter((a) => a.correct).length, total: answers.length,
  };
}

export interface TopicResult { key: string; correct: number; total: number }

/** Resultado agrupado por módulo (assunto). */
export function resultByModule(attempt: ExamAttempt, lookup: (id: string) => Question | undefined): TopicResult[] {
  const map = new Map<string, TopicResult>();
  for (const a of attempt.answers) {
    const q = lookup(a.questionId);
    if (!q) continue;
    const r = map.get(q.moduleId) ?? { key: q.moduleId, correct: 0, total: 0 };
    r.total++;
    if (a.correct) r.correct++;
    map.set(q.moduleId, r);
  }
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key, 'pt-BR', { numeric: true }));
}

export function examStatus(exam: ActiveExam) {
  const answered = exam.questionIds.filter((id) => exam.answers[id] !== undefined).length;
  return { answered, pending: exam.questionIds.length - answered, flagged: exam.flags.length };
}
