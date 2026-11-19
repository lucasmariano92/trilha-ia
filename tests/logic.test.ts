import { describe, expect, it } from 'vitest';
import { schedule, newCard, isDue, isConsolidated } from '../src/services/srs';
import { addDays, diffDays, formatDuration, localDate } from '../src/services/dates';
import { objectiveStats, evaluateModule, level1Done, level2Done, level3Done, moduleLevelFraction } from '../src/services/mastery';
import { chooseDayType, forecast, sessionPlan, remainingMinutes, streak } from '../src/services/plan';
import { accrueSeconds, IDLE_LIMIT_MS } from '../src/services/activeTime';
import { recommendations } from '../src/services/recommendations';
import { checkpointQuizBest, checkpointQuizId, checkpointQuizPool, evaluateCheckpoint, isWorldUnlocked, missingPrerequisites, progressSummary, nextStep } from '../src/services/progress';
import { getModule, getQuestion, worlds, modules } from '../src/content';
import { recordActivity, recordCheck, saveChallenge, saveExternalLog, saveProject, setCheckpointItem, toggleSelfReported, addStudySeconds, reviewFlashcard, challengeSubmissionProblems, emptyChallenge } from '../src/services/actions';
import { answer, fresh } from './helpers';

const m11 = getModule('1.1')!;

describe('datas locais', () => {
  it('usa a data local, não UTC', () => {
    // 23h30 no horário local deve continuar sendo o mesmo dia
    const d = new Date(2026, 10, 18, 23, 30);
    expect(localDate(d)).toBe('2026-11-18');
  });
  it('soma e diferença de dias atravessando meses', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(diffDays('2026-11-18', '2026-12-01')).toBe(13);
    expect(formatDuration(110 * 60)).toBe('01:50:00');
  });
});

describe('revisão espaçada (SM-2 de quatro botões)', () => {
  const T = '2026-11-18';
  it('sequência Bom: 1, 3 e depois intervalo × facilidade', () => {
    let s = schedule(undefined, 'bom', T);
    expect(s.interval).toBe(1);
    s = schedule(s, 'bom', s.due);
    expect(s.interval).toBe(3);
    s = schedule(s, 'bom', s.due);
    expect(s.interval).toBe(Math.round(3 * 2.5));
  });
  it('Errei reinicia, conta lapso e reduz facilidade sem passar do mínimo', () => {
    let s = schedule(schedule(schedule(undefined, 'bom', T), 'bom', T), 'errei', T);
    expect(s.reps).toBe(0);
    expect(s.interval).toBe(1);
    expect(s.lapses).toBe(1);
    for (let i = 0; i < 20; i++) s = schedule(s, 'errei', T);
    expect(s.ease).toBeGreaterThanOrEqual(1.3);
  });
  it('Fácil > Bom > Difícil no intervalo', () => {
    const base = schedule(schedule(undefined, 'bom', T), 'bom', T);
    const f = schedule(base, 'facil', T).interval;
    const b = schedule(base, 'bom', T).interval;
    const d = schedule(base, 'dificil', T).interval;
    expect(f).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(d);
  });
  it('vencimento e consolidação', () => {
    expect(isDue(newCard(T), T)).toBe(true);
    const s = schedule(undefined, 'bom', T);
    expect(isDue(s, T)).toBe(false);
    expect(isDue(s, addDays(T, 1))).toBe(true);
    expect(isConsolidated(s)).toBe(false);
    expect(isConsolidated({ ...s, interval: 21, lastGrade: 'bom' })).toBe(true);
    expect(isConsolidated({ ...s, interval: 30, lastGrade: 'errei' })).toBe(false);
  });
  it('reviewFlashcard registra histórico', () => {
    const d = reviewFlashcard(fresh(), 'f1.1-01', 'bom', T);
    expect(d.flashcards['f1.1-01'].interval).toBe(1);
    expect(d.flashcardLog).toHaveLength(1);
  });
});

