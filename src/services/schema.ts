import type {
  ActiveExam, ActivityAttempt, AnswerRecord, ChallengeWork, CheckAttempt, CheckpointWork, ContentReport, Doubt,
  ExamAttempt, ExternalLog, FlashcardReview, GlossaryConcept, Grade, HallucinationEntry, LivingGlossary, Preferences, ProjectWork, SrsState, UserData,
} from '../types/progress';
import { SCHEMA_VERSION } from '../types/progress';
import { LIMITS } from './validate';

/**
 * Validação e saneamento dos dados pessoais (backup importado ou conteúdo do localStorage).
 * Estratégia: estrutura raiz ESTRITA (rejeita); itens individuais TOLERANTES (descarta o item inválido
 * e registra um aviso). Chaves perigosas (__proto__, constructor, prototype) rejeitam o arquivo inteiro.
 */

export class SchemaError extends Error {}

const DANGEROUS = new Set(['__proto__', 'constructor', 'prototype']);

export function assertNoDangerousKeys(value: unknown, depth = 0): void {
  if (depth > 40) throw new SchemaError('Estrutura aninhada demais.');
  if (Array.isArray(value)) {
    for (const v of value) assertNoDangerousKeys(v, depth + 1);
  } else if (value && typeof value === 'object') {
    for (const k of Object.keys(value)) {
      if (DANGEROUS.has(k)) throw new SchemaError(`Chave não permitida encontrada: "${k}".`);
      assertNoDangerousKeys((value as Record<string, unknown>)[k], depth + 1);
    }
  }
}

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const isStr = (v: unknown, max: number = LIMITS.longText): v is string => typeof v === 'string' && v.length <= max;
const isNum = (v: unknown, min = -Infinity, max = Infinity): v is number => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_TS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
const isDate = (v: unknown): v is string => typeof v === 'string' && ISO_DATE.test(v);
const isTs = (v: unknown): v is string => typeof v === 'string' && (ISO_TS.test(v) || ISO_DATE.test(v)) && v.length <= 40;
const isId = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length <= 80 && !DANGEROUS.has(v);
const GRADES: Grade[] = ['errei', 'dificil', 'bom', 'facil'];

export function emptyUserData(nowIso: string = new Date().toISOString()): UserData {
  return {
    schemaVersion: SCHEMA_VERSION, createdAt: nowIso, updatedAt: nowIso,
    preferences: { theme: 'sistema', daysPerWeek: 5, sessionMinutes: 60 },
    answers: [], checkAttempts: [], activityAttempts: [], externalLogs: {}, demosViewed: {}, challenges: {},
    flashcards: {}, flashcardLog: [], lessonsOpened: {}, studyTime: {}, selfReportedStudy: {}, doubts: [],
    notes: {}, projects: {}, checkpoints: {}, exams: [], activeExam: null, reports: [],
    livingGlossary: { concepts: {}, diary: [] },
  };
}

class Collector {
  warnings: string[] = [];
  dropped = 0;
  drop(what: string) {
    this.dropped++;
    if (this.warnings.length < 30) this.warnings.push(what);
  }
}

function arr<T>(raw: unknown, max: number, label: string, c: Collector, ok: (x: unknown) => x is T): T[] {
  if (raw === undefined) return [];
  if (!Array.isArray(raw)) throw new SchemaError(`O campo "${label}" deveria ser uma lista.`);
  const out: T[] = [];
  for (const item of raw.slice(0, max)) {
    if (ok(item)) out.push(item);
    else c.drop(`Item inválido descartado em "${label}".`);
  }
  if (raw.length > max) c.drop(`"${label}" excedeu o limite de ${max} itens; o excedente foi descartado.`);
  return out;
}

function rec<T>(raw: unknown, label: string, c: Collector, ok: (x: unknown) => x is T, maxKeys = 2000): Record<string, T> {
  if (raw === undefined) return {};
  if (!isObj(raw)) throw new SchemaError(`O campo "${label}" deveria ser um objeto.`);
  const out: Record<string, T> = Object.create(null);
  for (const [k, v] of Object.entries(raw).slice(0, maxKeys)) {
    if (isId(k) && ok(v)) out[k] = v;
    else c.drop(`Entrada inválida descartada em "${label}".`);
  }
  return { ...out };
}

const okAnswer = (x: unknown): x is AnswerRecord =>
  isObj(x) && isId(x.questionId) && Array.isArray(x.objectiveIds) && x.objectiveIds.every(isId) &&
  (x.chosen === null || isNum(x.chosen, 0, 3)) && isBool(x.correct) &&
  ['assistido', 'independente', 'treino', 'simulado'].includes(x.mode as string) && isTs(x.at) &&
  (x.confidence === undefined || [1, 2, 3].includes(x.confidence as number)) && (x.sessionId === undefined || isId(x.sessionId));

