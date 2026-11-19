import { describe, expect, it } from 'vitest';
import { REVIEWS, flashcards, getModule, getObjective, getQuestion, glossary, modules, projects, questions, references, worlds, lessons } from '../src/content';
import { placeCorrect } from '../src/content/question-utils';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();

describe('estrutura curricular (preserva o PDF)', () => {
  it('tem 5 mundos e 46 módulos na ordem do PDF', () => {
    expect(worlds).toHaveLength(5);
    expect(modules).toHaveLength(46);
    expect(worlds.map((w) => w.moduleIds.length)).toEqual([9, 8, 11, 11, 7]);
    expect(worlds.map((w) => w.weeks)).toEqual([3, 4, 5, 8, 4]);
    expect(new Set(modules.map((m) => m.id)).size).toBe(46);
    for (const w of worlds) for (const id of w.moduleIds) expect(getModule(id)?.worldId).toBe(w.id);
  });
  it('tem os 5 projetos e checkpoints do PDF', () => {
    expect(projects.map((p) => p.title)).toEqual(['Glossário vivo', 'Batalha de IAs', 'Assistente pessoal no Telegram', 'Tutor dos meus estudos', 'Tutor no ar']);
    expect(worlds.map((w) => w.checkpoint.items.length)).toEqual([5, 5, 6, 5, 4]);
  });
  it('flashcards: ids únicos e objetivos existentes', () => {
    expect(new Set(flashcards.map((f) => f.id)).size).toBe(flashcards.length);
    for (const f of flashcards) for (const o of f.objectiveIds) expect(getObjective(o), `${f.id} → ${o}`).toBeDefined();
  });
  it('todo módulo tem texto do PDF e pelo menos um objetivo', () => {
    for (const m of modules) {
      expect(m.pdfText.length).toBeGreaterThan(20);
      expect(m.objectives.length).toBeGreaterThan(0);
    }
  });
  it('glossário do PDF tem os 22 termos', () => {
    expect(glossary.filter((g) => g.status === 'pdf')).toHaveLength(22);
  });
});

const structured = modules.filter((m) => m.devState === 'piloto-completo');

describe('módulos estruturados (definição de pronto)', () => {
  it('o Mundo 1 inteiro está estruturado (Etapa D) e os demais mundos ainda não', () => {
    expect(structured.map((m) => m.id)).toEqual(['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9']);
  });
  it.each(structured.map((m) => [m.id, m] as const))('%s tem três níveis completos', (_id, m) => {
    expect(m.objectives.length).toBeGreaterThanOrEqual(3);
    expect(m.objectives.every((o) => !o.provisional)).toBe(true);
    expect(m.lessons.length).toBeGreaterThanOrEqual(2);
    expect(m.activities.filter((a) => a.essential).length).toBeGreaterThanOrEqual(3);
    expect(m.activities.some((a) => a.essential && a.kind !== 'external' && a.kind !== 'demo')).toBe(true);
    expect(m.challenge).toBeDefined();
    expect(m.referenceIds.length).toBeGreaterThan(0);
  });
  it.each(structured.flatMap((m) => m.lessons).map((l) => [l.id, l] as const))('lição %s: 15–30 min, objetivo, pré-requisitos, termos, exemplos, erros comuns, resumo, fontes e verificação', (_id, l) => {
    expect(l.estimatedMinutes).toBeGreaterThanOrEqual(15);
    expect(l.estimatedMinutes).toBeLessThanOrEqual(30);
    expect(l.goal.length).toBeGreaterThan(40);
    expect(l.prerequisites.length).toBeGreaterThan(0);
    const types = new Set(l.blocks.map((b) => b.type));
    for (const t of ['term', 'example', 'misconception', 'summary']) expect(types.has(t as never), `${l.id} sem ${t}`).toBe(true);
    expect(l.referenceIds.length).toBeGreaterThan(0);
    expect(l.checkQuestionIds.length).toBe(5);
    expect(new Set(l.checkQuestionIds).size).toBe(5);
    for (const g of l.glossaryIds) expect(glossary.some((x) => x.id === g), `${l.id} → termo ${g}`).toBe(true);
  });
  it.each(structured.map((m) => [m.id, m] as const))('%s: cada objetivo tem ≥ 3 questões e ≥ 1 flashcard', (_id, m) => {
    for (const o of m.objectives) {
      expect(questions.filter((q) => q.objectiveIds.includes(o.id)).length, o.id).toBeGreaterThanOrEqual(3);
      expect(flashcards.filter((f) => f.objectiveIds.includes(o.id)).length, o.id).toBeGreaterThanOrEqual(1);
    }
  });
  it.each(structured.map((m) => [m.id, m] as const))('%s: desafio tem rubrica, checklist e campos exigidos', (_id, m) => {
    const c = m.challenge!;
    for (const k of ['problem', 'context', 'expectedResult'] as const) expect(c[k].length).toBeGreaterThan(30);
    expect(c.functionalRequirements.length).toBeGreaterThan(2);
    expect(c.constraints.length).toBeGreaterThan(0);
    expect(c.steps.length).toBeGreaterThan(2);
    expect(c.rubric.length).toBeGreaterThanOrEqual(2);
    expect(c.rubric.every((r) => r.levels.length === 4)).toBe(true);
    expect(c.deliveryChecklist.length).toBeGreaterThan(2);
    for (const r of c.supportReferenceIds) expect(references.some((x) => x.id === r), r).toBe(true);
  });
  it('atividades: ids únicos e itens consistentes', () => {
    const acts = structured.flatMap((m) => m.activities);
    expect(new Set(acts.map((a) => a.id)).size).toBe(acts.length);
    for (const a of acts) {
      if (a.kind === 'classify') for (const it of a.items) expect(a.categories.some((c) => c.id === it.category), `${a.id}/${it.id}`).toBe(true);
      if (a.kind === 'classify') for (const c of a.categories) expect(a.items.some((it) => it.category === c.id), `${a.id}: categoria ${c.id} sem itens`).toBe(true);
      if (a.kind === 'numeric') for (const p of a.problems) expect(Number.isFinite(p.answer) && p.tolerance >= 0).toBe(true);
      if (a.kind === 'judge') expect(a.statements.some((x) => x.correct) && a.statements.some((x) => !x.correct)).toBe(true);
      expect(a.instructions.length).toBeGreaterThan(0);
    }
  });
  it('cada módulo do Mundo 1 mantém a prática indicada no PDF como atividade externa', () => {
    for (const m of structured.filter((x) => x.pdfPractice)) expect(m.activities.some((a) => a.kind === 'external'), m.id).toBe(true);
  });
});

