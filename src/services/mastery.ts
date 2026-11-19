import type { Activity, GradedActivity, Module } from '../types/curriculum';
import type { AnswerRecord, UserData } from '../types/progress';
import { flashcardsOfModule } from '../content';
import { localDate } from './dates';
import { overdueDays } from './srs';

/* ======================================================================
 * Estatística por objetivo de aprendizagem
 * ==================================================================== */

export type ObjectiveLevel = 'dados-insuficientes' | 'dominado' | 'em-progresso' | 'dificuldade';

export interface ObjectiveStats {
  objectiveId: string;
  total: number; // todas as respostas (inclui assistidas)
  correct: number;
  independent: number; // respostas que contam como evidência
  independentCorrect: number;
  recentAccuracy: number | null; // nas últimas RECENT_WINDOW independentes
  level: ObjectiveLevel;
  /** Respostas erradas dadas com confiança alta: sinal de concepção equivocada. */
  confidentErrors: number;
}

export const RECENT_WINDOW = 5;
export const DIFFICULTY_THRESHOLD = 0.6;

export const isIndependent = (a: AnswerRecord) => a.mode !== 'assistido';

export function objectiveStats(
  objectiveId: string,
  answers: AnswerRecord[],
  minEvidence = 3,
  threshold = 0.8,
): ObjectiveStats {
  const all = answers.filter((a) => a.objectiveIds.includes(objectiveId));
  const ind = all.filter(isIndependent).sort((a, b) => a.at.localeCompare(b.at));
  const recent = ind.slice(-RECENT_WINDOW);
  const recentAccuracy = recent.length ? recent.filter((a) => a.correct).length / recent.length : null;
  let level: ObjectiveLevel = 'dados-insuficientes';
  if (ind.length >= minEvidence && recentAccuracy !== null) {
    level = recentAccuracy >= threshold ? 'dominado' : recentAccuracy < DIFFICULTY_THRESHOLD ? 'dificuldade' : 'em-progresso';
  }
  return {
    objectiveId,
    total: all.length,
    correct: all.filter((a) => a.correct).length,
    independent: ind.length,
    independentCorrect: ind.filter((a) => a.correct).length,
    recentAccuracy,
    level,
    confidentErrors: all.filter((a) => !a.correct && a.confidence === 3).length,
  };
}

/* ======================================================================
 * Níveis 1, 2 e 3
 * ==================================================================== */

export function bestCheckScore(lessonId: string, data: UserData): { ratio: number; mode: 'assistido' | 'independente' } | null {
  const attempts = data.checkAttempts.filter((c) => c.lessonId === lessonId && c.total > 0);
  if (!attempts.length) return null;
  const best = attempts.reduce((b, c) => (c.correct / c.total > b.correct / b.total ? c : b));
  return { ratio: best.correct / best.total, mode: best.mode };
}

export function lessonTheoryDone(lessonId: string, data: UserData, threshold = 0.8): boolean {
  const best = bestCheckScore(lessonId, data);
  return !!best && best.ratio >= threshold;
}

export function level1Done(m: Module, data: UserData): boolean {
  if (!m.lessons.length) return false;
  return m.lessons.every((l) => lessonTheoryDone(l.id, data, m.mastery.theoryThreshold));
}

export const isGraded = (a: Activity): a is GradedActivity => a.kind === 'classify' || a.kind === 'order' || a.kind === 'judge' || a.kind === 'numeric';

export function activityPassed(a: Activity, data: UserData): boolean {
  if (isGraded(a)) return data.activityAttempts.some((t) => t.activityId === a.id && t.passed);
  if (a.kind === 'external') return !!data.externalLogs[a.id];
  return !!data.demosViewed[a.id];
}

export function level2Done(m: Module, data: UserData): boolean {
  const essentials = m.activities.filter((a) => a.essential);
  if (!essentials.length) return false;
  return essentials.every((a) => activityPassed(a, data));
}

/** Quais atividades essenciais foram concluídas só por autodeclaração. */
export function level2SelfReported(m: Module, data: UserData): string[] {
  return m.activities.filter((a) => a.essential && a.kind === 'external' && data.externalLogs[a.id]).map((a) => a.id);
}

