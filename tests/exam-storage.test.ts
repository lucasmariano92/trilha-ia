import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { Question } from '../src/types/curriculum';
import { getQuestion, questions } from '../src/content';
import { createExam, fullExamEligibility, gradeExam, isExpired, remainingSeconds, resultByModule, selectQuestions, FULL_EXAM_SECONDS } from '../src/services/exam';
import { finishExam, startExam, updateActiveExam } from '../src/services/actions';
import { exportBackup, parseBackup } from '../src/services/backup';
import { KEYS, loadUserData, memoryStore, saveUserData } from '../src/services/storage';
import { sanitizeUserData, migrateV1 } from '../src/services/schema';
import { isGithubRepoUrl, isSafeHttpsUrl, sensitiveWarnings } from '../src/services/validate';
import { fresh, answer } from './helpers';

const fake = (n: number, review: Question['review'] = 'revisada'): Question[] =>
  Array.from({ length: n }, (_, i) => ({ ...questions[0], id: `x${i}`, moduleId: `${1 + (i % 5)}.${1 + (i % 3)}`, review }));

describe('simulados: elegibilidade e seleção', () => {
  it('banco atual não permite simulado completo e informa quantas faltam', () => {
    const e = fullExamEligibility(questions);
    expect(e.canStart).toBe(false);
    expect(e.missing).toBe(60 - e.eligible);
    expect(() => createExam(questions, 'completo', 0)).toThrow(/Faltam 60/);
  });
  it('com 60 revisadas, cria simulado de 60 questões distintas e 1h50', () => {
    const exam = createExam(fake(70), 'completo', 1000, 42);
    expect(exam.questionIds).toHaveLength(60);
    expect(new Set(exam.questionIds).size).toBe(60);
    expect(exam.durationSec).toBe(FULL_EXAM_SECONDS);
  });
  it('questões provisórias não entram no simulado completo', () => {
    expect(fullExamEligibility([...fake(59), ...fake(10, 'provisoria').map((q, i) => ({ ...q, id: `p${i}` }))]).canStart).toBe(false);
  });
  it('nunca repete questão para completar o número', () => {
    expect(() => selectQuestions(fake(10), 11, 1)).toThrow(/insuficiente/);
    const s = selectQuestions(fake(30), 30, 7);
    expect(new Set(s.map((q) => q.id)).size).toBe(30);
  });
  it('seleção é reproduzível com a mesma semente e cobre vários módulos', () => {
    const a = selectQuestions(questions, 20, 5).map((q) => q.id);
    expect(selectQuestions(questions, 20, 5).map((q) => q.id)).toEqual(a);
    expect(new Set(selectQuestions(questions, 20, 5).map((q) => q.moduleId)).size).toBeGreaterThan(10);
  });
  it('treino usa no máximo 20 questões com tempo proporcional (110 s cada)', () => {
    const e = createExam(questions, 'treino', 0, 3);
    expect(e.questionIds).toHaveLength(20);
    expect(e.durationSec).toBe(20 * 110);
  });
});

describe('cronômetro', () => {
  const exam = createExam(fake(60), 'completo', 1_000_000, 1);
  it('calcula o restante a partir do início', () => {
    expect(remainingSeconds(exam, 1_000_000)).toBe(6600);
    expect(remainingSeconds(exam, 1_000_000 + 60_500)).toBe(6540);
  });
  it('expira no prazo e nunca fica negativo', () => {
    expect(isExpired(exam, 1_000_000 + 6600_000)).toBe(true);
    expect(remainingSeconds(exam, 1_000_000 + 9_999_000)).toBe(0);
  });
  it('recarregar (salvar e carregar) não reinicia o tempo', () => {
    const store = memoryStore();
    saveUserData(store, startExam(fresh(), exam));
    const loaded = loadUserData(store).data.activeExam!;
    expect(loaded.startedAtMs).toBe(1_000_000);
    expect(remainingSeconds(loaded, 1_000_000 + 600_000)).toBe(6000);
  });
});