const okCheck = (x: unknown): x is CheckAttempt =>
  isObj(x) && isId(x.id) && isId(x.lessonId) && (x.mode === 'assistido' || x.mode === 'independente') &&
  isNum(x.correct, 0, 100) && isNum(x.total, 1, 100) && (x.correct as number) <= (x.total as number) && isTs(x.at);

const okActivity = (x: unknown): x is ActivityAttempt =>
  isObj(x) && isId(x.id) && isId(x.activityId) && isId(x.moduleId) && isNum(x.score, 0, 1000) && isNum(x.max, 1, 1000) &&
  isBool(x.passed) && isNum(x.hintsUsed, 0, 100) && Array.isArray(x.wrongItemIds) && x.wrongItemIds.every(isId) && isTs(x.at);

const okExternal = (x: unknown): x is ExternalLog =>
  isObj(x) && isId(x.activityId) && isObj(x.fields) && Object.entries(x.fields).every(([k, v]) => isId(k) && isStr(v, LIMITS.mediumText)) &&
  isTs(x.savedAt) && x.selfReported === true;

const okChallenge = (x: unknown): x is ChallengeWork =>
  isObj(x) && isStr(x.decisions) && isStr(x.evidence) && isStr(x.difficulties) && isStr(x.improvements) &&
  isObj(x.checklist) && Object.values(x.checklist).every(isBool) && isObj(x.rubric) && Object.values(x.rubric).every((v) => isNum(v, 1, 4)) &&
  (x.status === 'rascunho' || x.status === 'autodeclarado') && (x.submittedAt === undefined || isTs(x.submittedAt)) && isTs(x.updatedAt);

const okSrs = (x: unknown): x is SrsState =>
  isObj(x) && isDate(x.due) && isNum(x.interval, 0, 3650) && isNum(x.ease, 1.3, 10) && isNum(x.reps, 0, 10000) && isNum(x.lapses, 0, 10000) &&
  (x.lastGrade === undefined || GRADES.includes(x.lastGrade as Grade)) && (x.lastReviewed === undefined || isDate(x.lastReviewed));

const okReview = (x: unknown): x is FlashcardReview => isObj(x) && isId(x.cardId) && GRADES.includes(x.grade as Grade) && isTs(x.at);

const okDoubt = (x: unknown): x is Doubt =>
  isObj(x) && isId(x.id) && isId(x.targetId) && isStr(x.text, LIMITS.mediumText) && isBool(x.resolved) && isStr(x.answer, LIMITS.mediumText) && isTs(x.createdAt);

const okProject = (x: unknown): x is ProjectWork =>
  isObj(x) && isObj(x.checklist) && Object.values(x.checklist).every(isBool) && isStr(x.githubUrl, LIMITS.shortText) && isStr(x.demoUrl, LIMITS.shortText) &&
  isStr(x.notes) && isStr(x.reflection) && Array.isArray(x.versions) && x.versions.length <= LIMITS.versions &&
  x.versions.every((v) => isObj(v) && isId(v.id) && isStr(v.label, LIMITS.shortText) && isStr(v.note, LIMITS.mediumText) && isTs(v.at)) &&
  ['nao-iniciado', 'em-andamento', 'autodeclarado'].includes(x.status as string) && isTs(x.updatedAt);

const okCheckpoint = (x: unknown): x is CheckpointWork =>
  isObj(x) && isObj(x.items) && Object.values(x.items).every(isBool) && (x.selfAssessedAt === undefined || isTs(x.selfAssessedAt));

const okExam = (x: unknown): x is ExamAttempt =>
  isObj(x) && isId(x.id) && (x.mode === 'completo' || x.mode === 'treino') && isTs(x.startedAt) && isTs(x.finishedAt) &&
  isNum(x.durationSec, 1, 86400) && isNum(x.usedSec, 0, 86400) && ['finalizado', 'tempo-esgotado', 'antecipado'].includes(x.reason as string) &&
  Array.isArray(x.answers) && x.answers.length <= 200 &&
  x.answers.every((a) => isObj(a) && isId(a.questionId) && (a.chosen === null || isNum(a.chosen, 0, 3)) && isBool(a.correct)) &&
  isNum(x.correct, 0, 200) && isNum(x.total, 0, 200);

const okActiveExam = (x: unknown): x is ActiveExam =>
  isObj(x) && isId(x.id) && (x.mode === 'completo' || x.mode === 'treino') && Array.isArray(x.questionIds) && x.questionIds.length <= 200 &&
  x.questionIds.every(isId) && new Set(x.questionIds).size === x.questionIds.length &&
  isObj(x.answers) && Object.entries(x.answers).every(([k, v]) => isId(k) && isNum(v, 0, 3)) &&
  Array.isArray(x.flags) && x.flags.every(isId) && isNum(x.current, 0, 199) && isNum(x.startedAtMs, 0) && isNum(x.durationSec, 1, 86400);

