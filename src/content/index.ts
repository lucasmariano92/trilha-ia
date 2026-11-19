import type { Flashcard, MasteryCriteria, Module, Objective, Question } from '../types/curriculum';
import pdfModules from './pdf-modules.json';
import legacy from './legacy-questions.json';
import { projects, worlds } from './worlds';
import { glossary, getTerm } from './glossary';
import { references, getReference } from './references';
import { balance } from './question-utils';
import { activities1_1, challenge1_1, flashcards1_1, lessons1_1, objectives1_1, questions1_1 } from './modules/m1-1';
import type { ModuleContent } from './modules/builders';
import { m1_2 } from './modules/m1-2';
import { m1_3 } from './modules/m1-3';
import { m1_4 } from './modules/m1-4';
import { m1_5 } from './modules/m1-5';
import { m1_6 } from './modules/m1-6';
import { m1_7 } from './modules/m1-7';
import { m1_8 } from './modules/m1-8';
import { m1_9 } from './modules/m1-9';

/** Módulos já desenvolvidos nos três níveis (além do piloto 1.1). */
const STRUCTURED: Record<string, ModuleContent> = { '1.2': m1_2, '1.3': m1_3, '1.4': m1_4, '1.5': m1_5, '1.6': m1_6, '1.7': m1_7, '1.8': m1_8, '1.9': m1_9 };
const minutesOf = (c: { lessons: { estimatedMinutes: number }[]; activities: { estimatedMinutes: number }[]; challenge: { estimatedMinutes: number } }) =>
  c.lessons.reduce((s, l) => s + l.estimatedMinutes, 0) + c.activities.reduce((s, a) => s + a.estimatedMinutes, 0) + c.challenge.estimatedMinutes;

export const DEFAULT_MASTERY: MasteryCriteria = {
  theoryThreshold: 0.8,
  minEvidencePerObjective: 3,
  objectiveThreshold: 0.8,
  description: [
    'Nível 1 (Entender): atingir pelo menos 80% na verificação de compreensão de cada lição. Vale tanto o modo assistido quanto o independente, mas o sistema registra a diferença.',
    'Nível 2 (Praticar): passar em todas as atividades essenciais com correção automática e registrar a prática externa (esta última é autodeclarada).',
    'Nível 3 (Aplicar): entregar o desafio com autoavaliação pela rubrica. O resultado fica como "autodeclarado"; não há avaliação técnica automática.',
    'Domínio demonstrado: os três níveis acima e, para CADA objetivo, pelo menos 3 respostas independentes (sem consulta), com 80% ou mais de acerto nas últimas 5.',
    'Com menos de 3 respostas independentes, o objetivo aparece como "dados insuficientes" — nunca como dominado ou deficiente.',
  ],
};

/** Pré-requisitos recomendados entre módulos (dentro de cada mundo o PDF permite estudo em paralelo). */
const PREREQS: Record<string, string[]> = {
  '3.3': ['3.1', '3.2'], '3.6': ['3.5'], '3.7': ['3.5'], '3.9': ['3.5', '3.8'], '3.11': ['3.9'],
  '4.3': ['4.1', '4.2'], '4.4': ['4.1'], '4.5': ['4.4'], '4.6': ['4.4', '4.5'], '4.7': ['4.6'],
  '4.8': ['4.3'], '4.9': ['4.3'], '4.10': ['4.6'], '4.11': ['4.3'],
  '5.2': ['5.1'], '5.3': ['5.2'], '5.6': ['5.1'],
};
for (let i = 2; i <= 9; i++) PREREQS[`1.${i}`] = ['1.1'];

const PROGRAMMING = new Set(['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9', '4.10', '4.11', '5.1', '5.2']);

function placeholderObjective(id: string, title: string): Objective {
  return {
    id: `${id}-O0`, moduleId: id, bloom: 'compreender', provisional: true,
    text: `Compreender e aplicar "${title}" conforme o PDF da trilha (objetivo provisório; será detalhado no aprofundamento do módulo).`,
  };
}

function estimateFor(worldId: number, count: number): number {
  const w = worlds.find((x) => x.id === worldId)!;
  const p = projects.find((x) => x.worldId === worldId)!;
  const worldMinutes = w.weeks * 7 * 60; // PDF: 6–8 h/semana → 7 h como ponto médio
  return Math.round((worldMinutes - p.estimatedMinutes) / count / 5) * 5;
}

export const modules: Module[] = pdfModules.modules.map((m, idx) => {
  const worldId = Number(m.id.split('.')[0]);
  const order = Number(m.id.split('.')[1]);
  const count = worlds.find((w) => w.id === worldId)!.moduleIds.length;
  const base: Module = {
    id: m.id, worldId, order, title: m.title, pdfText: m.text, pdfPractice: m.practice ?? undefined,
    isNewInPdf: m.isNew, devState: 'base-pdf', estimatedMinutes: estimateFor(worldId, count),
    prerequisites: PREREQS[m.id] ?? [], objectives: [placeholderObjective(m.id, m.title)],
    lessons: [], activities: [], mastery: DEFAULT_MASTERY, referenceIds: worlds.find((w) => w.id === worldId)!.resourceIds,
    isProgramming: PROGRAMMING.has(m.id),
  };
  void idx;
  const sc = STRUCTURED[m.id];
  if (sc) {
    return {
      ...base, devState: 'piloto-completo', objectives: sc.objectives, lessons: sc.lessons, activities: sc.activities,
      challenge: sc.challenge, estimatedMinutes: minutesOf(sc), referenceIds: sc.referenceIds,
    };
  }
  if (m.id === '1.1') {
    const minutes =
      lessons1_1.reduce((s, l) => s + l.estimatedMinutes, 0) +
      activities1_1.reduce((s, a) => s + a.estimatedMinutes, 0) +
      challenge1_1.estimatedMinutes;
    return {
      ...base, devState: 'piloto-completo', objectives: objectives1_1, lessons: lessons1_1,
      activities: activities1_1, challenge: challenge1_1, estimatedMinutes: minutes,
      referenceIds: ['elements-of-ai', 'google-intro-genai', 'google-intro-llm', 'google-mlcc-intro-llms', 'karpathy-intro-llms', 'karpathy-deep-dive', '3b1b-llm-briefly', 'hf-llm-course-ch1', 'instructgpt-paper'],
    };
  }
  return base;
});