describe('domínio por objetivo', () => {
  it('menos de 3 respostas independentes = dados insuficientes, mesmo com 100%', () => {
    const s = objectiveStats('1.1-O1', [answer('1.1-O1', true), answer('1.1-O1', true)]);
    expect(s.level).toBe('dados-insuficientes');
  });
  it('respostas assistidas não contam como evidência', () => {
    const list = Array.from({ length: 5 }, () => answer('1.1-O1', true, 'assistido'));
    const s = objectiveStats('1.1-O1', list);
    expect(s.total).toBe(5);
    expect(s.independent).toBe(0);
    expect(s.level).toBe('dados-insuficientes');
  });
  it('classifica dominado, em progresso e dificuldade pelas últimas 5', () => {
    expect(objectiveStats('o', [true, true, true, true].map((c) => answer('o', c))).level).toBe('dominado');
    expect(objectiveStats('o', [true, true, false, true, false].map((c) => answer('o', c))).level).toBe('em-progresso');
    expect(objectiveStats('o', [false, false, true, false].map((c) => answer('o', c))).level).toBe('dificuldade');
    // erros antigos não pesam quando as últimas 5 estão certas
    expect(objectiveStats('o', [false, false, false, true, true, true, true, true].map((c) => answer('o', c))).level).toBe('dominado');
  });
  it('conta erros com confiança alta', () => {
    expect(objectiveStats('o', [answer('o', false, 'treino', { confidence: 3 })]).confidentErrors).toBe(1);
  });
});

function passTheory(d0: ReturnType<typeof fresh>, moduleId: string) {
  let d = d0;
  for (const l of getModule(moduleId)!.lessons) {
    const qs = l.checkQuestionIds.map((id) => getQuestion(id)!);
    d = recordCheck(d, l.id, 'assistido', qs.map((q) => ({ question: q, chosen: q.correct })));
  }
  return d;
}

function passAllLevels() {
  let d = fresh();
  for (const l of m11.lessons) {
    const qs = l.checkQuestionIds.map((id) => getQuestion(id)!);
    d = recordCheck(d, l.id, 'assistido', qs.map((q) => ({ question: q, chosen: q.correct })));
  }
  for (const a of m11.activities) {
    if (a.kind === 'classify' || a.kind === 'judge' || a.kind === 'order') d = recordActivity(d, { activityId: a.id, moduleId: '1.1', score: 10, max: 10, passThreshold: a.passThreshold, hintsUsed: 0, wrongItemIds: [] });
    if (a.kind === 'external') d = saveExternalLog(d, a.id, { x: 'y' });
  }
  d = saveChallenge(d, 'c1.1', { status: 'autodeclarado' });
  return d;
}

describe('níveis e estados do módulo', () => {
  it('começa como não iniciado; abrir lição → em estudo', () => {
    expect(evaluateModule(m11, fresh()).status).toBe('nao-iniciado');
    const d = { ...fresh(), lessonsOpened: { '1.1.1': '2026-11-18' } };
    expect(evaluateModule(m11, d).status).toBe('em-estudo');
  });
  it('Nível 1 exige ≥ 80% em TODAS as lições', () => {
    let d = fresh();
    const l = m11.lessons[0];
    const qs = l.checkQuestionIds.map((id) => getQuestion(id)!);
    // 3/5 = 60% não conclui
    d = recordCheck(d, l.id, 'independente', qs.map((q, i) => ({ question: q, chosen: i < 3 ? q.correct : (q.correct + 1) % 4 })));
    expect(level1Done(m11, d)).toBe(false);
    expect(d.checkAttempts[0].correct).toBe(3);
    // 4/5 = 80% conclui a lição, mas não o nível
    d = recordCheck(d, l.id, 'independente', qs.map((q, i) => ({ question: q, chosen: i < 4 ? q.correct : (q.correct + 1) % 4 })));
    expect(level1Done(m11, d)).toBe(false);
    expect(evaluateModule(m11, passAllLevels()).l1).toBe(true);
  });
  it('Nível 2 não conclui com atividade reprovada', () => {
    const a = m11.activities.find((x) => x.kind === 'classify')!;
    const d = recordActivity(fresh(), { activityId: a.id, moduleId: '1.1', score: 5, max: 10, passThreshold: 0.8, hintsUsed: 0, wrongItemIds: [] });
    expect(d.activityAttempts[0].passed).toBe(false);
    expect(level2Done(m11, d)).toBe(false);
  });
  it('três níveis → aplicação entregue; domínio exige evidência independente por objetivo', () => {
    let d = passAllLevels();
    expect(level3Done(m11, d)).toBe(true);
    expect(evaluateModule(m11, d).status).toBe('aplicacao-entregue');
    expect(moduleLevelFraction(m11, d)).toBe(1);
    for (const o of m11.objectives) d = { ...d, answers: [...d.answers, answer(o.id, true), answer(o.id, true), answer(o.id, true)] };
    expect(evaluateModule(m11, d).status).toBe('dominio-demonstrado');
  });
  it('revisão necessária quando há dificuldade comprovada', () => {
    let d = passAllLevels();
    d = { ...d, answers: [...d.answers, ...[false, false, false].map((c) => answer('1.1-O2', c))] };
    const ev = evaluateModule(m11, d);
    expect(ev.status).toBe('revisao-necessaria');
    expect(ev.reviewReasons.length).toBeGreaterThan(0);
  });
  it('revisão necessária por flashcards muito atrasados', () => {
    let d = passAllLevels();
    const old = { due: '2026-10-01', interval: 3, ease: 2.5, reps: 2, lapses: 0 };
    d = { ...d, flashcards: { 'f1.1-01': old, 'f1.1-02': old, 'f1.1-03': old } };
    expect(evaluateModule(m11, d, '2026-11-18').status).toBe('revisao-necessaria');
  });
  it('requisitos para registrar o desafio', () => {
    const c = m11.challenge!;
    const problems = challengeSubmissionProblems(emptyChallenge(), c.deliveryChecklist.map((x) => x.id), c.rubric.map((r) => r.id));
    expect(problems.length).toBe(5);
  });
});