const okConcept = (x: unknown): x is GlossaryConcept => isObj(x) && isStr(x.explanation, LIMITS.mediumText) && isStr(x.example, LIMITS.mediumText) && isTs(x.updatedAt);
const okDiary = (x: unknown): x is HallucinationEntry =>
  isObj(x) && isId(x.id) && ['tool', 'claim', 'howFound', 'correct', 'source'].every((k) => isStr(x[k], LIMITS.mediumText)) && isTs(x.at);

function livingGlossary(raw: unknown, c: Collector): LivingGlossary {
  if (raw === undefined) return { concepts: {}, diary: [] };
  if (!isObj(raw)) throw new SchemaError('O campo "livingGlossary" deveria ser um objeto.');
  return { concepts: rec(raw.concepts, 'livingGlossary.concepts', c, okConcept, 50), diary: arr(raw.diary, 200, 'livingGlossary.diary', c, okDiary) };
}

const okReport = (x: unknown): x is ContentReport => isObj(x) && isId(x.id) && isId(x.targetId) && isStr(x.text, LIMITS.mediumText) && isTs(x.at);

function prefs(raw: unknown, c: Collector): Preferences {
  const d = emptyUserData().preferences;
  if (!isObj(raw)) {
    if (raw !== undefined) c.drop('Preferências inválidas; padrão restaurado.');
    return d;
  }
  return {
    theme: ['claro', 'escuro', 'sistema'].includes(raw.theme as string) ? (raw.theme as Preferences['theme']) : d.theme,
    daysPerWeek: isNum(raw.daysPerWeek, 1, 7) && Number.isInteger(raw.daysPerWeek) ? raw.daysPerWeek : d.daysPerWeek,
    sessionMinutes: isNum(raw.sessionMinutes, 20, 180) ? Math.round(raw.sessionMinutes) : d.sessionMinutes,
  };
}

export interface SanitizeResult {
  data: UserData;
  warnings: string[];
  dropped: number;
}

/** Valida um objeto que afirma ser UserData v2. */
export function sanitizeUserData(raw: unknown): SanitizeResult {
  assertNoDangerousKeys(raw);
  if (!isObj(raw)) throw new SchemaError('Os dados não são um objeto.');
  if (raw.schemaVersion !== SCHEMA_VERSION) {
    if (isNum(raw.schemaVersion) && raw.schemaVersion > SCHEMA_VERSION) {
      throw new SchemaError(`Os dados são de uma versão mais nova do aplicativo (esquema ${raw.schemaVersion}). Atualize o aplicativo antes de importar.`);
    }
    throw new SchemaError('Versão de esquema ausente ou desconhecida.');
  }
  const c = new Collector();
  const now = new Date().toISOString();
  const studyTimeRaw = rec(raw.studyTime, 'studyTime', c, (d): d is Record<string, number> => isObj(d) && Object.entries(d).every(([k, v]) => isId(k) && isNum(v, 0, 86400)), 3650);
  const studyTime: Record<string, Record<string, number>> = {};
  for (const [k, v] of Object.entries(studyTimeRaw)) {
    if (isDate(k)) studyTime[k] = { ...v };
    else c.drop('Data inválida descartada em "studyTime".');
  }
  let activeExam: ActiveExam | null = null;
  if (raw.activeExam !== null && raw.activeExam !== undefined) {
    if (okActiveExam(raw.activeExam)) activeExam = raw.activeExam;
    else c.drop('Simulado em andamento inválido foi descartado.');
  }
  const data: UserData = {
    schemaVersion: SCHEMA_VERSION,
    createdAt: isTs(raw.createdAt) ? raw.createdAt : now,
    updatedAt: isTs(raw.updatedAt) ? raw.updatedAt : now,
    preferences: prefs(raw.preferences, c),
    answers: arr(raw.answers, LIMITS.answers, 'answers', c, okAnswer),
    checkAttempts: arr(raw.checkAttempts, 10_000, 'checkAttempts', c, okCheck),
    activityAttempts: arr(raw.activityAttempts, 10_000, 'activityAttempts', c, okActivity),
    externalLogs: rec(raw.externalLogs, 'externalLogs', c, okExternal),
    demosViewed: rec(raw.demosViewed, 'demosViewed', c, isTs),
    challenges: rec(raw.challenges, 'challenges', c, okChallenge),
    flashcards: rec(raw.flashcards, 'flashcards', c, okSrs, 5000),
    flashcardLog: arr(raw.flashcardLog, LIMITS.answers, 'flashcardLog', c, okReview),
    lessonsOpened: rec(raw.lessonsOpened, 'lessonsOpened', c, isTs),
    studyTime,
    selfReportedStudy: rec(raw.selfReportedStudy, 'selfReportedStudy', c, isTs),
    doubts: arr(raw.doubts, LIMITS.doubts, 'doubts', c, okDoubt),
    notes: rec(raw.notes, 'notes', c, (v): v is string => isStr(v, LIMITS.longText)),
    projects: rec(raw.projects, 'projects', c, okProject),
    checkpoints: rec(raw.checkpoints, 'checkpoints', c, okCheckpoint),
    exams: arr(raw.exams, 1000, 'exams', c, okExam),
    activeExam,
    reports: arr(raw.reports, LIMITS.reports, 'reports', c, okReport),
    livingGlossary: livingGlossary(raw.livingGlossary, c),
  };
  return { data, warnings: c.warnings, dropped: c.dropped };
}

