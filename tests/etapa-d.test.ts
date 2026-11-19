import { describe, expect, it } from 'vitest';
import { applyTemperature, callCost, cosine, fitContext, parseNumberBR } from '../src/services/aiMath';
import { livingGlossaryMarkdown, livingGlossaryStatus, LG_MIN } from '../src/services/livingGlossary';
import { addDiaryEntry, recordActivity, removeDiaryEntry, saveConcept, clearCategory } from '../src/services/actions';
import { activityPassed, isGraded } from '../src/services/mastery';
import { sanitizeUserData } from '../src/services/schema';
import { exportBackup, parseBackup } from '../src/services/backup';
import { getActivity, getModule } from '../src/content';
import { TOY_VECTORS } from '../src/components/activities/Widgets';
import { fresh } from './helpers';

const entropy = (p: number[]) => -p.reduce((s, x) => s + (x > 0 ? x * Math.log(x) : 0), 0);

describe('temperatura', () => {
  const base = [0.46, 0.22, 0.12, 0.09, 0.07];
  it('T = 0 escolhe sempre o mais provável', () => {
    expect(applyTemperature(base, 0)).toEqual([1, 0, 0, 0, 0]);
  });
  it('T = 1 preserva as proporções e normaliza', () => {
    const p = applyTemperature(base, 1);
    expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
    expect(p[0] / p[1]).toBeCloseTo(0.46 / 0.22, 6);
  });
  it('temperatura maior espalha a distribuição (mais entropia)', () => {
    expect(entropy(applyTemperature(base, 0.3))).toBeLessThan(entropy(applyTemperature(base, 1)));
    expect(entropy(applyTemperature(base, 1))).toBeLessThan(entropy(applyTemperature(base, 2)));
  });
});

describe('similaridade de cosseno (valores dos exercícios)', () => {
  it.each([
    [[1, 0], [0, 1], 0],
    [[3, 4], [6, 8], 1],
    [[1, 1], [1, 0], 0.7071],
    [[1, 2], [-1, -2], -1],
    [[3, 4], [4, 3], 0.96],
  ])('cos(%j, %j) ≈ %d', (a, b, r) => {
    expect(cosine(a, b)).toBeCloseTo(r, 3);
  });
  it('confere as respostas cadastradas no exercício 1.5', () => {
    const a = getActivity('a1.5-cosine');
    expect(a?.kind).toBe('numeric');
    if (a?.kind === 'numeric') expect(a.problems.map((p) => p.answer)).toEqual([0, 1, 0.71, -1]);
  });
  it('rejeita vetores de tamanhos diferentes', () => {
    expect(() => cosine([1], [1, 2])).toThrow();
  });
  it('no mapa de brinquedo, palavras do mesmo grupo são mais próximas', () => {
    expect(cosine(TOY_VECTORS.gato, TOY_VECTORS.cachorro)).toBeGreaterThan(cosine(TOY_VECTORS.gato, TOY_VECTORS.carro));
    expect(cosine(TOY_VECTORS.banana, TOY_VECTORS.maçã)).toBeGreaterThan(cosine(TOY_VECTORS.banana, TOY_VECTORS.ônibus));
  });
});

describe('janela de contexto', () => {
  const msgs = [{ id: 'sys', tokens: 300, pinned: true }, { id: 'm1', tokens: 250 }, { id: 'm2', tokens: 600 }, { id: 'm3', tokens: 1500 }, { id: 'm4', tokens: 700 }, { id: 'm5', tokens: 200 }, { id: 'm6', tokens: 650 }, { id: 'm7', tokens: 150 }];
  it('janela grande mantém tudo', () => {
    expect(fitContext(msgs, 5500, 500).dropped).toEqual([]);
  });
  it('janela menor corta primeiro as mensagens mais antigas e mantém as fixas', () => {
    const r = fitContext(msgs, 4000, 500);
    expect(r.kept).toContain('sys');
    expect(r.dropped).toEqual(['m1', 'm2']);
    expect(r.used).toBeLessThanOrEqual(3500);
  });
  it('não pula mensagens para encaixar uma mais antiga', () => {
    const r = fitContext(msgs, 2500, 500);
    expect(r.dropped).toContain('m3');
    expect(r.dropped).toContain('m1');
  });
});

describe('custo e números', () => {
  it('fórmula por milhão de tokens (valores do exercício 1.9)', () => {
    expect(callCost(2000, 500, 0.5, 2)).toBeCloseTo(0.002, 10);
    expect(callCost(1000, 1000, 1, 4) * 1000).toBeCloseTo(5, 10);
  });
  it.each([['0,5', 0.5], ['1.200', 1200], ['1 200', 1200], ['2.5', 2.5], ['-1', -1], ['1.234,56', 1234.56], ['', null], ['abc', null]])('interpreta "%s"', (raw, n) => {
    expect(parseNumberBR(raw as string)).toBe(n);
  });
});