describe('correção de simulados', () => {
  it('corrige, conta brancos como erro, agrupa por assunto e grava respostas', () => {
    const bank = questions.filter((q) => q.moduleId === '1.1').slice(0, 4);
    const exam = { ...createExam(bank, 'treino', 0, 1), questionIds: bank.map((q) => q.id) };
    exam.answers = { [bank[0].id]: bank[0].correct, [bank[1].id]: (bank[1].correct + 1) % 4 };
    const att = gradeExam(exam, getQuestion, 120_000, 'antecipado');
    expect(att.correct).toBe(1);
    expect(att.total).toBe(4);
    expect(att.answers[2].chosen).toBeNull();
    expect(att.usedSec).toBe(120);
    expect(resultByModule(att, getQuestion)).toEqual([{ key: '1.1', correct: 1, total: 4 }]);
    let d = startExam(fresh(), exam);
    d = updateActiveExam(d, { flags: [bank[3].id] });
    d = finishExam(d, getQuestion, 120_000, 'antecipado');
    expect(d.activeExam).toBeNull();
    expect(d.exams).toHaveLength(1);
    expect(d.answers.filter((a) => a.mode === 'simulado')).toHaveLength(4);
  });
});

describe('persistência local', () => {
  it('salva e recarrega', () => {
    const s = memoryStore();
    const d = { ...fresh(), answers: [answer('1.1-O1', true)] };
    expect(saveUserData(s, d).ok).toBe(true);
    const r = loadUserData(s);
    expect(r.source).toBe('v2');
    expect(r.data.answers).toHaveLength(1);
  });
  it('dados corrompidos: guarda cópia, reinicia e avisa', () => {
    const s = memoryStore({ [KEYS.data]: '{isso não é json' });
    const r = loadUserData(s);
    expect(r.source).toBe('corrompido');
    expect(r.warnings[0]).toMatch(/ilegíveis/);
    expect(s.dump()[KEYS.corrupted]).toBe('{isso não é json');
  });
  it('migra automaticamente os dados da v1', () => {
    const v1 = { completed: ['1.2', '1.3'], reviews: { '1.1': {} }, attempts: [{ kind: 'questoes' }], doubts: [{ id: 'a', lessonId: '1.2', text: 'O que é token?', resolved: false, date: '2026-11-01' }], answers: {}, projects: { '1': { checks: [true], url: 'https://github.com/a/b', notes: 'n' } }, reports: [], daysPerWeek: 4, studyMinutes: 0, dark: true, studyDates: ['2026-11-01'], levels: {} };
    const r = loadUserData(memoryStore({ [KEYS.legacyV1]: JSON.stringify(v1) }));
    expect(r.source).toBe('v1-migrado');
    expect(Object.keys(r.data.selfReportedStudy)).toEqual(['1.2', '1.3']);
    expect(r.data.doubts[0].text).toBe('O que é token?');
    expect(r.data.projects.p1.githubUrl).toBe('https://github.com/a/b');
    expect(r.data.preferences).toMatchObject({ daysPerWeek: 4, theme: 'escuro' });
    expect(r.warnings.join(' ')).toMatch(/não foram convertid/);
  });
  it('falha de gravação (cota) devolve erro compreensível', () => {
    const s = { getItem: () => null, removeItem: () => undefined, setItem: () => { throw new DOMException('cheio', 'QuotaExceededError'); } };
    const r = saveUserData(s, fresh());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/esgotado/);
  });
});

