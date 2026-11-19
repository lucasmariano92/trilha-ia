import type { Question } from '../types/curriculum';
import type { ActiveExam, AnswerMode, ChallengeWork, Doubt, Grade, ProjectWork, UserData } from '../types/progress';
import { localDate, newId } from './dates';
import { schedule } from './srs';
import { gradeExam } from './exam';
import { clampText, LIMITS } from './validate';

/** Ações puras: recebem os dados atuais e devolvem uma NOVA versão (nunca mutam). */

const touch = (d: UserData): UserData => ({ ...d, updatedAt: new Date().toISOString() });
const capped = <T>(list: T[], max: number) => (list.length > max ? list.slice(list.length - max) : list);

export function recordAnswers(
  d: UserData,
  items: { question: Question; chosen: number | null; confidence?: 1 | 2 | 3 }[],
  mode: AnswerMode,
  at: string = new Date().toISOString(),
  sessionId: string = newId(),
): UserData {
  const recs = items.map(({ question, chosen, confidence }) => ({
    questionId: question.id, objectiveIds: question.objectiveIds, chosen, correct: chosen === question.correct, mode, at, confidence, sessionId,
  }));
  return touch({ ...d, answers: capped([...d.answers, ...recs], LIMITS.answers) });
}

/** Verificação de compreensão de uma lição (Nível 1). Registra tentativa e respostas individuais. */
export function recordCheck(
  d: UserData,
  lessonId: string,
  mode: 'assistido' | 'independente',
  items: { question: Question; chosen: number | null; confidence?: 1 | 2 | 3 }[],
  at: string = new Date().toISOString(),
): UserData {
  const correct = items.filter((i) => i.chosen === i.question.correct).length;
  const withAnswers = recordAnswers(d, items, mode, at);
  return { ...withAnswers, checkAttempts: [...withAnswers.checkAttempts, { id: newId(), lessonId, mode, correct, total: items.length, at }] };
}

export function recordActivity(
  d: UserData,
  a: { activityId: string; moduleId: string; score: number; max: number; passThreshold: number; hintsUsed: number; wrongItemIds: string[] },
  at: string = new Date().toISOString(),
): UserData {
  const passed = a.max > 0 && a.score / a.max >= a.passThreshold;
  return touch({
    ...d,
    activityAttempts: capped(
      [...d.activityAttempts, { id: newId(), activityId: a.activityId, moduleId: a.moduleId, score: a.score, max: a.max, passed, hintsUsed: a.hintsUsed, wrongItemIds: a.wrongItemIds, at }],
      10_000,
    ),
  });
}

export function saveExternalLog(d: UserData, activityId: string, fields: Record<string, string>): UserData {
  const clean = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, clampText(v, LIMITS.mediumText)]));
  return touch({ ...d, externalLogs: { ...d.externalLogs, [activityId]: { activityId, fields: clean, savedAt: new Date().toISOString(), selfReported: true } } });
}

export const removeExternalLog = (d: UserData, activityId: string): UserData => {
  const { [activityId]: _removed, ...rest } = d.externalLogs;
  return touch({ ...d, externalLogs: rest });
};

export const markDemoViewed = (d: UserData, activityId: string): UserData =>
  d.demosViewed[activityId] ? d : touch({ ...d, demosViewed: { ...d.demosViewed, [activityId]: new Date().toISOString() } });

export function emptyChallenge(): ChallengeWork {
  return { decisions: '', evidence: '', difficulties: '', improvements: '', checklist: {}, rubric: {}, status: 'rascunho', updatedAt: new Date().toISOString() };
}

export function saveChallenge(d: UserData, challengeId: string, patch: Partial<ChallengeWork>): UserData {
  const prev = d.challenges[challengeId] ?? emptyChallenge();
  const next: ChallengeWork = {
    ...prev, ...patch,
    decisions: clampText(patch.decisions ?? prev.decisions, LIMITS.longText),
    evidence: clampText(patch.evidence ?? prev.evidence, LIMITS.longText),
    difficulties: clampText(patch.difficulties ?? prev.difficulties, LIMITS.longText),
    improvements: clampText(patch.improvements ?? prev.improvements, LIMITS.longText),
    updatedAt: new Date().toISOString(),
  };
  return touch({ ...d, challenges: { ...d.challenges, [challengeId]: next } });
}

/** Requisitos mínimos para registrar a entrega do desafio como "autodeclarada". */
export const CHALLENGE_MIN = { evidence: 200, decisions: 80, difficulties: 40 };