/* ======================================================================
 * Migração da versão 1 (chave "trilha-ia-v1")
 * ==================================================================== */

export function looksLikeV1(raw: unknown): boolean {
  return isObj(raw) && Array.isArray(raw.completed) && 'daysPerWeek' in raw && !('schemaVersion' in raw);
}

export function migrateV1(raw: unknown, nowIso: string = new Date().toISOString()): SanitizeResult {
  assertNoDangerousKeys(raw);
  if (!looksLikeV1(raw)) throw new SchemaError('Os dados não correspondem à versão 1.');
  const v1 = raw as Record<string, unknown>;
  const c = new Collector();
  const data = emptyUserData(nowIso);
  const day = nowIso.slice(0, 10);

  data.preferences.daysPerWeek = isNum(v1.daysPerWeek, 1, 7) ? Math.round(v1.daysPerWeek as number) : 5;
  data.preferences.theme = v1.dark === true ? 'escuro' : 'claro';

  for (const id of (v1.completed as unknown[]).slice(0, 100)) {
    if (isId(id) && /^\d\.\d{1,2}$/.test(id)) data.selfReportedStudy[id] = day;
  }
  if (Array.isArray(v1.doubts)) {
    for (const d of v1.doubts.slice(0, LIMITS.doubts)) {
      if (isObj(d) && isStr(d.text, LIMITS.mediumText) && isId(d.lessonId)) {
        data.doubts.push({ id: isId(d.id) ? d.id : `v1-${data.doubts.length}`, targetId: d.lessonId, text: d.text, resolved: d.resolved === true, answer: '', createdAt: isDate(d.date) ? d.date : day });
      } else c.drop('Dúvida da v1 inválida descartada.');
    }
  }
  if (isObj(v1.projects)) {
    for (const [k, p] of Object.entries(v1.projects)) {
      if (!/^[1-5]$/.test(k) || !isObj(p)) continue;
      const url = isStr(p.url, LIMITS.shortText) ? p.url : '';
      data.projects[`p${k}`] = {
        checklist: {}, githubUrl: url, demoUrl: '', notes: isStr(p.notes) ? p.notes : '', reflection: '', versions: [],
        status: url || (isStr(p.notes) && p.notes) ? 'em-andamento' : 'nao-iniciado', updatedAt: nowIso,
      };
    }
  }
  if (Array.isArray(v1.reports)) {
    for (const r of v1.reports.slice(0, LIMITS.reports)) {
      if (isObj(r) && isId(r.id) && isStr(r.detail, LIMITS.mediumText)) data.reports.push({ id: `v1-${data.reports.length}`, targetId: r.id, text: r.detail, at: isDate(r.date) ? r.date : day });
    }
  }
  const notes: string[] = [];
  if (Array.isArray(v1.completed) && v1.completed.length) notes.push(`${v1.completed.length} aula(s) marcadas como concluídas na v1 viraram "estudo autodeclarado". A v2 exige evidências (verificações e atividades) para registrar níveis.`);
  if (Array.isArray(v1.attempts) && v1.attempts.length) notes.push(`${v1.attempts.length} tentativa(s) da v1 não foram convertidas: a v1 não registrava a resposta de cada questão, só totais.`);
  if (isObj(v1.reviews) && Object.keys(v1.reviews).length) notes.push('As revisões de flashcards da v1 não foram convertidas: na v2 os cartões são outros (por objetivo de aprendizagem).');
  if (Array.isArray(v1.studyDates) && v1.studyDates.length) notes.push('Os dias de estudo da v1 não foram convertidos em tempo: a v1 não media tempo ativo.');
  if (isObj(v1.levels) && Object.keys(v1.levels).length) notes.push('Os níveis marcados manualmente na v1 não foram convertidos: na v2 eles dependem de evidências.');
  return { data, warnings: [...notes, ...c.warnings], dropped: c.dropped };
}
