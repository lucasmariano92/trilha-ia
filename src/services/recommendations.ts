import type { UserData } from '../types/progress';
import { getActivity, getObjective, lessons, modules } from '../content';
import { evaluateModule } from './mastery';
import { dueCardsCount } from './plan';
import { localDate } from './dates';

export interface Recommendation {
  kind: 'revisar-licao' | 'refazer-atividade' | 'flashcards' | 'concepcao-equivocada';
  priority: number; // menor = mais urgente
  title: string;
  detail: string;
  route: string;
}

/** Erros na mesma atividade (itens) que, repetidos, indicam dificuldade persistente. */
export const REPEATED_ERROR_ATTEMPTS = 2;

/**
 * Recomenda reforço SOMENTE com evidência suficiente:
 *  - objetivo com dados suficientes e desempenho em "dificuldade";
 *  - respostas erradas com confiança alta (concepção equivocada);
 *  - o mesmo item errado em 2+ tentativas de uma atividade;
 *  - flashcards vencidos.
 * Objetivos com "dados insuficientes" nunca geram recomendação de reforço.
 */
export function recommendations(data: UserData, today: string = localDate()): Recommendation[] {
  const out: Recommendation[] = [];
  for (const m of modules.filter((x) => x.devState === 'piloto-completo')) {
    const ev = evaluateModule(m, data, today);
    for (const o of ev.objectives) {
      const obj = getObjective(o.objectiveId);
      const lesson = lessons.find((l) => l.objectiveIds.includes(o.objectiveId));
      if (o.level === 'dificuldade') {
        out.push({
          kind: 'revisar-licao', priority: 1,
          title: `Reforçar: ${obj?.text.split(',')[0] ?? o.objectiveId}`,
          detail: `Acerto de ${Math.round((o.recentAccuracy ?? 0) * 100)}% nas últimas ${Math.min(5, o.independent)} respostas independentes.`,
          route: lesson ? `/aula/${lesson.id}` : `/modulo/${m.id}`,
        });
      }
      if (o.confidentErrors >= 2) {
        out.push({
          kind: 'concepcao-equivocada', priority: 2,
          title: `Possível concepção equivocada em ${o.objectiveId}`,
          detail: `${o.confidentErrors} respostas erradas marcadas com confiança alta. Releia os "erros de interpretação comuns" da lição.`,
          route: lesson ? `/aula/${lesson.id}` : `/modulo/${m.id}`,
        });
      }
    }
    // itens errados repetidamente em atividades
    const byActivity = new Map<string, Map<string, number>>();
    for (const a of data.activityAttempts.filter((t) => t.moduleId === m.id)) {
      const counts = byActivity.get(a.activityId) ?? new Map<string, number>();
      for (const id of a.wrongItemIds) counts.set(id, (counts.get(id) ?? 0) + 1);
      byActivity.set(a.activityId, counts);
    }
    for (const [actId, counts] of byActivity) {
      const repeated = [...counts.values()].filter((n) => n >= REPEATED_ERROR_ATTEMPTS).length;
      const passed = data.activityAttempts.some((t) => t.activityId === actId && t.passed);
      if (repeated > 0 && !passed) {
        out.push({
          kind: 'refazer-atividade', priority: 3,
          title: `Refazer: ${getActivity(actId)?.title ?? actId}`,
          detail: `${repeated} item(ns) errado(s) em mais de uma tentativa. Use as dicas progressivas.`,
          route: `/modulo/${m.id}/praticar`,
        });
      }
    }
  }
  const due = dueCardsCount(data, today);
  if (due > 0) out.push({ kind: 'flashcards', priority: 4, title: `${due} flashcard(s) para revisar`, detail: 'Revisões vencidas hoje ou antes.', route: '/flashcards' });
  return out.sort((a, b) => a.priority - b.priority);
}
