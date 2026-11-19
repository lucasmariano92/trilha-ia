import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import axe from 'axe-core';
import App from '../src/App';
import { KEYS, memoryStore } from '../src/services/storage';
import { getQuestion, getLesson } from '../src/content';
import { fresh } from './helpers';

beforeEach(() => {
  // jsdom não implementa matchMedia/scrollTo
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener: () => undefined, removeEventListener: () => undefined })) as unknown as typeof window.matchMedia;
  window.scrollTo = () => undefined;
});
afterEach(() => {
  cleanup();
  window.location.hash = '';
});

function renderAt(path: string, initial?: object) {
  window.location.hash = path;
  const kv = memoryStore(initial ? { [KEYS.data]: JSON.stringify(initial) } : {});
  const utils = render(<App kv={kv} />);
  return { ...utils, kv };
}

async function axeViolations(container: HTMLElement) {
  const r = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
  return r.violations.map((v) => `${v.id}: ${v.nodes.length} — ${v.help}`);
}

describe('fluxos da interface', () => {
  it('painel indica o próximo passo (lição 1.1.1)', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { name: 'Seu painel' })).toBeTruthy();
    expect(screen.getByText(/lição 1.1.1/)).toBeTruthy();
  });

  it('avaliação independente oculta o texto e 3/5 não conclui a teoria', () => {
    const { kv } = renderAt('/aula/1.1.1');
    expect(screen.getByLabelText('Conteúdo da lição')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Avaliação independente/ }));
    expect(screen.queryByLabelText('Conteúdo da lição')).toBeNull();
    expect(screen.getByText(/Texto oculto durante a avaliação independente/)).toBeTruthy();

    const qs = getLesson('1.1.1')!.checkQuestionIds.map((id) => getQuestion(id)!);
    const submit = screen.getByRole('button', { name: /Corrigir respostas/ }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    qs.forEach((q, i) => {
      const group = screen.getByRole('group', { name: new RegExp(q.stem.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) });
      const choice = i < 3 ? q.correct : (q.correct + 1) % 4;
      fireEvent.click(within(group).getAllByRole('radio')[choice]);
    });
    fireEvent.click(submit);
    expect(screen.getByText(/3\/5 \(60%\) no modo independente/)).toBeTruthy();
    expect(screen.getByText(/Abaixo de 80%/)).toBeTruthy();
    const saved = JSON.parse(kv.getItem(KEYS.data)!);
    expect(saved.checkAttempts).toHaveLength(1);
    expect(saved.answers.filter((a: { mode: string }) => a.mode === 'independente')).toHaveLength(5);
    expect(screen.getByLabelText('Conteúdo da lição')).toBeTruthy();
  });

  it('atividade não pode ser corrigida sem responder tudo', () => {
    renderAt('/modulo/1.1/praticar');
    const btns = screen.getAllByRole('button', { name: /Corrigir \(0\/10 respondidos\)/ }) as HTMLButtonElement[];
    expect(btns).toHaveLength(2);
    for (const b of btns) expect(b.disabled).toBe(true);
  });

  it('simulado completo fica liberado com 60 questões revisadas', () => {
    renderAt('/simulados');
    expect(screen.queryByText(/faltam \d+ questões revisadas/i)).toBeNull();
    expect((screen.getByRole('button', { name: /Iniciar simulado completo/ }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('simulado em andamento com questão retirada do banco não quebra a página', () => {
    const exam = { id: 'ex1', mode: 'treino', questionIds: ['q1.3-05', 'q1.1-01'], answers: {}, flags: [], current: 0, startedAtMs: Date.now(), durationSec: 220 };
    renderAt('/simulados', { ...fresh(), activeExam: exam });
    expect(screen.getByText(/retirada do banco/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    expect(screen.getByText(/Questão 2 de 2/)).toBeTruthy();
  });

  it('simulado de treino inicia, persiste e mostra o cronômetro', () => {
    const { kv } = renderAt('/simulados');
    fireEvent.click(screen.getByRole('button', { name: /Iniciar treino/ }));
    expect(screen.getByRole('timer')).toBeTruthy();
    expect(screen.getByText(/Questão 1 de 20/)).toBeTruthy();
    const saved = JSON.parse(kv.getItem(KEYS.data)!);
    expect(saved.activeExam.questionIds).toHaveLength(20);
  });

  it('flashcards funcionam pelo teclado (Espaço revela, 3 = Bom)', () => {
    const d = { ...fresh(), lessonsOpened: { '1.1.1': '2026-11-18T12:00:00.000Z' } };
    const { kv } = renderAt('/flashcards', d);
    expect(screen.queryByText(/Quanto você lembrou/)).toBeNull();
    act(() => void fireEvent.keyDown(window, { key: ' ' }));
    expect(screen.getByText(/Quanto você lembrou/)).toBeTruthy();
    act(() => void fireEvent.keyDown(window, { key: '3' }));
    const saved = JSON.parse(kv.getItem(KEYS.data)!);
    expect(Object.keys(saved.flashcards)).toHaveLength(1);
    expect(saved.flashcardLog[0].grade).toBe('bom');
  });

  it('importação recusa arquivo inválido sem alterar dados', async () => {
    renderAt('/backup');
    const input = document.querySelector('input[type=file]') as HTMLInputElement;
    const file = new File(['{quebrado'], 'b.json', { type: 'application/json' });
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(screen.getByRole('alert').textContent).toMatch(/JSON válido/);
  });

  it('exercício numérico corrige com vírgula decimal e registra a tentativa', () => {
    const { kv } = renderAt('/modulo/1.9/praticar');
    const inputs = ['0,002', '2', '5', '0,5'];
    inputs.forEach((v, i) => fireEvent.change(screen.getByLabelText(new RegExp(`^${i + 1}\\.`)), { target: { value: v } }));
    const btns = screen.getAllByRole('button', { name: /^Corrigir$/ });
    fireEvent.click(btns[btns.length - 1]);
    expect(screen.getAllByText(/4 de 4 corretos/).length).toBeGreaterThan(0);
    const saved = JSON.parse(kv.getItem(KEYS.data)!);
    expect(saved.activityAttempts.find((a: { activityId: string }) => a.activityId === 'a1.9-numeric').passed).toBe(true);
  });

  it('checkpoint do Mundo 1 oferece a avaliação prática', () => {
    renderAt('/mundo/1');
    expect(screen.getByText('Avaliação prática do checkpoint')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar avaliação' }));
    expect(screen.getByRole('button', { name: /Corrigir \(0\/10\)/ })).toBeTruthy();
  });

  it('projeto Glossário vivo tem editor e itens verificados automaticamente', () => {
    renderAt('/projetos/p1');
    expect(screen.getByText('Editor do Glossário vivo')).toBeTruthy();
    expect(screen.getAllByText(/Verificado automaticamente/)).toHaveLength(3);
  });

  it('módulo sem conteúdo estruturado mostra só o PDF e registro autodeclarado', () => {
    renderAt('/modulo/3.4');
    expect(screen.getByText(/Módulo ainda não aprofundado/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Registrar estudo \(autodeclarado\)/ })).toBeTruthy();
  });
});

describe('acessibilidade (axe-core, sem verificação de contraste no jsdom)', () => {
  it.each(['/', '/trilha', '/mundo/1', '/modulo/1.1', '/aula/1.1.2', '/modulo/1.1/praticar', '/modulo/1.1/aplicar', '/flashcards', '/questoes', '/simulados', '/projetos/p1', '/modulo/1.3/praticar', '/modulo/1.5/praticar', '/modulo/1.6/praticar', '/modulo/1.9/praticar', '/aula/1.5.1', '/aula/1.6.1', '/historico', '/duvidas', '/glossario', '/configuracoes', '/backup', '/privacidade', '/laboratorio'])(
    'sem violações em %s',
    async (path) => {
      const { container } = renderAt(path);
      expect(await axeViolations(container)).toEqual([]);
    },
    20000,
  );
});