describe('atividades numéricas e demonstrações', () => {
  it('atividade numérica é corrigida automaticamente', () => {
    const a = getActivity('a1.2-estimate')!;
    expect(isGraded(a)).toBe(true);
    let d = recordActivity(fresh(), { activityId: a.id, moduleId: '1.2', score: 2, max: 4, passThreshold: 0.8, hintsUsed: 1, wrongItemIds: ['p2', 'p3'] });
    expect(activityPassed(a, d)).toBe(false);
    d = recordActivity(d, { activityId: a.id, moduleId: '1.2', score: 4, max: 4, passThreshold: 0.8, hintsUsed: 0, wrongItemIds: [] });
    expect(activityPassed(a, d)).toBe(true);
  });
  it('respostas cadastradas no exercício de estimativa batem com a referência do PDF (650 tokens/página)', () => {
    const a = getActivity('a1.2-estimate');
    if (a?.kind !== 'numeric') throw new Error('tipo');
    expect(a.problems[0].answer).toBe(4 * 650);
    expect(a.problems[1].answer).toBe(10 * 650 + 0.5 * 650);
    expect(a.problems[2].answer).toBe(Math.floor((32000 - 2000) / 650));
  });
  it('demonstrações não são essenciais (não bloqueiam o Nível 2)', () => {
    for (const id of ['1.1', '1.3', '1.5', '1.6', '1.9']) for (const a of getModule(id)!.activities.filter((x) => x.kind === 'demo')) expect(a.essential).toBe(false);
  });
});

describe('Glossário vivo', () => {
  const longExp = 'x'.repeat(LG_MIN.explanation);
  const longEx = 'y'.repeat(LG_MIN.example);
  it('itens do checklist só ficam verdadeiros com conteúdo suficiente', () => {
    let d = fresh();
    expect(livingGlossaryStatus(d).auto).toEqual({ k1: false, k2: false, k3: false });
    for (let i = 1; i <= 9; i++) d = saveConcept(d, `1.${i}`, { explanation: longExp, example: i === 9 ? 'curto' : longEx });
    let st = livingGlossaryStatus(d);
    expect(st.auto.k1).toBe(true);
    expect(st.auto.k2).toBe(false);
    d = saveConcept(d, '1.9', { example: longEx });
    for (let i = 0; i < 3; i++) d = addDiaryEntry(d, { tool: 'X', claim: 'c', howFound: 'h', correct: 'k', source: 's' });
    st = livingGlossaryStatus(d);
    expect(st.auto).toEqual({ k1: true, k2: true, k3: true });
    d = removeDiaryEntry(d, d.livingGlossary.diary[0].id);
    expect(livingGlossaryStatus(d).auto.k3).toBe(false);
  });
  it('casos incompletos não contam no diário', () => {
    const d = addDiaryEntry(fresh(), { tool: '', claim: 'c', howFound: '', correct: 'k', source: '' });
    expect(livingGlossaryStatus(d).diary).toBe(0);
  });
  it('exporta Markdown com conceitos e diário', () => {
    let d = saveConcept(fresh(), '1.2', { explanation: 'Pedaço de texto', example: 'Testei no Tokenizer' });
    d = addDiaryEntry(d, { tool: 'Chat X', claim: 'Livro inexistente', howFound: 'Catálogo', correct: 'Não existe', source: 'Biblioteca' });
    const md = livingGlossaryMarkdown(d, { '1.2': 'Token' });
    expect(md).toContain('### Token');
    expect(md).toContain('Testei no Tokenizer');
    expect(md).toContain('Caso 1 — Chat X');
  });
  it('é validado no backup e apagado na exclusão de projetos', () => {
    const d = saveConcept(fresh(), '1.2', { explanation: 'a', example: 'b' });
    const r = parseBackup(exportBackup(d));
    expect(r.ok && r.data.livingGlossary.concepts['1.2'].explanation).toBe('a');
    expect(() => sanitizeUserData({ ...JSON.parse(JSON.stringify(d)), livingGlossary: 'texto' })).toThrow(/livingGlossary/);
    const bad = JSON.parse(JSON.stringify(d));
    bad.livingGlossary.diary = [{ id: 'z', claim: 1 }];
    expect(sanitizeUserData(bad).data.livingGlossary.diary).toHaveLength(0);
    expect(clearCategory(d, 'projetos').livingGlossary.concepts).toEqual({});
  });
  it('dados antigos sem o campo continuam válidos', () => {
    const d = JSON.parse(JSON.stringify(fresh()));
    delete d.livingGlossary;
    expect(sanitizeUserData(d).data.livingGlossary).toEqual({ concepts: {}, diary: [] });
  });
});
