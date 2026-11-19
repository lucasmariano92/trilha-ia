import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Flashcard } from '../types/curriculum';
import type { Grade } from '../types/progress';
import { useStore } from '../store/StoreContext';
import { flashcards, getModule } from '../content';
import { reviewFlashcard } from '../services/actions';
import { isConsolidated, isDue } from '../services/srs';
import { localDate, formatDateBR } from '../services/dates';
import { Card, PageTitle, Stat, Callout, ContentBadge, EmptyState } from '../components/ui';
import { Link } from '../router';

export const NEW_PER_DAY = 10;
const GRADES: { g: Grade; label: string; key: string }[] = [
  { g: 'errei', label: 'Errei', key: '1' },
  { g: 'dificil', label: 'Difícil', key: '2' },
  { g: 'bom', label: 'Bom', key: '3' },
  { g: 'facil', label: 'Fácil', key: '4' },
];

/** Um módulo "entra" no baralho quando o aluno começou a estudá-lo (abriu lição ou registrou estudo). */
export function moduleStarted(moduleId: string | undefined, d: ReturnType<typeof useStore>['data']) {
  if (!moduleId) return false;
  const m = getModule(moduleId);
  if (!m) return false;
  return !!d.selfReportedStudy[moduleId] || m.lessons.some((l) => d.lessonsOpened[l.id]);
}

export default function FlashcardsPage() {
  const { data, update } = useStore();
  const today = localDate();
  const queue = useMemo(() => {
    // cartões cuja PRIMEIRA revisão foi hoje contam no limite diário de novos
    const firstSeen = new Map<string, string>();
    for (const r of data.flashcardLog) if (!firstSeen.has(r.cardId)) firstSeen.set(r.cardId, r.at);
    const newToday = [...firstSeen.values()].filter((at) => localDate(new Date(at)) === today).length;
    const due = flashcards.filter((c) => isDue(data.flashcards[c.id], today));
    const fresh = flashcards.filter((c) => !data.flashcards[c.id] && moduleStarted(c.moduleId, data));
    return [...due, ...fresh.slice(0, Math.max(0, NEW_PER_DAY - newToday))];
  }, [data, today]);
  const [flipped, setFlipped] = useState(false);
  const card: Flashcard | undefined = queue[0];

  const grade = useCallback(
    (g: Grade) => {
      if (!card || !flipped) return;
      update((d) => reviewFlashcard(d, card.id, g, today));
      setFlipped(false);
    },
    [card, flipped, update, today],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof Element && e.target.closest('input,textarea,select,button')) return;
      if (e.key === ' ' || e.key === 'Enter') {
        if (!flipped && card) {
          e.preventDefault();
          setFlipped(true);
        }
      }
      const found = GRADES.find((x) => x.key === e.key);
      if (found) grade(found.g);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flipped, card, grade]);

  const states = Object.values(data.flashcards);
  const upcoming = flashcards
    .filter((c) => data.flashcards[c.id] && !isDue(data.flashcards[c.id], today))
    .sort((a, b) => data.flashcards[a.id].due.localeCompare(data.flashcards[b.id].due))
    .slice(0, 8);

  return (
    <>
      <PageTitle title="Flashcards" subtitle="Revisão espaçada com quatro níveis de lembrança. Teclado: Espaço revela; 1 Errei, 2 Difícil, 3 Bom, 4 Fácil." />
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Para revisar agora" value={queue.length} />
        <Stat label="No baralho" value={states.length} hint={`de ${flashcards.length} cartões`} />
        <Stat label="Consolidados" value={states.filter(isConsolidated).length} hint="intervalo ≥ 21 dias" />
        <Stat label="Revisões feitas" value={data.flashcardLog.length} />
      </div>

      {card ? (
        <Card className="mx-auto max-w-2xl" aria-labelledby="fc">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="muted">Módulo {card.moduleId} · {data.flashcards[card.id] ? 'revisão' : 'cartão novo'}</span>
            <ContentBadge status={card.status} />
          </div>
          <h2 id="fc" className="sr-only">Cartão atual</h2>
          <div className="mt-4 min-h-48 rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
            <p className="text-lg font-semibold">{card.front}</p>
            {flipped && (
              <p className="mt-6 border-t border-slate-200 pt-6 leading-7 dark:border-slate-800" aria-live="polite">
                {card.back}
              </p>
            )}
          </div>
          {!flipped ? (
            <button className="btn-primary mt-4 w-full" onClick={() => setFlipped(true)}>Revelar resposta (Espaço)</button>
          ) : (
            <>
              <p className="muted mt-4 text-center text-sm">Quanto você lembrou ANTES de ver a resposta?</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {GRADES.map((x) => (
                  <button key={x.g} className={x.g === 'errei' ? 'btn-danger' : 'btn-secondary'} onClick={() => grade(x.g)}>
                    {x.label} <span className="muted text-xs">({x.key})</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </Card>
      ) : (
        <EmptyState title="Nenhum cartão para agora.">
          {states.length === 0 ? (
            <>Os cartões de um módulo entram no baralho quando você começa a estudá-lo. <Link to="/aula/1.1.1" className="link">Comece pela lição 1.1.1</Link>.</>
          ) : (
            'Os próximos cartões aparecerão nas datas programadas.'
          )}
        </EmptyState>
      )}

      {upcoming.length > 0 && (
        <Card className="mt-6" aria-labelledby="prox">
          <h2 id="prox" className="text-lg">Próximas revisões</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {upcoming.map((c) => (
              <li key={c.id} className="flex justify-between gap-3">
                <span className="truncate">{c.front}</span>
                <span className="muted shrink-0">{formatDateBR(data.flashcards[c.id].due)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <div className="mt-6">
        <Callout tone="info" title="Sobre o algoritmo">
          Variante do SM-2 com quatro botões: "Errei" volta amanhã; "Difícil" aumenta pouco o intervalo; "Bom" usa 1 dia, 3 dias e depois intervalo × facilidade; "Fácil" aumenta mais. Lembrar de uma resposta logo depois de vê-la não é domínio: por isso os flashcards servem para manutenção e não alteram o estado de domínio dos objetivos (que depende de respostas independentes às questões). Até {NEW_PER_DAY} cartões novos por dia.
        </Callout>
      </div>
    </>
  );
}
