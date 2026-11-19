import { describe, expect, it } from 'vitest';
import { REVIEWS, getQuestion, lessons, questions, questionsOfModule } from '../src/content';
import review from '../src/content/reviews/mundo1-2026-11-19.json';
import { applyReview, type ReviewFile } from '../src/content/reviews/apply';
import type { Question } from '../src/types/curriculum';

const items = Object.entries((review as ReviewFile).items);
const parseNum = (s: string) => Number(s.replace(/[^\d,]/g, '').replace(/\./g, '').replace(',', '.'));

describe('revisão humana do Mundo 1 (19/11/2026)', () => {
  it('registra 100 decisões: 60 aprovadas, 37 reescritas, 3 descartadas', () => {
    const count = (d: string) => items.filter(([, i]) => i.decision === d).length;
    expect(items).toHaveLength(100);
    expect([count('aprovada'), count('reescrita'), count('descartada')]).toEqual([60, 37, 3]);
    expect(REVIEWS.map((r) => r.kind)).toEqual(['humana', 'assistente']);
  });

  it('questões descartadas saem do banco e de todas as verificações de lição', () => {
    for (const [id, i] of items) if (i.decision === 'descartada') {
      expect(getQuestion(id), id).toBeUndefined();
      expect(lessons.some((l) => l.checkQuestionIds.includes(id)), id).toBe(false);
    }
  });

  it('reescritas usam o texto da última revisão registrada, mantêm o gabarito da planilha e seguem pendentes', () => {
    for (const [id, i0] of items) if (i0.decision === 'reescrita') {
      const i = [...REVIEWS].reverse().find((r) => r.items[id])!.items[id];
      const q = getQuestion(id)!;
      expect(q.correct, id).toBe(i0.correct);
      expect(q.stem).toBe(i.stem);
      expect(q.options).toEqual(i.options);
      expect(q.correct).toBe(i.correct);
      expect(q.review).toBe('pendente-revisao');
      expect(Object.keys(q.distractorRationales ?? {}).map(Number).sort()).toEqual([0, 1, 2, 3].filter((k) => k !== q.correct));
      expect(q.rationale).not.toMatch(/verificar URL|Refer[eê]ncia[^:.]*:/);
    }
  });

  it('as citações das questões 37 e 43 viram referências verificadas', () => {
    expect(getQuestion('q1.3-07')!.referenceIds).toEqual(['lost-in-the-middle']);
    expect(getQuestion('q1.4-03')!.referenceIds).toEqual(['openai-why-hallucinate']);
  });

  it('cada módulo do Mundo 1 mantém pelo menos 10 questões', () => {
    for (const m of ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9']) expect(questionsOfModule(m).length, m).toBeGreaterThanOrEqual(10);
  });

  it('applyReview não altera questões sem decisão e não promove por engano', () => {
    const q = getQuestion('q2.1-01') ?? questions.find((x) => x.worldId === 2)!;
    const out = applyReview([q], { source: 't', reviewedOn: '2026-01-01', items: {} });
    expect(out[0]).toBe(q);
    const approved = applyReview([{ ...q, id: 'x' } as Question], { source: 't', reviewedOn: '2026-01-01', items: { x: { decision: 'aprovada' } } });
    expect(approved[0].review).toBe('revisada');
    expect(approved[0].reviewNote).toMatch('01/01/2026');
  });
});

describe('questões novas que substituem as descartadas', () => {
  it('q1.3-11: o gabarito confere com a conta 16.000 − (1.200 + 5.300 + 7.000)', () => {
    const q = getQuestion('q1.3-11')!;
    expect(parseNum(q.options[q.correct])).toBe(16000 - (1200 + 5300 + 7000));
  });
  it('q1.9-11: o gabarito confere com o custo diário calculado', () => {
    const q = getQuestion('q1.9-11')!;
    const daily = (200 * 1500 * 0.5 + 200 * 500 * 1.5) / 1_000_000;
    expect(parseNum(q.options[q.correct])).toBeCloseTo(daily, 10);
    expect(new Set(q.options).size).toBe(4);
  });
  it('as novas questões ficam pendentes de revisão e estão nas verificações certas', () => {
    for (const id of ['q1.3-11', 'q1.9-11', 'q1.9-12']) expect(getQuestion(id)!.review).toBe('pendente-revisao');
    expect(lessons.find((l) => l.checkQuestionIds.includes('q1.3-11'))?.moduleId).toBe('1.3');
    expect(lessons.filter((l) => l.checkQuestionIds.some((x) => x === 'q1.9-11' || x === 'q1.9-12'))).toHaveLength(2);
  });
});

describe('ajuste de alternativas feito pelo assistente', () => {
  const pending = questions.filter((q) => q.worldId === 1 && q.review === 'pendente-revisao');
  const ABS = /\b(sempre|nunca|necessariamente|garant\w*|qualquer|exatamente|obrigatoriamente|automaticamente)\b/i;

  it('não pode aprovar questões', () => {
    const q = questions[0];
    expect(() => applyReview([q], { source: 't', reviewedOn: '2026-01-01', kind: 'assistente', items: { [q.id]: { decision: 'aprovada' } } })).toThrow(/não pode aprovar/);
  });

  it('cobre as 40 pendentes do Mundo 1 (37 reescritas + 3 novas)', () => {
    expect(pending).toHaveLength(40);
  });

  it('a alternativa correta não é a mais longa na maioria das pendentes', () => {
    const longest = pending.filter((q) => {
      const len = q.options.map((o) => o.length);
      return len[q.correct] === Math.max(...len);
    });
    // Ao acaso, seria ~25%; antes do ajuste eram 33 de 37 (89%).
    expect(longest.length / pending.length).toBeLessThanOrEqual(0.35);
  });

  it('palavras absolutas não denunciam as alternativas erradas', () => {
    let wrongWithAbs = 0;
    for (const q of pending) q.options.forEach((o, i) => { if (i !== q.correct && ABS.test(o)) wrongWithAbs++; });
    // Antes do ajuste: 67 de 111 distratores.
    expect(wrongWithAbs / (pending.length * 3)).toBeLessThanOrEqual(0.15);
  });

  it('nenhuma alternativa é muito mais longa que as demais da mesma questão', () => {
    for (const q of pending) {
      const len = q.options.map((o) => o.length);
      const avgOthers = (len.reduce((a, b) => a + b, 0) - len[q.correct]) / 3;
      expect(len[q.correct] / avgOthers, q.id).toBeLessThan(1.3);
    }
  });
});