describe('progresso, pré-requisitos e checkpoints', () => {
  it('progresso verificado ignora autodeclarações', () => {
    let d = toggleSelfReported(fresh(), '2.1');
    const s = progressSummary(d);
    expect(s.verified).toBe(0);
    expect(s.selfReported).toBe(1);
    expect(s.structuredModules).toBe(9);
    d = passAllLevels();
    expect(progressSummary(d).verified).toBeCloseTo(1 / 9, 5);
  });
  it('pré-requisito do 1.2 é a teoria do 1.1', () => {
    expect(missingPrerequisites('1.2', fresh())).toEqual(['1.1']);
    expect(missingPrerequisites('1.2', passAllLevels())).toEqual([]);
    expect(missingPrerequisites('1.1', fresh())).toEqual([]);
  });
  it('Mundo 2 só libera após checkpoint completo do Mundo 1 (itens, módulos, projeto e avaliação prática)', () => {
    const w1 = worlds[0];
    let d = passAllLevels();
    expect(isWorldUnlocked(1, d)).toBe(true);
    expect(isWorldUnlocked(2, d)).toBe(false);
    // estudo autodeclarado não basta para módulos estruturados
    for (const m of modules.filter((x) => x.worldId === 1 && x.id !== '1.1')) d = toggleSelfReported(d, m.id);
    for (const i of w1.checkpoint.items) d = setCheckpointItem(d, 1, i.id, true);
    d = saveProject(d, 'p1', { status: 'autodeclarado' });
    let ev = evaluateCheckpoint(w1, d);
    expect(ev.passed).toBe(false);
    expect(ev.modulesReady).toBe(1);
    // teoria concluída nos 9 módulos
    for (const m of modules.filter((x) => x.worldId === 1)) d = passTheory(d, m.id);
    ev = evaluateCheckpoint(w1, d);
    expect(ev.modulesReady).toBe(9);
    expect(ev.quizAvailable).toBe(true);
    expect(ev.passed).toBe(false);
    expect(ev.missing.join()).toMatch(/avaliação prática/);
    // avaliação prática abaixo do mínimo não libera
    const pool = checkpointQuizPool(1).slice(0, 10);
    d = recordCheck(d, checkpointQuizId(1), 'independente', pool.map((q, i) => ({ question: q, chosen: i < 7 ? q.correct : (q.correct + 1) % 4 })));
    expect(evaluateCheckpoint(w1, d).passed).toBe(false);
    d = recordCheck(d, checkpointQuizId(1), 'independente', pool.map((q) => ({ question: q, chosen: q.correct })));
    expect(evaluateCheckpoint(w1, d).passed).toBe(true);
    expect(isWorldUnlocked(2, d)).toBe(true);
  });
  it('avaliação assistida não conta para o checkpoint', () => {
    const pool = checkpointQuizPool(1).slice(0, 10);
    const d = recordCheck(fresh(), checkpointQuizId(1), 'assistido', pool.map((q) => ({ question: q, chosen: q.correct })));
    expect(checkpointQuizBest(1, d)).toBeNull();
  });
  it('próximo passo começa pela lição 1.1.1 e avança para 1.2.1', () => {
    expect(nextStep(fresh())).toEqual({ moduleId: '1.1', target: 'entender', lessonId: '1.1.1' });
    expect(nextStep(passAllLevels())).toEqual({ moduleId: '1.2', target: 'entender', lessonId: '1.2.1' });
  });
});

