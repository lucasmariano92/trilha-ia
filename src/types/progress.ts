/**
 * Tipos dos DADOS PESSOAIS do aluno (progresso, respostas, anotações).
 * Ficam apenas no navegador (localStorage). Nunca guardar senhas, tokens ou chaves aqui.
 */

export const SCHEMA_VERSION = 2 as const;

export type ThemePref = 'claro' | 'escuro' | 'sistema';

export interface Preferences {
  theme: ThemePref;
  daysPerWeek: number; // 1–7
  sessionMinutes: number; // 20–180, padrão 60
}

/** Como a resposta foi dada. Só "assistido" NÃO conta como evidência independente. */
export type AnswerMode = 'assistido' | 'independente' | 'treino' | 'simulado';

export interface AnswerRecord {
  questionId: string;
  objectiveIds: string[];
  chosen: number | null; // null = em branco
  correct: boolean;
  mode: AnswerMode;
  at: string; // ISO
  /** Confiança informada pelo aluno antes de ver a correção: 1 baixa, 2 média, 3 alta. */
  confidence?: 1 | 2 | 3;
  /** Agrupa respostas de uma mesma verificação/simulado. */
  sessionId?: string;
}

export interface CheckAttempt {
  id: string;
  lessonId: string;
  mode: 'assistido' | 'independente';
  correct: number;
  total: number;
  at: string;
}

export interface ActivityAttempt {
  id: string;
  activityId: string;
  moduleId: string;
  score: number;
  max: number;
  passed: boolean;
  hintsUsed: number;
  /** Ids dos itens errados, para recomendar revisão. */
  wrongItemIds: string[];
  at: string;
}

export interface ExternalLog {
  activityId: string;
  fields: Record<string, string>;
  savedAt: string;
  selfReported: true;
}

export interface ChallengeWork {
  decisions: string;
  evidence: string;
  difficulties: string;
  improvements: string;
  checklist: Record<string, boolean>;
  rubric: Record<string, number>;
  status: 'rascunho' | 'autodeclarado';
  submittedAt?: string;
  updatedAt: string;
}

export type Grade = 'errei' | 'dificil' | 'bom' | 'facil';

export interface SrsState {
  due: string; // AAAA-MM-DD
  interval: number; // dias
  ease: number; // fator de facilidade (>= 1.3)
  reps: number; // acertos consecutivos
  lapses: number;
  lastGrade?: Grade;
  lastReviewed?: string;
}

export interface FlashcardReview {
  cardId: string;
  grade: Grade;
  at: string;
}

export interface Doubt {
  id: string;
  targetId: string; // módulo ou lição
  text: string;
  resolved: boolean;
  answer: string;
  createdAt: string;
}

export interface ProjectVersion {
  id: string;
  label: string;
  note: string;
  at: string;
}

export interface ProjectWork {
  checklist: Record<string, boolean>;
  githubUrl: string;
  demoUrl: string;
  notes: string;
  reflection: string;
  versions: ProjectVersion[];
  status: 'nao-iniciado' | 'em-andamento' | 'autodeclarado';
  updatedAt: string;
}

export interface CheckpointWork {
  items: Record<string, boolean>;
  selfAssessedAt?: string;
}

export interface ExamAnswer {
  questionId: string;
  chosen: number | null;
  correct: boolean;
}

export interface ExamAttempt {
  id: string;
  mode: 'completo' | 'treino';
  startedAt: string;
  finishedAt: string;
  durationSec: number;
  usedSec: number;
  reason: 'finalizado' | 'tempo-esgotado' | 'antecipado';
  answers: ExamAnswer[];
  correct: number;
  total: number;
}

/** Simulado em andamento. O prazo é sempre recalculado a partir de startedAtMs. */
export interface ActiveExam {
  id: string;
  mode: 'completo' | 'treino';
  questionIds: string[];
  answers: Record<string, number>;
  flags: string[];
  current: number;
  startedAtMs: number;
  durationSec: number;
}

/** Projeto "Glossário vivo" (Mundo 1): explicações próprias e diário de alucinações. */
export interface GlossaryConcept {
  explanation: string;
  example: string;
  updatedAt: string;
}
export interface HallucinationEntry {
  id: string;
  tool: string;
  claim: string;
  howFound: string;
  correct: string;
  source: string;
  at: string;
}
export interface LivingGlossary {
  concepts: Record<string, GlossaryConcept>;
  diary: HallucinationEntry[];
}

export interface ContentReport {
  id: string;
  targetId: string;
  text: string;
  at: string;
}

export interface UserData {
  schemaVersion: typeof SCHEMA_VERSION;
  createdAt: string;
  updatedAt: string;
  preferences: Preferences;
  answers: AnswerRecord[];
  checkAttempts: CheckAttempt[];
  activityAttempts: ActivityAttempt[];
  externalLogs: Record<string, ExternalLog>;
  demosViewed: Record<string, string>;
  challenges: Record<string, ChallengeWork>;
  flashcards: Record<string, SrsState>;
  flashcardLog: FlashcardReview[];
  lessonsOpened: Record<string, string>;
  /** Segundos de estudo ATIVO por dia e por módulo: { "2026-11-18": { "1.1": 600 } } */
  studyTime: Record<string, Record<string, number>>;
  /** Estudo autodeclarado em módulos ainda sem conteúdo estruturado. */
  selfReportedStudy: Record<string, string>;
  doubts: Doubt[];
  notes: Record<string, string>;
  projects: Record<string, ProjectWork>;
  checkpoints: Record<string, CheckpointWork>;
  exams: ExamAttempt[];
  activeExam: ActiveExam | null;
  reports: ContentReport[];
  livingGlossary: LivingGlossary;
}