export function challengeSubmissionProblems(work: ChallengeWork, checklistIds: string[], rubricIds: string[]): string[] {
  const p: string[] = [];
  if (work.evidence.trim().length < CHALLENGE_MIN.evidence) p.push(`A evidência precisa de pelo menos ${CHALLENGE_MIN.evidence} caracteres (cole o guia ou um resumo dele).`);
  if (work.decisions.trim().length < CHALLENGE_MIN.decisions) p.push(`Registre suas decisões em pelo menos ${CHALLENGE_MIN.decisions} caracteres.`);
  if (work.difficulties.trim().length < CHALLENGE_MIN.difficulties) p.push(`Descreva as dificuldades em pelo menos ${CHALLENGE_MIN.difficulties} caracteres.`);
  const unchecked = checklistIds.filter((id) => !work.checklist[id]).length;
  if (unchecked) p.push(`${unchecked} item(ns) do checklist de entrega ainda não marcados.`);
  const unrated = rubricIds.filter((id) => !work.rubric[id]).length;
  if (unrated) p.push(`${unrated} critério(s) da rubrica sem autoavaliação.`);
  return p;
}

export function reviewFlashcard(d: UserData, cardId: string, grade: Grade, today: string = localDate()): UserData {
  return touch({
    ...d,
    flashcards: { ...d.flashcards, [cardId]: schedule(d.flashcards[cardId], grade, today) },
    flashcardLog: capped([...d.flashcardLog, { cardId, grade, at: new Date().toISOString() }], LIMITS.answers),
  });
}

export function addStudySeconds(d: UserData, key: string, seconds: number, day: string = localDate()): UserData {
  if (seconds <= 0) return d;
  const today = d.studyTime[day] ?? {};
  return { ...d, studyTime: { ...d.studyTime, [day]: { ...today, [key]: (today[key] ?? 0) + seconds } } };
}

export const markLessonOpened = (d: UserData, lessonId: string): UserData =>
  d.lessonsOpened[lessonId] ? d : touch({ ...d, lessonsOpened: { ...d.lessonsOpened, [lessonId]: new Date().toISOString() } });

export function toggleSelfReported(d: UserData, moduleId: string): UserData {
  const next = { ...d.selfReportedStudy };
  if (next[moduleId]) delete next[moduleId];
  else next[moduleId] = localDate();
  return touch({ ...d, selfReportedStudy: next });
}

export function addDoubt(d: UserData, targetId: string, text: string): UserData {
  const doubt: Doubt = { id: newId(), targetId, text: clampText(text.trim(), LIMITS.mediumText), resolved: false, answer: '', createdAt: new Date().toISOString() };
  return touch({ ...d, doubts: capped([...d.doubts, doubt], LIMITS.doubts) });
}

export const updateDoubt = (d: UserData, id: string, patch: Partial<Pick<Doubt, 'text' | 'answer' | 'resolved'>>): UserData =>
  touch({
    ...d,
    doubts: d.doubts.map((x) =>
      x.id === id
        ? { ...x, ...patch, text: clampText(patch.text ?? x.text, LIMITS.mediumText), answer: clampText(patch.answer ?? x.answer, LIMITS.mediumText) }
        : x,
    ),
  });

export const removeDoubt = (d: UserData, id: string): UserData => touch({ ...d, doubts: d.doubts.filter((x) => x.id !== id) });

export const saveNote = (d: UserData, id: string, text: string): UserData => touch({ ...d, notes: { ...d.notes, [id]: clampText(text, LIMITS.longText) } });

export function emptyProject(): ProjectWork {
  return { checklist: {}, githubUrl: '', demoUrl: '', notes: '', reflection: '', versions: [], status: 'nao-iniciado', updatedAt: new Date().toISOString() };
}

export function saveProject(d: UserData, projectId: string, patch: Partial<ProjectWork>): UserData {
  const prev = d.projects[projectId] ?? emptyProject();
  const next: ProjectWork = {
    ...prev, ...patch,
    githubUrl: clampText((patch.githubUrl ?? prev.githubUrl).trim(), LIMITS.shortText),
    demoUrl: clampText((patch.demoUrl ?? prev.demoUrl).trim(), LIMITS.shortText),
    notes: clampText(patch.notes ?? prev.notes, LIMITS.longText),
    reflection: clampText(patch.reflection ?? prev.reflection, LIMITS.longText),
    updatedAt: new Date().toISOString(),
  };
  if (next.status === 'nao-iniciado' && (next.notes || next.githubUrl || Object.values(next.checklist).some(Boolean))) next.status = 'em-andamento';
  return touch({ ...d, projects: { ...d.projects, [projectId]: next } });
}

export function addProjectVersion(d: UserData, projectId: string, label: string, note: string): UserData {
  const prev = d.projects[projectId] ?? emptyProject();
  const versions = capped([...prev.versions, { id: newId(), label: clampText(label, LIMITS.shortText), note: clampText(note, LIMITS.mediumText), at: new Date().toISOString() }], LIMITS.versions);
  return saveProject(d, projectId, { versions });
}

