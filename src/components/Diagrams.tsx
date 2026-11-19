import type { DiagramId } from '../types/curriculum';
import { applyTemperature } from '../services/aiMath';

/**
 * Diagramas das lições em SVG acessível (role="img" + título e descrição).
 * Cores via currentColor/classes para funcionar nos modos claro e escuro.
 */
export function Diagram({ id, caption }: { id: DiagramId; caption: string }) {
  const Comp = { 'ai-hierarchy': Hierarchy, 'next-token-loop': NextTokenLoop, 'training-pipeline': Pipeline, 'model-vs-app': ModelVsApp, 'embedding-space': EmbeddingSpace, 'temperature-bars': TemperatureBars }[id];
  return (
    <figure className="my-2 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
      <Comp />
      <figcaption className="muted mt-3 text-sm">{caption}</figcaption>
    </figure>
  );
}

const T = 'fill-slate-800 dark:fill-slate-100';

function Hierarchy() {
  return (
    <svg viewBox="0 0 520 300" className="mx-auto w-full max-w-xl" role="img" aria-labelledby="dh-t dh-d">
      <title id="dh-t">Círculos concêntricos dos campos da IA</title>
      <desc id="dh-d">O círculo maior é Inteligência Artificial. Dentro dele, aprendizado de máquina. Dentro deste, aprendizado profundo. Dentro deste, IA generativa, que contém os LLMs.</desc>
      <ellipse cx="260" cy="150" rx="250" ry="142" className="fill-indigo-100 stroke-indigo-400 dark:fill-indigo-950 dark:stroke-indigo-500" strokeWidth="2" />
      <ellipse cx="275" cy="165" rx="195" ry="112" className="fill-sky-100 stroke-sky-400 dark:fill-sky-950 dark:stroke-sky-500" strokeWidth="2" />
      <ellipse cx="290" cy="180" rx="140" ry="82" className="fill-teal-100 stroke-teal-500 dark:fill-teal-950 dark:stroke-teal-500" strokeWidth="2" />
      <ellipse cx="305" cy="195" rx="88" ry="52" className="fill-violet-200 stroke-violet-500 dark:fill-violet-950 dark:stroke-violet-400" strokeWidth="2" />
      <text x="260" y="34" textAnchor="middle" className={T} fontSize="15" fontWeight="700">Inteligência Artificial</text>
      <text x="275" y="76" textAnchor="middle" className={T} fontSize="14" fontWeight="700">Aprendizado de máquina</text>
      <text x="290" y="120" textAnchor="middle" className={T} fontSize="14" fontWeight="700">Aprendizado profundo</text>
      <text x="305" y="186" textAnchor="middle" className={T} fontSize="14" fontWeight="700">IA generativa</text>
      <text x="305" y="208" textAnchor="middle" className={T} fontSize="12">(LLMs ficam aqui)</text>
      <text x="80" y="160" textAnchor="middle" className="fill-slate-600 dark:fill-slate-400" fontSize="11">regras fixas</text>
    </svg>
  );
}

function NextTokenLoop() {
  return (
    <svg viewBox="0 0 560 230" className="mx-auto w-full max-w-2xl" role="img" aria-labelledby="dn-t dn-d">
      <title id="dn-t">Ciclo de geração token a token</title>
      <desc id="dn-d">1. O texto atual entra no modelo. 2. O modelo calcula probabilidades para cada token possível. 3. Um token é escolhido. 4. O token é acrescentado ao texto e o ciclo recomeça.</desc>
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="fill-slate-500" />
        </marker>
      </defs>
      {[
        { x: 10, label: '1. Texto atual', sub: '"…pão com"' },
        { x: 150, label: '2. Modelo', sub: 'probabilidades' },
        { x: 290, label: '3. Escolha', sub: '"manteiga"' },
        { x: 430, label: '4. Acrescenta', sub: '"…pão com manteiga"' },
      ].map((b) => (
        <g key={b.x}>
          <rect x={b.x} y="40" width="120" height="70" rx="12" className="fill-white stroke-indigo-400 dark:fill-slate-900 dark:stroke-indigo-500" strokeWidth="2" />
          <text x={b.x + 60} y="70" textAnchor="middle" className={T} fontSize="13" fontWeight="700">{b.label}</text>
          <text x={b.x + 60} y="92" textAnchor="middle" className="fill-slate-600 dark:fill-slate-400" fontSize="11">{b.sub}</text>
        </g>
      ))}
      {[130, 270, 410].map((x) => (
        <line key={x} x1={x} y1="75" x2={x + 18} y2="75" className="stroke-slate-500" strokeWidth="2" markerEnd="url(#arr)" />
      ))}
      <path d="M490 112 C 490 190, 70 190, 70 114" fill="none" className="stroke-slate-500" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#arr)" />
      <text x="280" y="200" textAnchor="middle" className="fill-slate-600 dark:fill-slate-400" fontSize="12">repete até completar a resposta</text>
    </svg>
  );
}

