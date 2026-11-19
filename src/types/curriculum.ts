/**
 * Tipos dos DADOS CURRICULARES (públicos, iguais para todos os alunos).
 * Nada aqui contém dados pessoais. Os dados do aluno ficam em ./progress.ts.
 */

/** Classificação de confiabilidade exigida pela seção 12 do prompt mestre. */
export type ContentStatus =
  | 'pdf' // Fundamentado no PDF da trilha
  | 'complementar' // Complementar com referência externa identificada
  | 'provisorio' // Provisório: rascunho, não usar para avaliar
  | 'pendente'; // Pendente de revisão humana

/** Estado de desenvolvimento editorial de um módulo. */
export type ModuleDevState =
  | 'piloto-completo' // três níveis, questões, flashcards, referências
  | 'base-pdf'; // só o texto do PDF; aprofundamento pendente

export type Bloom = 'lembrar' | 'compreender' | 'aplicar' | 'analisar' | 'avaliar' | 'criar';

export interface Objective {
  id: string; // ex.: "1.1-O1"
  moduleId: string;
  text: string; // verbo observável + critério
  bloom: Bloom;
  provisional?: boolean;
}

export interface Reference {
  id: string;
  title: string;
  organization: string;
  url: string;
  language: string;
  format: string;
  free: boolean;
  /** Data (AAAA-MM-DD) da última verificação do endereço; null = ainda não verificado. */
  lastVerified: string | null;
  /**
   * Como a verificação foi feita.
   * "busca-web": endereço e organização confirmados em resultados de busca na data indicada
   * (a página em si não foi aberta pelo ambiente de desenvolvimento).
   */
  verification: 'busca-web' | 'acesso-direto' | 'nao-verificado';
  citedInPdf: boolean;
  note?: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  english?: string;
  definition: string;
  worlds: number[];
  moduleId?: string;
  status: ContentStatus;
}

/** Blocos de conteúdo de uma lição (renderizados pelo leitor de aulas). */
export type Block =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'term'; term: string; english?: string; definition: string }
  | { type: 'analogy'; title: string; text: string }
  | { type: 'example'; kind: 'correto' | 'incorreto'; text: string; why: string }
  | { type: 'misconception'; wrong: string; right: string }
  | { type: 'callout'; tone: 'info' | 'atencao' | 'seguranca' | 'pdf'; title: string; text: string }
  | { type: 'diagram'; diagram: DiagramId; caption: string }
  | { type: 'summary'; items: string[] };

export type DiagramId = 'ai-hierarchy' | 'next-token-loop' | 'training-pipeline' | 'model-vs-app' | 'embedding-space' | 'temperature-bars';

export interface Lesson {
  id: string; // "1.1.1"
  moduleId: string;
  order: number;
  title: string;
  /** Objetivo mensurável da lição. */
  goal: string;
  objectiveIds: string[];
  prerequisites: string[];
  estimatedMinutes: number;
  status: ContentStatus;
  blocks: Block[];
  glossaryIds: string[];
  referenceIds: string[];
  /** Questões da verificação de compreensão (Nível 1). */
  checkQuestionIds: string[];
}

export type Difficulty = 'basica' | 'intermediaria' | 'avancada';
export type Cognitive = 'compreensao' | 'interpretacao' | 'aplicacao' | 'resolucao';
export type QuestionReview = 'provisoria' | 'pendente-revisao' | 'revisada';

export interface Question {
  id: string;
  worldId: number;
  moduleId: string;
  objectiveIds: string[];
  stem: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  rationale: string;
  /** Explicação de cada alternativa incorreta, pelo índice. */
  distractorRationales?: Partial<Record<0 | 1 | 2 | 3, string>>;
  difficulty: Difficulty;
  cognitive: Cognitive;
  referenceIds: string[];
  review: QuestionReview;
  contentStatus: ContentStatus;
  reviewNote?: string;
}

export interface Flashcard {
  id: string;
  moduleId?: string;
  worldId: number;
  objectiveIds: string[];
  front: string;
  back: string;
  referenceIds: string[];
  status: ContentStatus;
}

/* ---------- Nível 2: atividades práticas ---------- */

export type ActivityLevel = 'demonstracao' | 'introdutorio' | 'intermediario' | 'transferencia';