const legacyQuestions: Question[] = legacy.questions.filter((lq) => !STRUCTURED[lq.moduleId]).map((lq, i) =>
  balance(
    {
      id: lq.id, worldId: Number(lq.moduleId.split('.')[0]), moduleId: lq.moduleId,
      objectiveIds: [`${lq.moduleId}-O0`], stem: lq.stem,
      options: lq.options as [string, string, string, string], correct: lq.correct as 0 | 1 | 2 | 3,
      rationale: lq.rationale, difficulty: 'basica', cognitive: 'compreensao', referenceIds: [],
      review: 'provisoria', contentStatus: 'provisorio',
      reviewNote: 'Herdada da v1: alternativas incorretas fracas, sem explicação por alternativa e sem referência específica. Reescrever no aprofundamento do módulo.',
    },
    i + 1,
  ),
);

/**
 * Questões sem referência própria herdam as referências da lição em cuja verificação aparecem
 * (a teoria da lição é a base da questão).
 */
function withLessonRefs(list: Question[], lessonList: { checkQuestionIds: string[]; referenceIds: string[] }[]): Question[] {
  return list.map((q) => {
    if (q.referenceIds.length) return q;
    const l = lessonList.find((x) => x.checkQuestionIds.includes(q.id));
    return l ? { ...q, referenceIds: [...l.referenceIds] } : q;
  });
}

export const questions: Question[] = [
  ...questions1_1,
  ...Object.values(STRUCTURED).flatMap((c) => withLessonRefs(c.questions, c.lessons)),
  ...legacyQuestions,
];

const PDF_TERM_MODULE: Record<string, string> = {
  llm: '1.1', token: '1.2', 'janela-contexto': '1.3', alucinacao: '1.4', embedding: '1.5', temperatura: '1.6',
  'few-shot': '2.2', 'system-prompt': '2.3', api: '3.3', webhook: '3.6', 'tool-use': '3.8', agente: '3.9', mcp: '3.10',
  chunking: '4.6', 'banco-vetorial': '4.5', rag: '4.6', reranking: '4.6', langgraph: '4.8', eval: '4.10',
  'prompt-injection': '5.4', guardrail: '5.4', 'fine-tuning': '5.7',
};

/** Flashcards do glossário do PDF (definição literal da trilha). */
const glossaryCards: Flashcard[] = glossary
  .filter((g) => g.status === 'pdf')
  .map((g) => {
    const moduleId = PDF_TERM_MODULE[g.id];
    return {
      id: `fg-${g.id}`, moduleId, worldId: Number(moduleId.split('.')[0]),
      objectiveIds: [moduleId === '1.1' ? '1.1-O2' : STRUCTURED[moduleId] ? STRUCTURED[moduleId].objectives[0].id : `${moduleId}-O0`],
      front: `O que é ${g.term}${g.english ? ` (${g.english})` : ''}?`, back: g.definition,
      referenceIds: [], status: 'pdf' as const,
    };
  });

export const flashcards: Flashcard[] = [...flashcards1_1, ...Object.values(STRUCTURED).flatMap((c) => c.flashcards), ...glossaryCards];

export { worlds, projects, glossary, references, getReference, getTerm };

/* ---------- consultas ---------- */
const moduleById = new Map(modules.map((m) => [m.id, m]));
const questionById = new Map(questions.map((q) => [q.id, q]));
const allLessons = modules.flatMap((m) => m.lessons);
const lessonById = new Map(allLessons.map((l) => [l.id, l]));
const allActivities = modules.flatMap((m) => m.activities);
const activityById = new Map(allActivities.map((a) => [a.id, a]));
const allObjectives = modules.flatMap((m) => m.objectives);
const objectiveById = new Map(allObjectives.map((o) => [o.id, o]));

export const getModule = (id: string) => moduleById.get(id);
export const getQuestion = (id: string) => questionById.get(id);
export const getLesson = (id: string) => lessonById.get(id);
export const getActivity = (id: string) => activityById.get(id);
export const getObjective = (id: string) => objectiveById.get(id);
export const getWorld = (id: number) => worlds.find((w) => w.id === id);
export const getProject = (id: string) => projects.find((p) => p.id === id);
export const lessons = allLessons;
export const objectives = allObjectives;
export const modulesOfWorld = (worldId: number) => modules.filter((m) => m.worldId === worldId);
export const questionsOfModule = (moduleId: string) => questions.filter((q) => q.moduleId === moduleId);
export const flashcardsOfModule = (moduleId: string) => flashcards.filter((f) => f.moduleId === moduleId);