function Pipeline() {
  const steps = [
    { t: 'Dados', s: 'textos coletados e filtrados' },
    { t: 'Pré-treinamento', s: 'prever o próximo token' },
    { t: 'Ajuste fino', s: 'exemplos de instrução' },
    { t: 'Alinhamento', s: 'feedback humano (RLHF)' },
    { t: 'Uso', s: 'inferência' },
  ];
  return (
    <svg viewBox="0 0 600 170" className="mx-auto w-full max-w-2xl" role="img" aria-labelledby="dp-t dp-d">
      <title id="dp-t">Fases de criação de um assistente</title>
      <desc id="dp-d">Dados, depois pré-treinamento que gera o modelo-base, depois ajuste fino supervisionado, depois alinhamento com feedback humano, e por fim o uso, chamado inferência.</desc>
      <defs>
        <marker id="arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" className="fill-slate-500" />
        </marker>
      </defs>
      {steps.map((st, i) => (
        <g key={st.t}>
          <rect x={8 + i * 120} y="30" width="104" height="84" rx="12" className={i === 4 ? 'fill-emerald-50 stroke-emerald-500 dark:fill-emerald-950' : 'fill-white stroke-indigo-400 dark:fill-slate-900 dark:stroke-indigo-500'} strokeWidth="2" />
          <text x={60 + i * 120} y="64" textAnchor="middle" className={T} fontSize="12.5" fontWeight="700">{st.t}</text>
          <foreignObject x={14 + i * 120} y="72" width="92" height="40">
            <p className="text-center text-[10.5px] leading-tight text-slate-600 dark:text-slate-400">{st.s}</p>
          </foreignObject>
          {i < 4 && <line x1={112 + i * 120} y1="72" x2={126 + i * 120} y2="72" className="stroke-slate-500" strokeWidth="2" markerEnd="url(#arr2)" />}
        </g>
      ))}
      <text x="128" y="140" textAnchor="middle" className="fill-slate-600 dark:fill-slate-400" fontSize="11">→ modelo-base</text>
      <text x="300" y="140" textAnchor="middle" className="fill-slate-600 dark:fill-slate-400" fontSize="11">treinamento: parâmetros mudam</text>
      <text x="548" y="140" textAnchor="middle" className="fill-slate-600 dark:fill-slate-400" fontSize="11">parâmetros fixos</text>
    </svg>
  );
}

function ModelVsApp() {
  return (
    <svg viewBox="0 0 560 250" className="mx-auto w-full max-w-2xl" role="img" aria-labelledby="dm-t dm-d">
      <title id="dm-t">Modelo dentro do aplicativo</title>
      <desc id="dm-d">O aplicativo monta o contexto com instruções, histórico, memórias salvas e resultados de busca e envia ao modelo, que devolve texto. O modelo não muda durante o uso.</desc>
      <rect x="10" y="10" width="540" height="230" rx="18" className="fill-sky-50 stroke-sky-400 dark:fill-sky-950/40 dark:stroke-sky-600" strokeWidth="2" />
      <text x="30" y="36" className={T} fontSize="14" fontWeight="700">Aplicativo (ex.: um chat de IA)</text>
      {['Instruções do sistema', 'Histórico da conversa', 'Memórias salvas (texto)', 'Resultados de busca'].map((t, i) => (
        <g key={t}>
          <rect x="30" y={52 + i * 44} width="190" height="34" rx="8" className="fill-white stroke-slate-300 dark:fill-slate-900 dark:stroke-slate-700" />
          <text x="125" y={74 + i * 44} textAnchor="middle" className={T} fontSize="12">{t}</text>
        </g>
      ))}
      <text x="250" y="132" className="fill-slate-600 dark:fill-slate-400" fontSize="11">contexto</text>
      <line x1="222" y1="140" x2="318" y2="140" className="stroke-slate-500" strokeWidth="2" />
      <rect x="320" y="90" width="210" height="100" rx="14" className="fill-violet-100 stroke-violet-500 dark:fill-violet-950 dark:stroke-violet-400" strokeWidth="2" />
      <text x="425" y="130" textAnchor="middle" className={T} fontSize="14" fontWeight="700">Modelo (LLM)</text>
      <text x="425" y="152" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300" fontSize="11">parâmetros fixos durante o uso</text>
      <text x="425" y="172" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300" fontSize="11">entra texto → sai texto</text>
    </svg>
  );
}