interface ActivityBase {
  id: string;
  moduleId: string;
  title: string;
  level: ActivityLevel;
  objectiveIds: string[];
  essential: boolean;
  instructions: string[];
  hints: string[];
  commonErrors: string[];
  estimatedMinutes: number;
}

export interface ClassifyActivity extends ActivityBase {
  kind: 'classify';
  categories: { id: string; label: string }[];
  items: { id: string; text: string; category: string; explanation: string }[];
  /** Fração mínima de acertos (0–1) para considerar a atividade concluída. */
  passThreshold: number;
}

export interface OrderActivity extends ActivityBase {
  kind: 'order';
  /** Passos na ORDEM CORRETA. A interface embaralha de forma determinística. */
  steps: { id: string; text: string; explanation: string }[];
  passThreshold: number;
}

export interface JudgeActivity extends ActivityBase {
  kind: 'judge';
  statements: { id: string; text: string; correct: boolean; explanation: string }[];
  passThreshold: number;
}

export type DemoWidget = 'next-token' | 'temperature' | 'embedding' | 'context-window' | 'cost';

export interface DemoActivity extends ActivityBase {
  kind: 'demo';
  widget: DemoWidget;
}

/** Problemas com resposta numérica (aceita vírgula decimal) e tolerância absoluta. */
export interface NumericActivity extends ActivityBase {
  kind: 'numeric';
  problems: { id: string; prompt: string; answer: number; tolerance: number; unit?: string; explanation: string }[];
  passThreshold: number;
}

export interface ExternalActivity extends ActivityBase {
  kind: 'external';
  fields: { id: string; label: string; placeholder: string; minLength: number }[];
}

export type Activity = ClassifyActivity | OrderActivity | JudgeActivity | NumericActivity | DemoActivity | ExternalActivity;
export type GradedActivity = ClassifyActivity | OrderActivity | JudgeActivity | NumericActivity;

/* ---------- Nível 3: desafio aplicado ---------- */

export interface RubricCriterion {
  id: string;
  criterion: string;
  levels: { score: 1 | 2 | 3 | 4; descriptor: string }[];
}

export interface Challenge {
  id: string;
  moduleId: string;
  title: string;
  problem: string;
  context: string;
  expectedResult: string;
  functionalRequirements: string[];
  constraints: string[];
  rubric: RubricCriterion[];
  steps: string[];
  supportMaterials: string[];
  supportReferenceIds: string[];
  deliveryChecklist: { id: string; text: string }[];
  improvementIdeas: string[];
  estimatedMinutes: number;
}

export interface MasteryCriteria {
  /** Mínimo em cada verificação de lição (0–1). */
  theoryThreshold: number;
  /** Respostas independentes mínimas por objetivo antes de qualquer classificação. */
  minEvidencePerObjective: number;
  /** Acerto mínimo nas últimas respostas independentes de cada objetivo (0–1). */
  objectiveThreshold: number;
  description: string[];
}

export interface Module {
  id: string;
  worldId: number;
  order: number;
  title: string;
  /** Texto do módulo como aparece no PDF (base curricular). */
  pdfText: string;
  pdfPractice?: string;
  isNewInPdf: boolean;
  devState: ModuleDevState;
  estimatedMinutes: number;
  /** Ids de módulos recomendados antes deste. */
  prerequisites: string[];
  objectives: Objective[];
  lessons: Lesson[];
  activities: Activity[];
  challenge?: Challenge;
  mastery: MasteryCriteria;
  referenceIds: string[];
  isProgramming: boolean;
}

export interface Project {
  id: string;
  worldId: number;
  title: string;
  objective: string;
  pdfDescription: string;
  prerequisites: string[];
  tools: string[];
  steps: string[];
  checklist: { id: string; text: string }[];
  criteria: string[];
  deliverables: string[];
  estimatedMinutes: number;
  status: ContentStatus;
}

export interface Checkpoint {
  worldId: number;
  intro: string;
  items: { id: string; text: string }[];
  status: ContentStatus;
}

export interface World {
  id: number;
  title: string;
  theme: string;
  goal: string;
  weeks: number;
  moduleIds: string[];
  projectId: string;
  checkpoint: Checkpoint;
  resourceIds: string[];
}
