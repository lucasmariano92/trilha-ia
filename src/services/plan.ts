import type { UserData } from '../types/progress';
import { modules, projects } from '../content';
import { evaluateModule } from './mastery';
import { addDays, localDate } from './dates';
import { isDue } from './srs';

/* ======================================================================
 * Plano de sessão adaptativo
 * ==================================================================== */

export type DayType = 'padrao' | 'introducao' | 'programacao' | 'revisao' | 'projeto';

export const DAY_LABEL: Record<DayType, string> = {
  padrao: 'Sessão equilibrada',
  introducao: 'Dia de introdução (mais teoria)',
  programacao: 'Dia de programação (mais prática)',
  revisao: 'Dia de revisão (exercícios e flashcards)',
  projeto: 'Dia de projeto (implementação)',
};

/** Distribuição em frações da sessão: teoria, prática, questões, revisão. */
export const DISTRIBUTIONS: Record<DayType, { teoria: number; pratica: number; questoes: number; revisao: number }> = {
  padrao: { teoria: 25 / 60, pratica: 20 / 60, questoes: 10 / 60, revisao: 5 / 60 },
  introducao: { teoria: 35 / 60, pratica: 10 / 60, questoes: 10 / 60, revisao: 5 / 60 },
  programacao: { teoria: 15 / 60, pratica: 30 / 60, questoes: 10 / 60, revisao: 5 / 60 },
  revisao: { teoria: 10 / 60, pratica: 10 / 60, questoes: 20 / 60, revisao: 20 / 60 },
  projeto: { teoria: 5 / 60, pratica: 45 / 60, questoes: 5 / 60, revisao: 5 / 60 },
};

export interface SessionContext {
  dueCards: number;
  nextTarget: 'entender' | 'praticar' | 'aplicar' | 'revisar' | 'estudar-pdf' | 'projeto';
  isProgramming: boolean;
  weakObjectives: number;
}

export const REVIEW_DAY_CARDS = 15;

export function chooseDayType(ctx: SessionContext): DayType {
  if (ctx.dueCards >= REVIEW_DAY_CARDS || ctx.weakObjectives >= 2 || ctx.nextTarget === 'revisar') return 'revisao';
  if (ctx.nextTarget === 'aplicar' || ctx.nextTarget === 'projeto') return 'projeto';
  if (ctx.nextTarget === 'praticar') return ctx.isProgramming ? 'programacao' : 'padrao';
  if (ctx.nextTarget === 'entender' || ctx.nextTarget === 'estudar-pdf') return ctx.isProgramming ? 'padrao' : 'introducao';
  return 'padrao';
}

export function sessionPlan(sessionMinutes: number, type: DayType) {
  const d = DISTRIBUTIONS[type];
  const teoria = Math.round(sessionMinutes * d.teoria);
  const pratica = Math.round(sessionMinutes * d.pratica);
  const questoes = Math.round(sessionMinutes * d.questoes);
  const revisao = Math.max(0, sessionMinutes - teoria - pratica - questoes); // fecha a soma exata
  return { type, label: DAY_LABEL[type], teoria, pratica, questoes, revisao, total: sessionMinutes };
}

/* ======================================================================
 * Previsão de conclusão
 * ==================================================================== */

/** Acréscimo para revisões espaçadas sobre a carga de conteúdo (estimativa documentada). */
export const REVIEW_OVERHEAD = 0.1;

export function remainingMinutes(data: UserData): { content: number; projects: number; reviews: number; total: number } {
  let content = 0;
  for (const m of modules) {
    if (m.devState === 'piloto-completo') {
      const ev = evaluateModule(m, data);
      const levelsLeft = 3 - [ev.l1, ev.l2, ev.l3].filter(Boolean).length;
      content += (m.estimatedMinutes * levelsLeft) / 3;
    } else if (!data.selfReportedStudy[m.id]) {
      content += m.estimatedMinutes;
    }
  }
  const proj = projects.filter((p) => data.projects[p.id]?.status !== 'autodeclarado').reduce((s, p) => s + p.estimatedMinutes, 0);
  const reviews = Math.round((content + proj) * REVIEW_OVERHEAD);
  return { content: Math.round(content), projects: proj, reviews, total: Math.round(content) + proj + reviews };
}

export function forecast(totalMinutes: number, daysPerWeek: number, sessionMinutes: number, today: string = localDate()) {
  const perWeek = Math.max(1, Math.min(7, daysPerWeek)) * Math.max(10, sessionMinutes);
  const sessions = Math.ceil(totalMinutes / Math.max(10, sessionMinutes));
  const weeks = totalMinutes / perWeek;
  const days = Math.ceil(weeks * 7);
  return { sessions, weeks: Math.ceil(weeks * 10) / 10, days, date: addDays(today, days) };
}

/* ======================================================================
 * Tempo registrado
 * ==================================================================== */

export function recordedSeconds(data: UserData, moduleId?: string): number {
  return Object.values(data.studyTime).reduce(
    (s, day) => s + Object.entries(day).reduce((t, [k, v]) => t + (!moduleId || k === moduleId ? v : 0), 0),
    0,
  );
}

export function dueCardsCount(data: UserData, today: string = localDate()): number {
  return Object.values(data.flashcards).filter((s) => isDue(s, today)).length;
}

/** Sequência de dias com estudo ativo registrado (>= 5 min). */
export function streak(data: UserData, today: string = localDate()): number {
  const studied = (d: string) => Object.values(data.studyTime[d] ?? {}).reduce((a, b) => a + b, 0) >= 300;
  let d = studied(today) ? today : addDays(today, -1);
  let n = 0;
  while (studied(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}