describe('backup: exportação e importação', () => {
  it('ida e volta preserva os dados', () => {
    const d = { ...fresh(), answers: [answer('1.1-O1', true)], notes: { '1.1.1': 'minha nota' } };
    const r = parseBackup(exportBackup(d));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.notes['1.1.1']).toBe('minha nota');
      expect(r.summary.answers).toBe(1);
    }
  });
  it('o arquivo avisa que não é criptografado e tem versão', () => {
    const env = JSON.parse(exportBackup(fresh()));
    expect(env.format).toBe('trilha-ia-backup');
    expect(env.schemaVersion).toBe(2);
    expect(env.notice).toMatch(/NÃO é criptografado/);
  });
  it.each([
    ['', /vazio/],
    ['{incompleto', /JSON válido/],
    ['{"a":1}', /não é um backup/],
    ['[1,2,3]', /não é um backup/],
  ])('recusa arquivo inválido: %s', (txt, msg) => {
    const r = parseBackup(txt);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(msg);
  });
  it('recusa versão mais nova do aplicativo', () => {
    const env = JSON.parse(exportBackup(fresh()));
    env.data.schemaVersion = 99;
    const r = parseBackup(JSON.stringify(env));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/versão mais nova/);
  });
  it('recusa tentativa de poluição de protótipo', () => {
    const txt = exportBackup(fresh()).replace('"notes": {}', '"notes": {"__proto__": {"admin": true}}');
    const r = parseBackup(txt);
    expect(r.ok).toBe(false);
    expect(({} as Record<string, unknown>).admin).toBeUndefined();
  });
  it('recusa arquivo maior que 5 MB', () => {
    const r = parseBackup(' '.repeat(5 * 1024 * 1024 + 10) + '{}');
    expect(r.ok).toBe(false);
  });
  it('descarta itens malformados e avisa, sem quebrar o resto', () => {
    const env = JSON.parse(exportBackup({ ...fresh(), answers: [answer('1.1-O1', true)] }));
    env.data.answers.push({ questionId: 1, correct: 'sim' });
    env.data.flashcards = { ok: { due: '2026-11-18', interval: 1, ease: 2.5, reps: 1, lapses: 0 }, ruim: { due: 'amanhã' } };
    const r = parseBackup(JSON.stringify(env));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.answers).toHaveLength(1);
      expect(Object.keys(r.data.flashcards)).toEqual(['ok']);
      expect(r.warnings.length).toBeGreaterThan(0);
    }
  });
  it('rejeita estrutura raiz errada', () => {
    expect(() => sanitizeUserData({ ...fresh(), answers: 'muitas' })).toThrow(/lista/);
    expect(() => migrateV1({ foo: 1 })).toThrow();
  });
  it('simulado em andamento inválido (questões repetidas) é descartado', () => {
    const d = { ...fresh(), activeExam: { id: 'e', mode: 'treino', questionIds: ['a', 'a'], answers: {}, flags: [], current: 0, startedAtMs: 1, durationSec: 60 } };
    const r = sanitizeUserData(JSON.parse(JSON.stringify(d)));
    expect(r.data.activeExam).toBeNull();
  });
});

describe('segurança', () => {
  it('aceita só links https, sem credenciais embutidas', () => {
    expect(isSafeHttpsUrl('https://exemplo.com')).toBe(true);
    for (const bad of ['javascript:alert(1)', 'data:text/html,x', 'http://exemplo.com', 'https://user:pw@exemplo.com', 'nada']) expect(isSafeHttpsUrl(bad), bad).toBe(false);
    expect(isGithubRepoUrl('https://github.com/a/b')).toBe(true);
    expect(isGithubRepoUrl('https://github.com/a')).toBe(false);
    expect(isGithubRepoUrl('https://gitlab.com/a/b')).toBe(false);
  });
  it('alerta sobre possíveis segredos e dados pessoais', () => {
    expect(sensitiveWarnings('minha chave sk-abcdefghijklmnopqrstuv')).toHaveLength(1);
    expect(sensitiveWarnings('CPF 123.456.789-09')).toContain('CPF');
    expect(sensitiveWarnings('senha: hunter2')).toContain('possível senha');
    expect(sensitiveWarnings('texto comum sobre tokens')).toHaveLength(0);
  });
  const files = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)]));
  const src = files('src').filter((f) => /\.(ts|tsx)$/.test(f)).map((f) => [f, readFileSync(f, 'utf8')] as const);
  it('o código não usa eval, new Function nem dangerouslySetInnerHTML', () => {
    for (const [f, txt] of src) {
      expect(/\beval\s*\(/.test(txt), f).toBe(false);
      expect(/new Function\s*\(/.test(txt), f).toBe(false);
      expect(txt.includes('dangerouslySetInnerHTML'), f).toBe(false);
    }
  });
  it('todo link com target=_blank usa rel="noopener noreferrer"', () => {
    for (const [f, txt] of src) for (const m of txt.matchAll(/<a [^>]*target="_blank"[^>]*>/g)) expect(m[0], f).toContain('noopener noreferrer');
  });
  it('não há chamadas de rede no código da aplicação', () => {
    for (const [f, txt] of src) expect(/\bfetch\s*\(|XMLHttpRequest|WebSocket\(/.test(txt), f).toBe(false);
  });
  it('dados salvos não contêm campos de senha, token ou chave', () => {
    const keys = JSON.stringify(fresh());
    expect(/password|senha|apiKey|token"/i.test(keys)).toBe(false);
  });
});