export function setCheckpointItem(d: UserData, worldId: number, itemId: string, value: boolean): UserData {
  const prev = d.checkpoints[String(worldId)] ?? { items: {} };
  return touch({ ...d, checkpoints: { ...d.checkpoints, [String(worldId)]: { items: { ...prev.items, [itemId]: value }, selfAssessedAt: new Date().toISOString() } } });
}

export function addReport(d: UserData, targetId: string, text: string): UserData {
  return touch({ ...d, reports: capped([...d.reports, { id: newId(), targetId, text: clampText(text.trim(), LIMITS.mediumText), at: new Date().toISOString() }], LIMITS.reports) });
}

/* ---------- simulados ---------- */

export const startExam = (d: UserData, exam: ActiveExam): UserData => touch({ ...d, activeExam: exam });

export function updateActiveExam(d: UserData, patch: Partial<Pick<ActiveExam, 'answers' | 'flags' | 'current'>>): UserData {
  if (!d.activeExam) return d;
  return touch({ ...d, activeExam: { ...d.activeExam, ...patch } });
}

export function finishExam(
  d: UserData,
  lookup: (id: string) => Question | undefined,
  nowMs: number,
  reason: 'finalizado' | 'tempo-esgotado' | 'antecipado',
): UserData {
  if (!d.activeExam) return d;
  const attempt = gradeExam(d.activeExam, lookup, nowMs, reason);
  const items = d.activeExam.questionIds
    .map((id) => lookup(id))
    .filter((q): q is Question => !!q)
    .map((q) => ({ question: q, chosen: d.activeExam!.answers[q.id] ?? null }));
  const withAnswers = recordAnswers(d, items, 'simulado', new Date(nowMs).toISOString(), attempt.id);
  return touch({ ...withAnswers, activeExam: null, exams: [...withAnswers.exams, attempt] });
}

export const abandonExam = (d: UserData): UserData => touch({ ...d, activeExam: null });

/* ---------- exclusão por categoria (LGPD: direito de exclusão) ---------- */

export type DataCategory = 'respostas' | 'flashcards' | 'anotacoes' | 'projetos' | 'tempo' | 'relatos';

export function clearCategory(d: UserData, cat: DataCategory): UserData {
  switch (cat) {
    case 'respostas':
      return touch({ ...d, answers: [], checkAttempts: [], activityAttempts: [], exams: [], activeExam: null, externalLogs: {}, demosViewed: {} });
    case 'flashcards':
      return touch({ ...d, flashcards: {}, flashcardLog: [] });
    case 'anotacoes':
      return touch({ ...d, doubts: [], notes: {} });
    case 'projetos':
      return touch({ ...d, projects: {}, challenges: {}, checkpoints: {}, livingGlossary: { concepts: {}, diary: [] } });
    case 'tempo':
      return touch({ ...d, studyTime: {}, lessonsOpened: {} });
    case 'relatos':
      return touch({ ...d, reports: [] });
  }
}

/* ---------- Glossário vivo (projeto do Mundo 1) ---------- */

export function saveConcept(d: UserData, moduleId: string, patch: { explanation?: string; example?: string }): UserData {
  const prev = d.livingGlossary.concepts[moduleId] ?? { explanation: '', example: '', updatedAt: '' };
  const next = {
    explanation: clampText(patch.explanation ?? prev.explanation, LIMITS.mediumText),
    example: clampText(patch.example ?? prev.example, LIMITS.mediumText),
    updatedAt: new Date().toISOString(),
  };
  return touch({ ...d, livingGlossary: { ...d.livingGlossary, concepts: { ...d.livingGlossary.concepts, [moduleId]: next } } });
}

export function addDiaryEntry(d: UserData, e: { tool: string; claim: string; howFound: string; correct: string; source: string }): UserData {
  const entry = {
    id: newId(), at: new Date().toISOString(),
    tool: clampText(e.tool, LIMITS.shortText), claim: clampText(e.claim, LIMITS.mediumText), howFound: clampText(e.howFound, LIMITS.mediumText),
    correct: clampText(e.correct, LIMITS.mediumText), source: clampText(e.source, LIMITS.mediumText),
  };
  return touch({ ...d, livingGlossary: { ...d.livingGlossary, diary: capped([...d.livingGlossary.diary, entry], 200) } });
}

export const removeDiaryEntry = (d: UserData, id: string): UserData =>
  touch({ ...d, livingGlossary: { ...d.livingGlossary, diary: d.livingGlossary.diary.filter((x) => x.id !== id) } });
