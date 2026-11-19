import { useMemo, useState } from 'react';
import { RotateCcw, Shuffle } from 'lucide-react';
import { applyTemperature, callCost, cosine, fitContext, parseNumberBR } from '../../services/aiMath';
import { TOY_TABLE } from './OtherActivities';

const toy = <p className="muted text-xs">Demonstração com valores inventados para fins didáticos.</p>;

/* ---------- Temperatura ---------- */

export function TemperatureWidget({ onUse }: { onUse?: () => void }) {
  const base = TOY_TABLE.START;
  const [t, setT] = useState(1);
  const [samples, setSamples] = useState<string[]>([]);
  const probs = useMemo(() => applyTemperature(base.map((c) => c[1]), t), [t, base]);
  const sample = () => {
    const out: string[] = [];
    for (let k = 0; k < 5; k++) {
      let r = Math.random();
      let pick = base[0][0];
      for (let i = 0; i < probs.length; i++) {
        if ((r -= probs[i]) <= 0) { pick = base[i][0]; break; }
      }
      out.push(pick);
    }
    setSamples(out);
    onUse?.();
  };
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      {toy}
      <p className="text-sm">Frase: <span className="font-mono">"O café da manhã de hoje foi pão com ___"</span></p>
      <label htmlFor="temp" className="label">Temperatura: <span className="tabular-nums">{t.toFixed(1)}</span></label>
      <input id="temp" type="range" min={0} max={2} step={0.1} value={t} onChange={(e) => { setT(Number(e.target.value)); setSamples([]); }} className="w-full accent-indigo-600" aria-valuetext={`Temperatura ${t.toFixed(1)}`} />
      <ul className="space-y-1.5">
        {base.map(([tok], i) => (
          <li key={tok} className="flex items-center gap-3 text-sm">
            <span className="w-24 shrink-0 font-mono">"{tok}"</span>
            <span className="h-3 flex-1 overflow-hidden rounded bg-slate-200 dark:bg-slate-800"><span className="block h-full rounded bg-primary dark:bg-primary-dark" style={{ width: `${Math.max(0.5, probs[i] * 100)}%` }} /></span>
            <span className="w-14 text-right tabular-nums">{probs[i] < 0.01 ? '<1%' : `${Math.round(probs[i] * 100)}%`}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="btn-secondary" onClick={sample}><Shuffle size={16} aria-hidden="true" /> Gerar 5 continuações</button>
      {samples.length > 0 && (
        <p className="rounded-lg bg-slate-100 p-3 font-mono text-sm dark:bg-slate-950" aria-live="polite">{samples.join(' · ')}</p>
      )}
      <p className="muted text-xs">Temperatura 0: sempre o mais provável. Temperatura alta: a distribuição fica mais "achatada" e opções raras (até "parafuso") aparecem.</p>
    </div>
  );
}

/* ---------- Embeddings ---------- */

export const TOY_VECTORS: Record<string, [number, number]> = {
  gato: [0.9, 0.8], cachorro: [0.85, 0.9], leão: [0.95, 0.55],
  carro: [-0.8, 0.7], ônibus: [-0.9, 0.55], bicicleta: [-0.6, 0.85],
  banana: [0.15, -0.9], maçã: [0.3, -0.85],
};

export function EmbeddingWidget({ onUse }: { onUse?: () => void }) {
  const words = Object.keys(TOY_VECTORS);
  const [a, setA] = useState('gato');
  const [b, setB] = useState('cachorro');
  const sim = cosine(TOY_VECTORS[a], TOY_VECTORS[b]);
  const nearest = words.filter((w) => w !== a).sort((x, y) => cosine(TOY_VECTORS[a], TOY_VECTORS[y]) - cosine(TOY_VECTORS[a], TOY_VECTORS[x]))[0];
  const P = (v: [number, number]) => [150 + v[0] * 120, 150 - v[1] * 120];
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <p className="muted text-xs">Vetores de 2 dimensões inventados para caber no desenho. Embeddings reais têm centenas ou milhares de dimensões.</p>
      <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-xs" role="img" aria-label={`Mapa de palavras. ${a} e ${b} têm similaridade ${sim.toFixed(2)}.`}>
        <line x1="150" y1="10" x2="150" y2="290" className="stroke-slate-300 dark:stroke-slate-700" />
        <line x1="10" y1="150" x2="290" y2="150" className="stroke-slate-300 dark:stroke-slate-700" />
        {[a, b].map((w) => <line key={w} x1="150" y1="150" x2={P(TOY_VECTORS[w])[0]} y2={P(TOY_VECTORS[w])[1]} className="stroke-indigo-500" strokeWidth="2" />)}
        {words.map((w) => {
          const [x, y] = P(TOY_VECTORS[w]);
          const on = w === a || w === b;
          return (
            <g key={w}>
              <circle cx={x} cy={y} r={on ? 6 : 4} className={on ? 'fill-indigo-600' : 'fill-slate-400'} />
              <text x={x + 8} y={y + 4} fontSize="12" className="fill-slate-800 dark:fill-slate-100">{w}</text>
            </g>
          );
        })}
      </svg>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm"><span className="label">Palavra A</span><select className="field" value={a} onChange={(e) => { setA(e.target.value); onUse?.(); }}>{words.map((w) => <option key={w}>{w}</option>)}</select></label>
        <label className="text-sm"><span className="label">Palavra B</span><select className="field" value={b} onChange={(e) => { setB(e.target.value); onUse?.(); }}>{words.map((w) => <option key={w}>{w}</option>)}</select></label>
      </div>
      <p className="text-sm" aria-live="polite">Similaridade de cosseno entre "{a}" e "{b}": <b className="tabular-nums">{sim.toFixed(2)}</b>. Vizinho mais próximo de "{a}": <b>{nearest}</b>.</p>
    </div>
  );
}

/* ---------- Janela de contexto ---------- */

const CONVO = [
  { id: 'sys', label: 'Instruções do sistema', tokens: 300, pinned: true },
  { id: 'm1', label: 'Você: "Meu cliente se chama Ana e é alérgica a amendoim."', tokens: 250 },
  { id: 'm2', label: 'IA: resposta sobre o pedido', tokens: 600 },
  { id: 'm3', label: 'Você: cola um cardápio longo', tokens: 1500 },
  { id: 'm4', label: 'IA: resumo do cardápio', tokens: 700 },
  { id: 'm5', label: 'Você: pede sugestões de sobremesa', tokens: 200 },
  { id: 'm6', label: 'IA: lista de sobremesas', tokens: 650 },
  { id: 'm7', label: 'Você: "Alguma delas é perigosa para a cliente?"', tokens: 150 },
];

export function ContextWindowWidget({ onUse }: { onUse?: () => void }) {
  const [win, setWin] = useState(4000);
  const reserved = 500;
  const fit = fitContext(CONVO, win, reserved);
  const lost = fit.dropped.includes('m1');
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      {toy}
      <label htmlFor="win" className="label">Tamanho da janela: <span className="tabular-nums">{win.toLocaleString('pt-BR')}</span> tokens (500 reservados para a resposta)</label>
      <input id="win" type="range" min={1500} max={5500} step={250} value={win} onChange={(e) => { setWin(Number(e.target.value)); onUse?.(); }} className="w-full accent-indigo-600" />
      <ol className="space-y-1.5 text-sm">
        {CONVO.map((m) => {
          const kept = fit.kept.includes(m.id);
          return (
            <li key={m.id} className={`flex items-center justify-between gap-3 rounded-lg border p-2 ${kept ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' : 'border-slate-200 bg-slate-100 text-slate-700 line-through dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'}`}>
              <span>{m.label}{m.pinned ? ' (fixa)' : ''}</span>
              <span className="shrink-0 tabular-nums text-xs">{m.tokens} tk <span className="sr-only">{kept ? 'dentro da janela' : 'fora da janela'}</span></span>
            </li>
          );
        })}
      </ol>
      <p className="text-sm" aria-live="polite">
        Usados {fit.used.toLocaleString('pt-BR')} de {(win - reserved).toLocaleString('pt-BR')} tokens disponíveis para o contexto.{' '}
        {lost ? <b className="text-red-700 dark:text-red-400">A alergia da cliente saiu da janela: o modelo não tem como saber dela ao responder a última pergunta.</b> : <b className="text-emerald-700 dark:text-emerald-400">A informação da alergia ainda está na janela.</b>}
      </p>
    </div>
  );
}