describe('banco de questões', () => {
  it('ids únicos, 4 alternativas, gabarito válido, objetivo existente', () => {
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    for (const q of questions) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect([0, 1, 2, 3]).toContain(q.correct);
      for (const o of q.objectiveIds) expect(getObjective(o), `${q.id} → ${o}`).toBeDefined();
    }
  });
  it('questões dos módulos estruturados explicam todas as alternativas incorretas e têm referência', () => {
    const ids = new Set(structured.map((m) => m.id));
    for (const q of questions.filter((x) => ids.has(x.moduleId))) {
      for (const i of [0, 1, 2, 3] as const) if (i !== q.correct) expect(q.distractorRationales?.[i], `${q.id}/${i}`).toBeTruthy();
      expect(q.distractorRationales?.[q.correct]).toBeUndefined();
      expect(q.referenceIds.length).toBeGreaterThan(0);
    }
  });
  it('sem enunciados duplicados (nem "variantes" com palavras trocadas)', () => {
    const stems = questions.map((q) => norm(q.stem));
    expect(new Set(stems).size).toBe(stems.length);
    expect(questions.some((q) => q.id.includes('-v'))).toBe(false);
  });
  it.each(structured.map((m) => m.id))('gabarito equilibrado no módulo %s: nenhuma posição passa de 40%', (id) => {
    const qs = questions.filter((q) => q.moduleId === id);
    expect(qs.length).toBeGreaterThanOrEqual(10);
    for (const i of [0, 1, 2, 3]) expect(qs.filter((q) => q.correct === i).length / qs.length).toBeLessThanOrEqual(0.4);
  });
  it('questões herdadas da v1 foram removidas dos módulos já estruturados', () => {
    const ids = new Set(structured.map((m) => m.id));
    expect(questions.filter((q) => ids.has(q.moduleId) && q.review === 'provisoria')).toHaveLength(0);
  });
  it('só fica "revisada" a questão aprovada numa revisão humana registrada', () => {
    const approved = new Set(REVIEWS.filter((r) => r.kind === 'humana').flatMap((r) => Object.entries(r.items).filter(([, i]) => i.decision === 'aprovada').map(([id]) => id)));
    const revised = questions.filter((q) => q.review === 'revisada').map((q) => q.id);
    expect(new Set(revised)).toEqual(approved);
  });
  it('verificações de lição apontam para questões existentes do mesmo objetivo', () => {
    for (const l of lessons) for (const id of l.checkQuestionIds) {
      const q = getQuestion(id)!;
      expect(q).toBeDefined();
      expect(q.objectiveIds.some((o) => l.objectiveIds.includes(o))).toBe(true);
    }
  });
});

describe('reposicionamento do gabarito', () => {
  it('move a correta e remapeia as explicações', () => {
    const r = placeCorrect(['A', 'B', 'C', 'D'], 1, { 0: 'a', 2: 'c', 3: 'd' }, 3);
    expect(r.options).toEqual(['A', 'C', 'D', 'B']);
    expect(r.correct).toBe(3);
    expect(r.distractorRationales).toEqual({ 0: 'a', 1: 'c', 2: 'd' });
  });
});

describe('referências', () => {
  it('todas têm título, organização, URL https e data ou estado "não verificado"', () => {
    for (const r of references) {
      expect(r.title && r.organization).toBeTruthy();
      expect(r.url.startsWith('https://')).toBe(true);
      if (r.verification === 'nao-verificado') expect(r.lastVerified).toBeNull();
      else expect(r.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
  it('referências usadas por lições, questões e módulos existem', () => {
    const ids = new Set(references.map((r) => r.id));
    const used = [...lessons.flatMap((l) => l.referenceIds), ...questions.flatMap((q) => q.referenceIds), ...modules.flatMap((m) => m.referenceIds), ...flashcards.flatMap((f) => f.referenceIds)];
    for (const u of used) expect(ids.has(u), u).toBe(true);
  });
});
