import { useState } from 'react';
import { Download, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { modulesOfWorld } from '../content';
import { addDiaryEntry, removeDiaryEntry, saveConcept } from '../services/actions';
import { LG_MIN, livingGlossaryMarkdown, livingGlossaryStatus } from '../services/livingGlossary';
import { sensitiveWarnings } from '../services/validate';
import { localDate } from '../services/dates';
import { Card, Callout } from './ui';

const TITLES: Record<string, string> = {
  '1.1': 'Modelo de linguagem (LLM)', '1.2': 'Token', '1.3': 'Janela de contexto', '1.4': 'Alucinação', '1.5': 'Embedding',
  '1.6': 'Temperatura e parâmetros', '1.7': 'Tipos de modelo', '1.8': 'Limites, riscos e privacidade', '1.9': 'Custo e infraestrutura',
};

function ConceptRow({ id }: { id: string }) {
  const { data, update } = useStore();
  const c = data.livingGlossary.concepts[id];
  const [exp, setExp] = useState(c?.explanation ?? '');
  const [ex, setEx] = useState(c?.example ?? '');
  const ok = exp.trim().length >= LG_MIN.explanation && ex.trim().length >= LG_MIN.example;
  const warn = sensitiveWarnings(exp + '\n' + ex);
  return (
    <li className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
      <p className="flex items-center gap-2 font-semibold">
        {ok ? <CheckCircle2 size={18} className="text-emerald-600" aria-hidden="true" /> : <Circle size={18} className="text-slate-400" aria-hidden="true" />}
        {id} · {TITLES[id]}
        <span className="sr-only">{ok ? '(completo)' : '(incompleto)'}</span>
      </p>
      <label htmlFor={`lg-e-${id}`} className="label mt-2">Explicação com minhas palavras <span className="muted font-normal">({exp.trim().length}/{LG_MIN.explanation})</span></label>
      <textarea id={`lg-e-${id}`} className="field min-h-20" maxLength={2000} value={exp} onChange={(e) => setExp(e.target.value)} onBlur={() => update((d) => saveConcept(d, id, { explanation: exp }))} />
      <label htmlFor={`lg-x-${id}`} className="label mt-2">Exemplo real que eu testei (ferramenta, o que fiz, o que observei) <span className="muted font-normal">({ex.trim().length}/{LG_MIN.example})</span></label>
      <textarea id={`lg-x-${id}`} className="field min-h-16" maxLength={2000} value={ex} onChange={(e) => setEx(e.target.value)} onBlur={() => update((d) => saveConcept(d, id, { example: ex }))} />
      {warn.length > 0 && <p role="alert" className="mt-1 text-xs text-red-700 dark:text-red-400">Parece conter {warn.join(', ')}. Remova antes de continuar.</p>}
    </li>
  );
}

const EMPTY = { tool: '', claim: '', howFound: '', correct: '', source: '' };

export function LivingGlossaryEditor() {
  const { data, update, toast } = useStore();
  const st = livingGlossaryStatus(data);
  const [entry, setEntry] = useState(EMPTY);
  const canAdd = entry.claim.trim() && entry.howFound.trim() && entry.correct.trim() && entry.source.trim();
  const warn = sensitiveWarnings(Object.values(entry).join('\n'));

  const download = () => {
    const blob = new Blob([livingGlossaryMarkdown(data, TITLES)], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glossario-vivo-${localDate()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Glossário exportado em Markdown.', 'sucesso');
  };

  const fields: [keyof typeof EMPTY, string, string][] = [
    ['tool', 'Ferramenta usada', 'Ex.: chat gratuito X'],
    ['claim', 'O que a IA afirmou', 'Copie ou resuma a afirmação errada'],
    ['howFound', 'Como descobri o erro', 'Ex.: procurei no catálogo da biblioteca'],
    ['correct', 'Informação correta', 'O que a fonte diz'],
    ['source', 'Fonte da verificação', 'Nome e endereço da fonte primária'],
  ];

  return (
    <Card aria-labelledby="lg-ed">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="lg-ed" className="text-lg">Editor do Glossário vivo</h2>
          <p className="muted mt-1 text-sm">
            {st.explained}/{st.total} explicações · {st.exemplified}/{st.total} exemplos · {st.diary}/{LG_MIN.diary} casos no diário. Os três primeiros itens do checklist são verificados automaticamente a partir daqui.
          </p>
        </div>
        <button className="btn-secondary" onClick={download}><Download size={16} aria-hidden="true" /> Exportar Markdown</button>
      </div>
      <Callout tone="info" title="Escreva com suas palavras">
        O PDF pede os 9 conceitos explicados com suas palavras, cada um com um exemplo que você testou. A plataforma confere apenas o tamanho mínimo dos textos; a qualidade é sua responsabilidade e pode ser avaliada por outra pessoa com os critérios do projeto.
      </Callout>
      <h3 className="mt-5 font-semibold">Conceitos do Mundo 1</h3>
      <ul className="mt-3 space-y-3">
        {modulesOfWorld(1).map((m) => <ConceptRow key={m.id} id={m.id} />)}
      </ul>

      <h3 className="mt-6 font-semibold">Diário de alucinações</h3>
      {data.livingGlossary.diary.length > 0 && (
        <ol className="mt-3 space-y-2">
          {data.livingGlossary.diary.map((e, i) => (
            <li key={e.id} className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">Caso {i + 1}{e.tool && ` — ${e.tool}`}</p>
                <button className="btn-ghost !p-1.5" aria-label={`Excluir caso ${i + 1}`} onClick={() => update((d) => removeDiaryEntry(d, e.id))}><Trash2 size={15} aria-hidden="true" /></button>
              </div>
              <p><b>Afirmou:</b> {e.claim}</p>
              <p><b>Como descobri:</b> {e.howFound}</p>
              <p><b>Correto:</b> {e.correct}</p>
              <p><b>Fonte:</b> {e.source}</p>
            </li>
          ))}
        </ol>
      )}
      <fieldset className="mt-4 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
        <legend className="px-1 text-sm font-semibold">Novo caso</legend>
        <div className="grid gap-3 md:grid-cols-2">
          {fields.map(([k, label, ph]) => (
            <label key={k} className="text-sm">
              <span className="label">{label}</span>
              <textarea className="field min-h-14" maxLength={2000} placeholder={ph} value={entry[k]} onChange={(e) => setEntry((s) => ({ ...s, [k]: e.target.value }))} />
            </label>
          ))}
        </div>
        {warn.length > 0 && <p role="alert" className="mt-1 text-xs text-red-700 dark:text-red-400">Parece conter {warn.join(', ')}.</p>}
        <button className="btn-primary mt-3" disabled={!canAdd || warn.length > 0} onClick={() => { update((d) => addDiaryEntry(d, entry)); setEntry(EMPTY); toast('Caso adicionado ao diário.', 'sucesso'); }}>
          <Plus size={16} aria-hidden="true" /> Adicionar ao diário
        </button>
      </fieldset>
    </Card>
  );
}
