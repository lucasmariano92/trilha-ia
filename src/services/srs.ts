import type { Grade, SrsState } from '../types/progress';
import { addDays, diffDays, localDate } from './dates';

/**
 * Revisão espaçada — variante documentada do SM-2 (Piotr Woźniak, 1987) com quatro botões.
 *
 * Estado por cartão: intervalo (dias), facilidade (ease, mínimo 1,3), acertos seguidos (reps), lapsos.
 *
 *  Errei   → reps = 0, lapsos + 1, ease − 0,20, volta amanhã (intervalo 1).
 *  Difícil → intervalo = máx(1, intervalo × 1,2) (no 1º acerto: 1 dia), ease − 0,15.
 *  Bom     → 1º acerto: 1 dia; 2º: 3 dias; depois: intervalo × ease.
 *  Fácil   → 1º acerto: 4 dias; depois: intervalo × ease × 1,3; ease + 0,15.
 *
 * "Consolidado" só quando o intervalo chega a 21 dias ou mais e a última resposta foi Bom ou Fácil.
 * Lembrar de um cartão logo depois de revelá-lo NÃO é domínio: por isso o estado de domínio do módulo
 * usa apenas respostas independentes às questões, e os flashcards servem para manutenção.
 */

export const MIN_EASE = 1.3;
export const START_EASE = 2.5;
export const CONSOLIDATED_DAYS = 21;
export const MAX_INTERVAL = 365;

export function newCard(today: string = localDate()): SrsState {
  return { due: today, interval: 0, ease: START_EASE, reps: 0, lapses: 0 };
}

export function schedule(prev: SrsState | undefined, grade: Grade, today: string = localDate()): SrsState {
  const s = prev ?? newCard(today);
  let { interval, ease, reps, lapses } = s;

  switch (grade) {
    case 'errei':
      reps = 0;
      lapses += 1;
      ease = Math.max(MIN_EASE, ease - 0.2);
      interval = 1;
      break;
    case 'dificil':
      reps += 1;
      ease = Math.max(MIN_EASE, ease - 0.15);
      interval = reps === 1 ? 1 : Math.max(1, Math.round(interval * 1.2));
      break;
    case 'bom':
      reps += 1;
      interval = reps === 1 ? 1 : reps === 2 ? 3 : Math.round(interval * ease);
      break;
    case 'facil':
      reps += 1;
      interval = reps === 1 ? 4 : Math.round(Math.max(interval, 1) * ease * 1.3);
      ease = ease + 0.15;
      break;
  }
  interval = Math.min(MAX_INTERVAL, Math.max(1, interval));
  return { due: addDays(today, interval), interval, ease: Math.round(ease * 100) / 100, reps, lapses, lastGrade: grade, lastReviewed: today };
}

export const isDue = (s: SrsState | undefined, today: string = localDate()) => !!s && s.due <= today;
export const overdueDays = (s: SrsState, today: string = localDate()) => Math.max(0, diffDays(s.due, today));
export const isConsolidated = (s: SrsState | undefined) =>
  !!s && s.interval >= CONSOLIDATED_DAYS && (s.lastGrade === 'bom' || s.lastGrade === 'facil');
