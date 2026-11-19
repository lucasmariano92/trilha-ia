import type { Module, World } from '../types/curriculum';
import type { UserData } from '../types/progress';
import { getModule, getProject, modules, modulesOfWorld, questions, worlds } from '../content';
import type { Question } from '../types/curriculum';
import { evaluateModule, level1Done, moduleLevelFraction } from './mastery';

/* ======================================================================
 * Progresso
 * ==================================================================== */

export interface ProgressSummary {
  /** Fração de níveis cumpridos COM EVIDÊNCIA nos módulos com conteúdo estruturado. */
  verified: number;
  /** Módulos com conteúdo estruturado disponível. */
  structuredModules: number;
  /** Módulos marcados como estudados por autodeclaração (conteúdo ainda só do PDF). */
  selfReported: number;
  totalModules: number;
}

export function progressSummary(data: UserData, list: Module[] = modules): ProgressSummary {
  const structured = list.filter((m) => m.devState === 'piloto-completo');
  const verified = structured.length ? structured.reduce((s, m) => s + moduleLevelFraction(m, data), 0) / structured.length : 0;
  return {
    verified,
    structuredModules: structured.length,
    selfReported: list.filter((m) => m.devState !== 'piloto-completo' && data.selfReportedStudy[m.id]).length,
    totalModules: list.length,
  };
}

/** Progresso de um mundo: módulos estruturados contam por níveis; módulos só-PDF contam por autodeclaração. */
export function worldProgress(worldId: number, data: UserData): { verified: number; selfReported: number; total: number } {
  const ms = modulesOfWorld(worldId);
  const verified = ms.reduce((s, m) => s + moduleLevelFraction(m, data), 0);
  const selfReported = ms.filter((m) => m.devState !== 'piloto-completo' && data.selfReportedStudy[m.id]).length;
  return { verified, selfReported, total: ms.length };
}

/* ======================================================================
 * Pré-requisitos
 * ==================================================================== */

/** Um pré-requisito está atendido se o módulo tem teoria concluída (estruturado) ou estudo autodeclarado (só PDF). */
export function moduleMeetsAsPrereq(m: Module, data: UserData): boolean {
  return m.devState === 'piloto-completo' ? level1Done(m, data) : !!data.selfReportedStudy[m.id];
}

export function missingPrerequisites(moduleId: string, data: UserData): string[] {
  const m = getModule(moduleId);
  if (!m) return [];
  return m.prerequisites.filter((pid) => {
    const p = getModule(pid);
    return p ? !moduleMeetsAsPrereq(p, data) : false;
  });
}

/* ======================================================================
 * Checkpoints e liberação de mundos
 * ==================================================================== */

/** Avaliação prática do checkpoint: questões sem consulta dos módulos estruturados do mundo. */
export const CHECKPOINT_QUIZ_SIZE = 10;
export const CHECKPOINT_QUIZ_THRESHOLD = 0.8;
export const checkpointQuizId = (worldId: number) => `checkpoint-${worldId}`;

export function checkpointQuizPool(worldId: number): Question[] {
  const ids = new Set(modulesOfWorld(worldId).filter((m) => m.devState === 'piloto-completo').map((m) => m.id));
  return questions.filter((q) => ids.has(q.moduleId));
}

export function checkpointQuizBest(worldId: number, data: UserData): number | null {
  const att = data.checkAttempts.filter((c) => c.lessonId === checkpointQuizId(worldId) && c.mode === 'independente');
  return att.length ? Math.max(...att.map((a) => a.correct / a.total)) : null;
}

export interface CheckpointEvaluation {
  worldId: number;
  itemsDone: number;
  itemsTotal: number;
  modulesReady: number;
  modulesTotal: number;
  projectDelivered: boolean;
  quizAvailable: boolean;
  quizBest: number | null;
  passed: boolean;
  missing: string[];
}

/**
 * Critério do checkpoint (o PDF exige passar no checkpoint antes de avançar de mundo):
 *  1. Todos os itens do checkpoint autoavaliados "consigo sem consultar".
 *  2. Todos os módulos do mundo prontos: teoria concluída (módulos estruturados) ou estudo autodeclarado (só PDF).
 *  3. Projeto do mundo entregue (autodeclarado).
 *  4. Quando o mundo tem questões suficientes: avaliação prática com 10 questões sem consulta, ≥ 80%.
 * Os itens 1 e 3 são autodeclarados; o item 4 é corrigido automaticamente.
 */
export function evaluateCheckpoint(world: World, data: UserData): CheckpointEvaluation {
  const work = data.checkpoints[String(world.id)];
  const itemsDone = world.checkpoint.items.filter((i) => work?.items[i.id]).length;
  const ms = modulesOfWorld(world.id);
  const modulesReady = ms.filter((m) => moduleMeetsAsPrereq(m, data)).length;
  const project = getProject(world.projectId);
  const projectDelivered = !!project && data.projects[project.id]?.status === 'autodeclarado';
  const missing: string[] = [];
  if (itemsDone < world.checkpoint.items.length) missing.push(`${world.checkpoint.items.length - itemsDone} item(ns) do checkpoint sem autoavaliação positiva`);
  if (modulesReady < ms.length) missing.push(`${ms.length - modulesReady} módulo(s) sem teoria concluída ou estudo registrado`);
  if (!projectDelivered) missing.push(`projeto "${project?.title}" ainda não entregue`);
  const quizAvailable = checkpointQuizPool(world.id).length >= CHECKPOINT_QUIZ_SIZE;
  const quizBest = checkpointQuizBest(world.id, data);
  if (quizAvailable && (quizBest ?? 0) < CHECKPOINT_QUIZ_THRESHOLD) missing.push(`avaliação prática do checkpoint (${CHECKPOINT_QUIZ_SIZE} questões sem consulta, mínimo ${CHECKPOINT_QUIZ_THRESHOLD * 100}%)`);
  return {
    worldId: world.id, itemsDone, itemsTotal: world.checkpoint.items.length, modulesReady, modulesTotal: ms.length,
    projectDelivered, quizAvailable, quizBest, passed: missing.length === 0, missing,
  };
}

/** Um mundo está liberado se é o Mundo 1 ou se o checkpoint do mundo anterior foi cumprido. */
export function isWorldUnlocked(worldId: number, data: UserData): boolean {
  if (worldId <= 1) return true;
  const prev = worlds.find((w) => w.id === worldId - 1);
  return !!prev && evaluateCheckpoint(prev, data).passed;
}

/** Próximo passo sugerido: primeira pendência no primeiro módulo estruturado não dominado. */
export function nextStep(data: UserData): { moduleId: string; target: 'entender' | 'praticar' | 'aplicar' | 'revisar' | 'estudar-pdf'; lessonId?: string } {
  for (const m of modules) {
    if (!isWorldUnlocked(m.worldId, data)) break;
    if (m.devState === 'piloto-completo') {
      const ev = evaluateModule(m, data);
      if (ev.status === 'revisao-necessaria') return { moduleId: m.id, target: 'revisar' };
      const lesson = m.lessons.find((l) => !data.checkAttempts.some((c) => c.lessonId === l.id && c.correct / c.total >= m.mastery.theoryThreshold));
      if (lesson) return { moduleId: m.id, target: 'entender', lessonId: lesson.id };
      if (!ev.l2) return { moduleId: m.id, target: 'praticar' };
      if (!ev.l3) return { moduleId: m.id, target: 'aplicar' };
    } else if (!data.selfReportedStudy[m.id]) {
      return { moduleId: m.id, target: 'estudar-pdf' };
    }
  }
  return { moduleId: modules[0].id, target: 'revisar' };
}