function EmbeddingSpace() {
  const groups = [
    { label: 'animais', color: 'fill-violet-500', pts: [['gato', 90, 70], ['cachorro', 120, 55], ['leão', 100, 100]] },
    { label: 'veículos', color: 'fill-sky-500', pts: [['carro', 380, 70], ['ônibus', 420, 100], ['bicicleta', 360, 110]] },
    { label: 'frutas', color: 'fill-emerald-500', pts: [['banana', 230, 210], ['maçã', 270, 230], ['uva', 250, 185]] },
  ] as const;
  return (
    <svg viewBox="0 0 520 270" className="mx-auto w-full max-w-xl" role="img" aria-labelledby="de-t de-d">
      <title id="de-t">Espaço de embeddings simplificado</title>
      <desc id="de-d">Palavras de animais agrupadas à esquerda, veículos à direita e frutas embaixo. Palavras de significado parecido ficam próximas.</desc>
      <rect x="2" y="2" width="516" height="266" rx="12" className="fill-white stroke-slate-300 dark:fill-slate-900 dark:stroke-slate-700" />
      {groups.map((g) => (
        <g key={g.label}>
          {g.pts.map(([w, x, y]) => (
            <g key={w}>
              <circle cx={x} cy={y} r="6" className={g.color} />
              <text x={x + 10} y={y + 4} fontSize="13" className={T}>{w}</text>
            </g>
          ))}
        </g>
      ))}
      <text x="60" y="140" fontSize="11" className="fill-slate-600 dark:fill-slate-400">grupo: animais</text>
      <text x="360" y="140" fontSize="11" className="fill-slate-600 dark:fill-slate-400">grupo: veículos</text>
      <text x="200" y="258" fontSize="11" className="fill-slate-600 dark:fill-slate-400">grupo: frutas</text>
    </svg>
  );
}

function TemperatureBars() {
  const toks = ['manteiga', 'queijo', 'café', 'ovo', 'requeijão'];
  const base = [0.46, 0.22, 0.12, 0.09, 0.07];
  const sets = [
    { t: 0.3, x: 10, label: 'Temperatura baixa (0,3)' },
    { t: 1.8, x: 275, label: 'Temperatura alta (1,8)' },
  ];
  return (
    <svg viewBox="0 0 540 230" className="mx-auto w-full max-w-2xl" role="img" aria-labelledby="dt-t dt-d">
      <title id="dt-t">Efeito da temperatura nas probabilidades</title>
      <desc id="dt-d">Com temperatura baixa, "manteiga" fica com quase toda a probabilidade. Com temperatura alta, as barras ficam mais parecidas entre si.</desc>
      {sets.map((s) => {
        const p = applyTemperature(base, s.t);
        return (
          <g key={s.t}>
            <text x={s.x + 125} y="20" textAnchor="middle" fontSize="13" fontWeight="700" className={T}>{s.label}</text>
            {toks.map((tk, i) => (
              <g key={tk}>
                <text x={s.x + 70} y={50 + i * 36} textAnchor="end" fontSize="12" className={T}>{tk}</text>
                <rect x={s.x + 78} y={38 + i * 36} width={Math.max(2, p[i] * 170)} height="18" rx="4" className="fill-indigo-500" />
                <text x={s.x + 84 + Math.max(2, p[i] * 170)} y={52 + i * 36} fontSize="11" className="fill-slate-600 dark:fill-slate-400">{Math.round(p[i] * 100)}%</text>
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