export function level3Done(m: Module, data: UserData): boolean {
  if (!m.challenge) return false;
  return data.challenges[m.challenge.id]?.status === 'autodeclarado';
}

/* ======================================================================
 * Estado do módulo
 * ==================================================================== */

export type ModuleStatus =
  | 'nao-iniciado'
  | 'em-estudo'
  | 'teoria-concluida'
  | 'pratica-concluida'
  | 'aplicacao-entregue'
  | 'dominio-demonstrado'
  | 'revisao-necessaria';

export const STATUS_LABEL: Record<ModuleStatus, string> = {
  'nao-iniciado': 'Não iniciado',
  'em-estudo': 'Em estudo',
  'teoria-concluida': 'Teoria concluída',
  'pratica-concluida': 'Prática concluída',
  'aplicacao-entregue': 'Aplicação entregue',
  'dominio-demonstrado': 'Domínio demonstrado',
  'revisao-necessaria': 'Revisão necessária',
};

/** Revisões vencidas há mais de N dias que, somadas, sinalizam esquecimento. */
export const OVERDUE_DAYS_LIMIT = 7;
export const OVERDUE_CARDS_LIMIT = 3;

function started(m: Module, data: UserData): boolean {
  const lessonIds = new Set(m.lessons.map((l) => l.id));
  const actIds = new Set(m.activities.map((a) => a.id));
  return (
    m.lessons.some((l) => data.lessonsOpened[l.id]) ||
    data.checkAttempts.some((c) => lessonIds.has(c.lessonId)) ||
    data.activityAttempts.some((a) => actIds.has(a.activityId)) ||
    !!data.selfReportedStudy[m.id] ||
    Object.values(data.studyTime).some((day) => (day[m.id] ?? 0) > 0)
  );
}

export interface ModuleEvaluation {
  status: ModuleStatus;
  l1: boolean;
  l2: boolean;
  l3: boolean;
  objectives: ObjectiveStats[];
  allObjectivesMastered: boolean;
  reviewReasons: string[];
  selfReportedL2: string[];
  /** Módulo sem conteúdo estruturado: só registro autodeclarado. */
  contentPending: boolean;
}

export function evaluateModule(m: Module, data: UserData, today: string = localDate()): ModuleEvaluation {
  const l1 = level1Done(m, data);
  const l2 = level2Done(m, data);
  const l3 = level3Done(m, data);
  const objectives = m.objectives.map((o) =>
    objectiveStats(o.id, data.answers, m.mastery.minEvidencePerObjective, m.mastery.objectiveThreshold),
  );
  const allObjectivesMastered = objectives.length > 0 && objectives.every((o) => o.level === 'dominado');

  const reviewReasons: string[] = [];
  for (const o of objectives) if (o.level === 'dificuldade') reviewReasons.push(`Desempenho abaixo de 60% nas últimas respostas do objetivo ${o.objectiveId}.`);
  const overdue = flashcardsOfModule(m.id).filter((c) => {
    const s = data.flashcards[c.id];
    return s && overdueDays(s, today) > OVERDUE_DAYS_LIMIT;
  });
  if (overdue.length >= OVERDUE_CARDS_LIMIT) reviewReasons.push(`${overdue.length} flashcards com revisão atrasada há mais de ${OVERDUE_DAYS_LIMIT} dias.`);

  let status: ModuleStatus = started(m, data) ? 'em-estudo' : 'nao-iniciado';
  if (l1) status = 'teoria-concluida';
  if (l1 && l2) status = 'pratica-concluida';
  if (l1 && l2 && l3) status = 'aplicacao-entregue';
  if (l1 && l2 && l3 && allObjectivesMastered) status = 'dominio-demonstrado';
  if (l1 && reviewReasons.length) status = 'revisao-necessaria';

  return {
    status, l1, l2, l3, objectives, allObjectivesMastered, reviewReasons,
    selfReportedL2: level2SelfReported(m, data), contentPending: m.devState !== 'piloto-completo',
  };
}

/** Fração de níveis cumpridos com evidência (0–1). Módulos sem conteúdo estruturado valem 0. */
export function moduleLevelFraction(m: Module, data: UserData): number {
  if (m.devState !== 'piloto-completo') return 0;
  return [level1Done(m, data), level2Done(m, data), level3Done(m, data)].filter(Boolean).length / 3;
}