/* ---------- Custo ---------- */

export function CostWidget({ onUse }: { onUse?: () => void }) {
  const [v, setV] = useState({ inTok: '1500', outTok: '500', pIn: '0,50', pOut: '2,00', perDay: '200' });
  const n = (k: keyof typeof v) => parseNumberBR(v[k]) ?? 0;
  const one = callCost(n('inTok'), n('outTok'), n('pIn'), n('pOut'));
  const fields: [keyof typeof v, string][] = [['inTok', 'Tokens de entrada por pergunta'], ['outTok', 'Tokens de saída por resposta'], ['pIn', 'Preço de entrada (US$ por milhão)'], ['pOut', 'Preço de saída (US$ por milhão)'], ['perDay', 'Perguntas por dia']];
  const fmt = (x: number) => x.toLocaleString('pt-BR', { style: 'currency', currency: 'USD', maximumFractionDigits: x < 1 ? 4 : 2 });
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <p className="muted text-xs">Preços padrão FICTÍCIOS. Para valores reais, consulte a página oficial de preços do fornecedor na data do cálculo.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(([k, label]) => (
          <label key={k} className="text-sm"><span className="label">{label}</span>
            <input className="field" inputMode="decimal" value={v[k]} onChange={(e) => { setV((s) => ({ ...s, [k]: e.target.value })); onUse?.(); }} />
          </label>
        ))}
      </div>
      <dl className="grid gap-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950 sm:grid-cols-3" aria-live="polite">
        <div><dt className="muted">Por pergunta</dt><dd className="font-bold tabular-nums">{fmt(one)}</dd></div>
        <div><dt className="muted">Por 1.000 perguntas</dt><dd className="font-bold tabular-nums">{fmt(one * 1000)}</dd></div>
        <div><dt className="muted">Por mês (30 dias)</dt><dd className="font-bold tabular-nums">{fmt(one * n('perDay') * 30)}</dd></div>
      </dl>
      <p className="muted text-xs">Fórmula: (tokens de entrada × preço de entrada + tokens de saída × preço de saída) ÷ 1.000.000.</p>
      <button type="button" className="btn-ghost" onClick={() => setV({ inTok: '1500', outTok: '500', pIn: '0,50', pOut: '2,00', perDay: '200' })}><RotateCcw size={16} aria-hidden="true" /> Valores padrão</button>
    </div>
  );
}
