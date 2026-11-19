import { useCallback, useEffect, useState } from 'react';
import { RotateCcw, Shuffle, Zap } from 'lucide-react';
import type { DemoActivity, ExternalActivity } from '../../types/curriculum';
import { useStore } from '../../store/StoreContext';
import { markDemoViewed, removeExternalLog, saveExternalLog } from '../../services/actions';
import { sensitiveWarnings } from '../../services/validate';
import { ActivityShell } from './ActivityShell';
import { Callout } from '../ui';
import { ContextWindowWidget, CostWidget, EmbeddingWidget, TemperatureWidget } from './Widgets';

/* ---------- Atividade externa (autodeclarada) ---------- */

export function ExternalView({ activity }: { activity: ExternalActivity }) {
  const { data, update, toast } = useStore();
  const saved = data.externalLogs[activity.id];
  const [fields, setFields] = useState<Record<string, string>>(saved?.fields ?? {});
  const [hints, setHints] = useState(0);
  const missing = activity.fields.filter((f) => (fields[f.id] ?? '').trim().length < f.minLength);
  const warnings = sensitiveWarnings(Object.values(fields).join('\n'));

  return (
    <ActivityShell activity={activity} hintsUsed={hints} onHint={() => setHints((h) => h + 1)}>
      <Callout tone="atencao" title="Registro autodeclarado">
        Esta prática acontece em ferramentas externas. O site não consegue verificar se ela foi feita: o registro fica marcado como <b>autodeclarado</b>.
      </Callout>
      <div className="space-y-3">
        {activity.fields.map((f) => {
          const len = (fields[f.id] ?? '').trim().length;
          return (
            <div key={f.id}>
              <label className="label" htmlFor={`${activity.id}-${f.id}`}>
                {f.label}
              </label>
              <textarea
                id={`${activity.id}-${f.id}`}
                className="field min-h-20"
                placeholder={f.placeholder}
                maxLength={2000}
                value={fields[f.id] ?? ''}
                onChange={(e) => setFields((s) => ({ ...s, [f.id]: e.target.value }))}
                aria-describedby={`${activity.id}-${f.id}-h`}
              />
              <p id={`${activity.id}-${f.id}-h`} className={`mt-1 text-xs ${len >= f.minLength ? 'text-emerald-700 dark:text-emerald-400' : 'muted'}`}>
                {len}/{f.minLength} caracteres mínimos
              </p>
            </div>
          );
        })}
      </div>
      {warnings.length > 0 && (
        <Callout tone="seguranca" title="Possível dado sensível detectado">
          O texto parece conter: {warnings.join(', ')}. Remova antes de salvar. Este alerta é uma verificação simples e não garante a detecção de todos os casos.
        </Callout>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          disabled={missing.length > 0 || warnings.length > 0}
          onClick={() => {
            update((d) => saveExternalLog(d, activity.id, fields));
            toast('Prática registrada como autodeclarada.', 'sucesso');
          }}
        >
          {saved ? 'Atualizar registro' : 'Registrar prática'}
        </button>
        {saved && (
          <button type="button" className="btn-ghost" onClick={() => { update((d) => removeExternalLog(d, activity.id)); toast('Registro removido.'); }}>
            Remover registro
          </button>
        )}
      </div>
      {missing.length > 0 && <p className="muted text-xs">Preencha todos os campos com o mínimo indicado para registrar.</p>}
    </ActivityShell>
  );
}

/* ---------- Demonstração: simulador de próximo token ---------- */

type Cand = [string, number];
/** Probabilidades INVENTADAS para fins didáticos. */
export const TOY_TABLE: Record<string, Cand[]> = {
  START: [['manteiga', 0.46], ['queijo', 0.22], ['café', 0.12], ['ovo', 0.09], ['requeijão', 0.07], ['parafuso', 0.001]],
  manteiga: [['e', 0.41], ['.', 0.33], ['quente', 0.12], ['derretida', 0.09]],
  queijo: [['e', 0.38], ['.', 0.3], ['minas', 0.18], ['quente', 0.1]],
  café: [['.', 0.5], ['e', 0.3], ['preto', 0.15]],
  ovo: [['frito', 0.4], ['mexido', 0.3], ['.', 0.2], ['e', 0.08]],
  requeijão: [['e', 0.45], ['.', 0.4], ['cremoso', 0.12]],
  parafuso: [['.', 0.6], ['e', 0.3]],
  e: [['café', 0.52], ['suco', 0.21], ['leite', 0.14], ['fruta', 0.09]],
  suco: [['de', 0.5], ['.', 0.3], ['natural', 0.15]],
  de: [['laranja', 0.7], ['uva', 0.2]],
  leite: [['.', 0.6], ['quente', 0.2], ['e', 0.15]],
};
const FALLBACK: Cand[] = [['.', 0.7], ['e', 0.25]];
export const candidatesFor = (last: string | undefined): Cand[] => (last === undefined ? TOY_TABLE.START : TOY_TABLE[last] ?? FALLBACK);
export const greedy = (c: Cand[]) => c.reduce((b, x) => (x[1] > b[1] ? x : b))[0];

export function NextTokenWidget({ onProgress }: { onProgress?: (n: number) => void }) {
  const [tokens, setTokens] = useState<string[]>([]);
  const done = tokens[tokens.length - 1] === '.' || tokens.length >= 8;
  const cands = candidatesFor(tokens[tokens.length - 1]);
  const others = Math.max(0, 1 - cands.reduce((s, c) => s + c[1], 0));
  useEffect(() => {
    onProgress?.(tokens.length);
  }, [tokens.length, onProgress]);

  const add = (t: string) => !done && setTokens((x) => [...x, t]);
  const sample = () => {
    const total = cands.reduce((s, c) => s + c[1], 0);
    let r = Math.random() * total;
    for (const [t, p] of cands) {
      if ((r -= p) <= 0) return add(t);
    }
    add(cands[0][0]);
  };
  const sentence = `O café da manhã de hoje foi pão com${tokens.map((t) => (t === '.' ? '.' : ` ${t}`)).join('')}`;

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <p className="text-xs muted">Modelo de brinquedo com probabilidades inventadas. Um LLM real calcula valores para dezenas de milhares de tokens.</p>
      <p className="rounded-lg bg-slate-100 p-3 font-mono text-sm dark:bg-slate-950" aria-live="polite">
        {sentence}
        {!done && <span className="animate-pulse">▍</span>}
      </p>
      {!done ? (
        <>
          <p className="text-sm font-semibold">Candidatos para o próximo token:</p>
          <ul className="space-y-1.5">
            {cands.map(([t, p]) => (
              <li key={t}>
                <button type="button" className="group flex w-full items-center gap-3 rounded-lg p-1 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => add(t)} aria-label={`Escolher "${t}", probabilidade ${(p * 100).toFixed(1)}%`}>
                  <span className="w-24 shrink-0 font-mono">{t === '.' ? '"." (fim)' : `"${t}"`}</span>
                  <span className="h-3 flex-1 overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
                    <span className="block h-full rounded bg-primary dark:bg-primary-dark" style={{ width: `${Math.max(1, p * 100)}%` }} />
                  </span>
                  <span className="w-14 text-right tabular-nums">{p < 0.01 ? '<1%' : `${Math.round(p * 100)}%`}</span>
                </button>
              </li>
            ))}
            <li className="muted flex gap-3 p-1 text-sm">
              <span className="w-24">outros tokens</span>
              <span className="flex-1" />
              <span className="w-14 text-right">{Math.round(others * 100)}%</span>
            </li>
          </ul>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={() => add(greedy(cands))}>
              <Zap size={16} aria-hidden="true" /> Escolher o mais provável
            </button>
            <button type="button" className="btn-secondary" onClick={sample}>
              <Shuffle size={16} aria-hidden="true" /> Sortear pela probabilidade
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm">Frase concluída. Note que o simulador nunca verificou se o seu café da manhã foi mesmo esse: ele só seguiu probabilidades.</p>
      )}
      <button type="button" className="btn-ghost" onClick={() => setTokens([])}>
        <RotateCcw size={16} aria-hidden="true" /> Recomeçar
      </button>
    </div>
  );
}

export function DemoView({ activity }: { activity: DemoActivity }) {
  const { update } = useStore();
  const [hints, setHints] = useState(0);
  const onProgress = useCallback(
    (n: number) => {
      if (n >= 3) update((d) => markDemoViewed(d, activity.id));
    },
    [update, activity.id],
  );
  const markUsed = useCallback(() => update((d) => markDemoViewed(d, activity.id)), [update, activity.id]);
  return (
    <ActivityShell activity={activity} hintsUsed={hints} onHint={() => setHints((h) => h + 1)}>
      {activity.widget === 'next-token' && <NextTokenWidget onProgress={onProgress} />}
      {activity.widget === 'temperature' && <TemperatureWidget onUse={markUsed} />}
      {activity.widget === 'embedding' && <EmbeddingWidget onUse={markUsed} />}
      {activity.widget === 'context-window' && <ContextWindowWidget onUse={markUsed} />}
      {activity.widget === 'cost' && <CostWidget onUse={markUsed} />}
    </ActivityShell>
  );
}
