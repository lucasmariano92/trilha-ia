import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, XCircle } from 'lucide-react';
import type { ClassifyActivity, JudgeActivity, NumericActivity, OrderActivity } from '../../types/curriculum';
import { parseNumberBR } from '../../services/aiMath';
import { useStore } from '../../store/StoreContext';
import { recordActivity } from '../../services/actions';
import { seededShuffle } from '../../services/exam';
import { ActivityShell } from './ActivityShell';

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function ResultBox({ score, max, threshold }: { score: number; max: number; threshold: number }) {
  const ok = score / max >= threshold;
  return (
    <p role="status" className={`rounded-xl p-3 text-sm font-semibold ${ok ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'}`}>
      {score} de {max} corretos. {ok ? 'Atividade concluída.' : `Para concluir, é preciso ${Math.ceil(threshold * max)} de ${max}. Leia as explicações e refaça.`}
    </p>
  );
}

function Feedback({ ok, text }: { ok: boolean; text: string }) {
  return (
    <p className={`mt-2 flex items-start gap-2 text-sm ${ok ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}`}>
      {ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> : <XCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />}
      <span>
        <span className="sr-only">{ok ? 'Correto: ' : 'Incorreto: '}</span>
        {text}
      </span>
    </p>
  );
}

export function ClassifyView({ activity }: { activity: ClassifyActivity }) {
  const { update, toast } = useStore();
  const items = useMemo(() => seededShuffle(activity.items, hash(activity.id)), [activity]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [hints, setHints] = useState(0);
  const score = items.filter((i) => answers[i.id] === i.category).length;
  const complete = items.every((i) => answers[i.id]);

  const check = () => {
    setChecked(true);
    const wrong = items.filter((i) => answers[i.id] !== i.category).map((i) => i.id);
    update((d) => recordActivity(d, { activityId: activity.id, moduleId: activity.moduleId, score, max: items.length, passThreshold: activity.passThreshold, hintsUsed: hints, wrongItemIds: wrong }));
    if (score / items.length >= activity.passThreshold) toast('Atividade concluída e registrada.', 'sucesso');
  };

  return (
    <ActivityShell activity={activity} hintsUsed={hints} onHint={() => setHints((h) => h + 1)}>
      <ol className="space-y-4">
        {items.map((it, n) => (
          <li key={it.id}>
            <fieldset>
              <legend className="text-sm font-semibold leading-6">
                {n + 1}. {it.text}
              </legend>
              <div className="mt-2 grid gap-2 md:grid-cols-3">
                {activity.categories.map((c) => (
                  <label key={c.id} className={`option flex items-start gap-2 !p-2 ${answers[it.id] === c.id ? 'border-primary bg-primary-soft dark:border-primary-dark dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700'}`}>
                    <input type="radio" name={`${activity.id}-${it.id}`} className="mt-1 accent-indigo-600" checked={answers[it.id] === c.id} disabled={checked} onChange={() => setAnswers((a) => ({ ...a, [it.id]: c.id }))} />
                    <span className="text-xs leading-5">{c.label}</span>
                  </label>
                ))}
              </div>
              {checked && <Feedback ok={answers[it.id] === it.category} text={`${answers[it.id] === it.category ? '' : `Resposta esperada: ${activity.categories.find((c) => c.id === it.category)?.label}. `}${it.explanation}`} />}
            </fieldset>
          </li>
        ))}
      </ol>
      {checked && <ResultBox score={score} max={items.length} threshold={activity.passThreshold} />}
      <div className="flex gap-2">
        {!checked ? (
          <button type="button" className="btn-primary" disabled={!complete} onClick={check}>
            Corrigir {!complete && `(${Object.keys(answers).length}/${items.length} respondidos)`}
          </button>
        ) : (
          <button type="button" className="btn-secondary" onClick={() => { setAnswers({}); setChecked(false); }}>
            Refazer
          </button>
        )}
      </div>
    </ActivityShell>
  );
}

export function JudgeView({ activity }: { activity: JudgeActivity }) {
  const { update, toast } = useStore();
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState(false);
  const [hints, setHints] = useState(0);
  const list = activity.statements;
  const score = list.filter((s) => answers[s.id] === s.correct).length;
  const complete = list.every((s) => answers[s.id] !== undefined);

  const check = () => {
    setChecked(true);
    const wrong = list.filter((s) => answers[s.id] !== s.correct).map((s) => s.id);
    update((d) => recordActivity(d, { activityId: activity.id, moduleId: activity.moduleId, score, max: list.length, passThreshold: activity.passThreshold, hintsUsed: hints, wrongItemIds: wrong }));
    if (score / list.length >= activity.passThreshold) toast('Atividade concluída e registrada.', 'sucesso');
  };
  return (
    <ActivityShell activity={activity} hintsUsed={hints} onHint={() => setHints((h) => h + 1)}>
      <ol className="space-y-3">
        {list.map((s, n) => (
          <li key={s.id}>
            <fieldset>
              <legend className="text-sm font-semibold leading-6">
                {n + 1}. {s.text}
              </legend>
              <div className="mt-2 flex gap-2">
                {[true, false].map((v) => (
                  <label key={String(v)} className={`option flex w-auto items-center gap-2 !px-3 !py-1.5 ${answers[s.id] === v ? 'border-primary bg-primary-soft dark:border-primary-dark dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700'}`}>
                    <input type="radio" name={`${activity.id}-${s.id}`} className="accent-indigo-600" checked={answers[s.id] === v} disabled={checked} onChange={() => setAnswers((a) => ({ ...a, [s.id]: v }))} />
                    {v ? 'Verdadeiro' : 'Falso'}
                  </label>
                ))}
              </div>
              {checked && <Feedback ok={answers[s.id] === s.correct} text={`${s.correct ? 'Verdadeiro' : 'Falso'}. ${s.explanation}`} />}
            </fieldset>
          </li>
        ))}
      </ol>
      {checked && <ResultBox score={score} max={list.length} threshold={activity.passThreshold} />}
      {!checked ? (
        <button type="button" className="btn-primary" disabled={!complete} onClick={check}>
          Corrigir
        </button>
      ) : (
        <button type="button" className="btn-secondary" onClick={() => { setAnswers({}); setChecked(false); }}>
          Refazer
        </button>
      )}
    </ActivityShell>
  );
}

/** Embaralha garantindo que a ordem inicial não seja a correta. */
export function initialOrder(ids: string[], seed: number): string[] {
  let out = seededShuffle(ids, seed);
  let s = seed;
  while (ids.length > 1 && out.every((id, i) => id === ids[i])) out = seededShuffle(ids, ++s);
  return out;
}

export function OrderView({ activity }: { activity: OrderActivity }) {
  const { update, toast } = useStore();
  const correctIds = activity.steps.map((s) => s.id);
  const [order, setOrder] = useState(() => initialOrder(correctIds, hash(activity.id)));
  const [checked, setChecked] = useState(false);
  const [hints, setHints] = useState(0);
  const byId = Object.fromEntries(activity.steps.map((s) => [s.id, s]));
  const score = order.filter((id, i) => correctIds[i] === id).length;

  const move = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  };
  const check = () => {
    setChecked(true);
    const wrong = order.filter((id, i) => correctIds[i] !== id);
    update((d) => recordActivity(d, { activityId: activity.id, moduleId: activity.moduleId, score, max: order.length, passThreshold: activity.passThreshold, hintsUsed: hints, wrongItemIds: wrong }));
    if (score / order.length >= activity.passThreshold) toast('Atividade concluída e registrada.', 'sucesso');
  };
  return (
    <ActivityShell activity={activity} hintsUsed={hints} onHint={() => setHints((h) => h + 1)}>
      <ol className="space-y-2" aria-label="Passos na ordem atual">
        {order.map((id, i) => {
          const ok = correctIds[i] === id;
          return (
            <li key={id} className={`rounded-xl border-2 p-3 text-sm ${checked ? (ok ? 'border-emerald-500' : 'border-red-400') : 'border-slate-200 dark:border-slate-700'}`}>
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-bold">{i + 1}</span>
                <span className="flex-1">{byId[id].text}</span>
                {!checked && (
                  <span className="flex gap-1">
                    <button type="button" className="btn-ghost !p-1.5" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir: ${byId[id].text}`}>
                      <ArrowUp size={16} aria-hidden="true" />
                    </button>
                    <button type="button" className="btn-ghost !p-1.5" onClick={() => move(i, 1)} disabled={i === order.length - 1} aria-label={`Descer: ${byId[id].text}`}>
                      <ArrowDown size={16} aria-hidden="true" />
                    </button>
                  </span>
                )}
              </div>
              {checked && <Feedback ok={ok} text={ok ? byId[id].explanation : `Posição correta: ${correctIds.indexOf(id) + 1}. ${byId[id].explanation}`} />}
            </li>
          );
        })}
      </ol>
      {checked && <ResultBox score={score} max={order.length} threshold={activity.passThreshold} />}
      {!checked ? (
        <button type="button" className="btn-primary" onClick={check}>
          Corrigir
        </button>
      ) : (
        <button type="button" className="btn-secondary" onClick={() => { setOrder(initialOrder(correctIds, hash(activity.id) + Date.now())); setChecked(false); }}>
          Refazer
        </button>
      )}
    </ActivityShell>
  );
}

export function NumericView({ activity }: { activity: NumericActivity }) {
  const { update, toast } = useStore();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [hints, setHints] = useState(0);
  const list = activity.problems;
  const ok = (id: string) => {
    const p = list.find((x) => x.id === id)!;
    const v = parseNumberBR(answers[id] ?? '');
    return v !== null && Math.abs(v - p.answer) <= p.tolerance;
  };
  const score = list.filter((p) => ok(p.id)).length;
  const complete = list.every((p) => parseNumberBR(answers[p.id] ?? '') !== null);
  const fmt = (x: number) => x.toLocaleString('pt-BR', { maximumFractionDigits: 6 });
  const check = () => {
    setChecked(true);
    const wrong = list.filter((p) => !ok(p.id)).map((p) => p.id);
    update((d) => recordActivity(d, { activityId: activity.id, moduleId: activity.moduleId, score, max: list.length, passThreshold: activity.passThreshold, hintsUsed: hints, wrongItemIds: wrong }));
    if (score / list.length >= activity.passThreshold) toast('Atividade concluída e registrada.', 'sucesso');
  };
  return (
    <ActivityShell activity={activity} hintsUsed={hints} onHint={() => setHints((h) => h + 1)}>
      <ol className="space-y-4">
        {list.map((p, n) => (
          <li key={p.id}>
            <label htmlFor={`${activity.id}-${p.id}`} className="block text-sm font-semibold leading-6">{n + 1}. {p.prompt}</label>
            <div className="mt-2 flex items-center gap-2">
              <input id={`${activity.id}-${p.id}`} inputMode="decimal" className="field max-w-[12rem]" value={answers[p.id] ?? ''} disabled={checked} onChange={(e) => setAnswers((a) => ({ ...a, [p.id]: e.target.value }))} />
              {p.unit && <span className="muted text-sm">{p.unit}</span>}
            </div>
            {checked && <Feedback ok={ok(p.id)} text={`Resposta esperada: ${fmt(p.answer)}${p.unit ? ` ${p.unit}` : ''}${p.tolerance ? ` (aceito ± ${fmt(p.tolerance)})` : ''}. ${p.explanation}`} />}
          </li>
        ))}
      </ol>
      <p className="muted text-xs">Use vírgula ou ponto para decimais.</p>
      {checked && <ResultBox score={score} max={list.length} threshold={activity.passThreshold} />}
      {!checked ? (
        <button type="button" className="btn-primary" disabled={!complete} onClick={check}>Corrigir</button>
      ) : (
        <button type="button" className="btn-secondary" onClick={() => { setAnswers({}); setChecked(false); }}>Refazer</button>
      )}
    </ActivityShell>
  );
}