describe('plano de estudos e previsão', () => {
  it('padrão de 60 min: 25/20/10/5', () => {
    const p = sessionPlan(60, 'padrao');
    expect([p.teoria, p.pratica, p.questoes, p.revisao]).toEqual([25, 20, 10, 5]);
  });
  it('a soma sempre fecha a duração da sessão', () => {
    for (const min of [30, 45, 75, 90, 120]) for (const t of ['padrao', 'introducao', 'programacao', 'revisao', 'projeto'] as const) {
      const p = sessionPlan(min, t);
      expect(p.teoria + p.pratica + p.questoes + p.revisao).toBe(min);
    }
  });
  it('adapta o tipo de dia', () => {
    expect(chooseDayType({ dueCards: 20, nextTarget: 'entender', isProgramming: false, weakObjectives: 0 })).toBe('revisao');
    expect(chooseDayType({ dueCards: 0, nextTarget: 'entender', isProgramming: false, weakObjectives: 0 })).toBe('introducao');
    expect(chooseDayType({ dueCards: 0, nextTarget: 'praticar', isProgramming: true, weakObjectives: 0 })).toBe('programacao');
    expect(chooseDayType({ dueCards: 0, nextTarget: 'aplicar', isProgramming: false, weakObjectives: 0 })).toBe('projeto');
    expect(chooseDayType({ dueCards: 0, nextTarget: 'praticar', isProgramming: false, weakObjectives: 2 })).toBe('revisao');
  });
  it('mais dias por semana encurtam a previsão', () => {
    expect(forecast(6000, 7, 60, '2026-11-18').days).toBeLessThan(forecast(6000, 3, 60, '2026-11-18').days);
    expect(forecast(600, 5, 60, '2026-11-18').sessions).toBe(10);
  });
  it('carga restante diminui com níveis concluídos e inclui revisões', () => {
    const a = remainingMinutes(fresh());
    const b = remainingMinutes(passAllLevels());
    expect(b.content).toBeLessThan(a.content);
    expect(a.reviews).toBe(Math.round((a.content + a.projects) * 0.1));
  });
  it('sequência de dias usa tempo ativo (≥ 5 min)', () => {
    let d = addStudySeconds(fresh(), '1.1', 400, '2026-11-17');
    d = addStudySeconds(d, '1.1', 400, '2026-11-18');
    d = addStudySeconds(d, '1.1', 100, '2026-11-16');
    expect(streak(d, '2026-11-18')).toBe(2);
  });
});

describe('tempo ativo', () => {
  it('não conta com aba oculta', () => {
    expect(accrueSeconds(0, 15000, 14000, false)).toBe(0);
  });
  it('conta o intervalo com interação recente', () => {
    expect(accrueSeconds(0, 15000, 10000, true)).toBe(15);
  });
  it('para de contar após o limite de inatividade', () => {
    const last = 0;
    expect(accrueSeconds(IDLE_LIMIT_MS + 60000, IDLE_LIMIT_MS + 75000, last, true)).toBe(0);
    expect(accrueSeconds(80000, 95000, 0, true)).toBe(10); // só até 90 s
  });
  it('não credita suspensão longa do computador', () => {
    expect(accrueSeconds(0, 3600000, 3600000, true)).toBe(30);
  });
});

describe('recomendações de reforço', () => {
  it('não recomenda com dados insuficientes', () => {
    const d = { ...fresh(), answers: [answer('1.1-O1', false), answer('1.1-O1', false)] };
    expect(recommendations(d).filter((r) => r.kind === 'revisar-licao')).toHaveLength(0);
  });
  it('recomenda a lição do objetivo com dificuldade comprovada', () => {
    const d = { ...fresh(), answers: [false, false, false].map((c) => answer('1.1-O3', c)) };
    const r = recommendations(d).find((x) => x.kind === 'revisar-licao');
    expect(r?.route).toBe('/aula/1.1.3');
  });
  it('sinaliza concepção equivocada e itens errados repetidamente', () => {
    let d = { ...fresh(), answers: [answer('1.1-O4', false, 'treino', { confidence: 3 }), answer('1.1-O4', false, 'treino', { confidence: 3 })] };
    for (let i = 0; i < 2; i++) d = recordActivity(d, { activityId: 'a1.1-classify', moduleId: '1.1', score: 5, max: 10, passThreshold: 0.8, hintsUsed: 0, wrongItemIds: ['i5'] });
    const kinds = recommendations(d).map((r) => r.kind);
    expect(kinds).toContain('concepcao-equivocada');
    expect(kinds).toContain('refazer-atividade');
  });
});
