import { useState, type ReactNode } from 'react';
import { Lightbulb, CheckCircle2 } from 'lucide-react';
import type { Activity } from '../../types/curriculum';
import { useStore } from '../../store/StoreContext';
import { activityPassed } from '../../services/mastery';
import { Chip } from '../ui';

const LEVEL: Record<Activity['level'], string> = {
  demonstracao: 'Demonstração guiada',
  introdutorio: 'Exercício introdutório',
  intermediario: 'Exercício intermediário',
  transferencia: 'Exercício de transferência',
};

/** Moldura comum: instruções passo a passo, dicas progressivas, erros comuns e histórico de tentativas. */
export function ActivityShell({ activity, children, hintsUsed, onHint }: { activity: Activity; children: ReactNode; hintsUsed: number; onHint: () => void }) {
  const { data } = useStore();
  const passed = activityPassed(activity, data);
  const attempts = data.activityAttempts.filter((a) => a.activityId === activity.id);
  const [showErrors, setShowErrors] = useState(false);
  return (
    <article className="panel space-y-4" aria-labelledby={`act-${activity.id}`}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary dark:text-primary-dark">{LEVEL[activity.level]} · ~{activity.estimatedMinutes} min</p>
          <h2 id={`act-${activity.id}`} className="mt-1 text-lg">{activity.title}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {activity.essential ? <Chip tone="info">Essencial</Chip> : <Chip>Opcional</Chip>}
          {passed && (
            <Chip tone="ok">
              <CheckCircle2 size={13} aria-hidden="true" /> {activity.kind === 'external' ? 'Registrado (autodeclarado)' : activity.kind === 'demo' ? 'Vista' : 'Concluída'}
            </Chip>
          )}
        </div>
      </header>
      <ol className="list-decimal space-y-1 pl-5 text-sm leading-6">
        {activity.instructions.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      {children}
      <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
        {activity.hints.length > 0 && (
          <button type="button" className="btn-ghost !px-3 !py-1.5" onClick={onHint} disabled={hintsUsed >= activity.hints.length}>
            <Lightbulb size={16} aria-hidden="true" /> {hintsUsed >= activity.hints.length ? 'Todas as dicas exibidas' : `Mostrar dica ${hintsUsed + 1} de ${activity.hints.length}`}
          </button>
        )}
        {activity.commonErrors.length > 0 && (
          <button type="button" className="btn-ghost !px-3 !py-1.5" aria-expanded={showErrors} onClick={() => setShowErrors((v) => !v)}>
            {showErrors ? 'Ocultar erros comuns' : 'Ver erros comuns'}
          </button>
        )}
      </div>
      {hintsUsed > 0 && (
        <ul className="space-y-2 text-sm" aria-live="polite">
          {activity.hints.slice(0, hintsUsed).map((h, i) => (
            <li key={i} className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/40">
              <b>Dica {i + 1}:</b> {h}
            </li>
          ))}
        </ul>
      )}
      {showErrors && (
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {activity.commonErrors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}
      {attempts.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold">Histórico de tentativas ({attempts.length})</summary>
          <ul className="mt-2 space-y-1">
            {attempts.slice(-10).reverse().map((a) => (
              <li key={a.id} className="muted">
                {new Date(a.at).toLocaleString('pt-BR')} — {a.score}/{a.max} {a.passed ? '✓ aprovada' : ''} {a.hintsUsed ? `· ${a.hintsUsed} dica(s)` : ''}
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}
