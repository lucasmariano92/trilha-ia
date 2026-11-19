import { CheckCircle2, XCircle } from 'lucide-react';
import type { Question } from '../types/curriculum';
import { getReference } from '../content';
import { ReviewBadge } from './ui';

const L = ['A', 'B', 'C', 'D'];

export interface QuestionCardProps {
  question: Question;
  index?: number;
  selected: number | null;
  onSelect: (i: number) => void;
  revealed: boolean;
  confidence?: 1 | 2 | 3;
  onConfidence?: (c: 1 | 2 | 3) => void;
  showMeta?: boolean;
  disabled?: boolean;
}

/** Questão de múltipla escolha com confiança opcional e correção comentada (inclusive das alternativas erradas). */
export function QuestionCard({ question: q, index, selected, onSelect, revealed, confidence, onConfidence, showMeta = true, disabled }: QuestionCardProps) {
  const name = `q-${q.id}`;
  const isCorrect = selected === q.correct;
  return (
    <fieldset className="space-y-3" aria-describedby={revealed ? `${name}-fb` : undefined}>
      <legend className="mb-2 w-full">
        {showMeta && (
          <span className="mb-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="chip bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{q.moduleId}</span>
            <span className="chip bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {{ basica: 'Básica', intermediaria: 'Intermediária', avancada: 'Avançada' }[q.difficulty]}
            </span>
            <ReviewBadge review={q.review} />
          </span>
        )}
        <span className="block text-base font-semibold leading-7">
          {index !== undefined && <span className="mr-1">{index + 1}.</span>}
          {q.stem}
        </span>
      </legend>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const chosen = selected === i;
          let cls = 'border-slate-200 hover:border-primary/60 dark:border-slate-700';
          if (chosen && !revealed) cls = 'border-primary bg-primary-soft dark:border-primary-dark dark:bg-slate-800';
          if (revealed && i === q.correct) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50';
          else if (revealed && chosen) cls = 'border-red-500 bg-red-50 dark:bg-red-950/50';
          return (
            <label key={i} className={`option flex cursor-pointer items-start gap-3 ${cls} ${disabled || revealed ? 'cursor-default' : ''}`}>
              <input
                type="radio"
                name={name}
                className="mt-1 accent-indigo-600"
                checked={chosen}
                disabled={disabled || revealed}
                onChange={() => onSelect(i)}
              />
              <span>
                <b className="mr-1">{L[i]}.</b>
                {opt}
                {revealed && i === q.correct && <span className="sr-only"> (alternativa correta)</span>}
              </span>
            </label>
          );
        })}
      </div>

      {onConfidence && !revealed && selected !== null && (
        <div className="flex flex-wrap items-center gap-2 text-sm" role="group" aria-label="Confiança na resposta">
          <span className="muted">Sua confiança:</span>
          {([1, 2, 3] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={confidence === c}
              className={`chip border ${confidence === c ? 'border-primary bg-primary-soft text-primary dark:border-primary-dark dark:bg-slate-800 dark:text-primary-dark' : 'border-slate-300 dark:border-slate-700'}`}
              onClick={() => onConfidence(c)}
            >
              {{ 1: 'Chutei', 2: 'Acho que sei', 3: 'Tenho certeza' }[c]}
            </button>
          ))}
        </div>
      )}

      {revealed && (
        <div id={`${name}-fb`} className="rounded-xl bg-slate-50 p-4 text-sm leading-6 dark:bg-slate-950" aria-live="polite">
          <p className={`flex items-center gap-2 font-bold ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
            {isCorrect ? <CheckCircle2 size={18} aria-hidden="true" /> : <XCircle size={18} aria-hidden="true" />}
            {selected === null ? 'Em branco.' : isCorrect ? 'Correto.' : `Incorreto. A resposta é ${L[q.correct]}.`}
          </p>
          <p className="mt-2">
            <b>Por que {L[q.correct]} está correta:</b> {q.rationale}
          </p>
          {q.distractorRationales ? (
            <ul className="mt-2 space-y-1">
              {([0, 1, 2, 3] as const)
                .filter((i) => i !== q.correct)
                .map((i) => (
                  <li key={i} className={selected === i ? 'font-semibold' : ''}>
                    <b>{L[i]}:</b> {q.distractorRationales?.[i] ?? 'Explicação pendente.'}
                  </li>
                ))}
            </ul>
          ) : (
            <p className="muted mt-2">Explicação por alternativa ainda não escrita para esta questão provisória.</p>
          )}
          {q.referenceIds.length > 0 && (
            <p className="muted mt-2 text-xs">
              Referência: {q.referenceIds.map((r) => getReference(r)?.title ?? r).join('; ')}
            </p>
          )}
        </div>
      )}
    </fieldset>
  );
}
