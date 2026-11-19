import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { getLesson, getModule, modules } from '../content';
import { addDoubt, removeDoubt, updateDoubt } from '../services/actions';
import { sensitiveWarnings } from '../services/validate';
import { Card, PageTitle, EmptyState } from '../components/ui';
import { Link } from '../router';

export default function DoubtsPage() {
  const { data, update } = useStore();
  const [target, setTarget] = useState('1.1');
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'todas' | 'abertas' | 'resolvidas'>('abertas');
  const warn = sensitiveWarnings(text);
  const list = data.doubts
    .filter((d) => (filter === 'todas' ? true : filter === 'abertas' ? !d.resolved : d.resolved))
    .filter((d) => (d.text + d.answer).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const label = (id: string) => (getLesson(id) ? `Lição ${id}` : getModule(id) ? `Módulo ${id}` : id);
  const route = (id: string) => (getLesson(id) ? `/aula/${id}` : `/modulo/${id}`);

  return (
    <>
      <PageTitle title="Caderno de dúvidas" subtitle="Registre perguntas, responda quando descobrir e marque como resolvidas. Não inclua dados pessoais." />
      <Card aria-labelledby="nova">
        <h2 id="nova" className="text-lg">Nova dúvida</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-[220px_1fr]">
          <label className="text-sm">
            <span className="label">Sobre</span>
            <select className="field" value={target} onChange={(e) => setTarget(e.target.value)}>
              {modules.map((m) => <option key={m.id} value={m.id}>{m.id} · {m.title}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="label">Dúvida</span>
            <textarea className="field min-h-20" maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} />
          </label>
        </div>
        {warn.length > 0 && <p className="mt-1 text-xs text-red-700 dark:text-red-400" role="alert">Parece conter {warn.join(', ')}.</p>}
        <button className="btn-primary mt-3" disabled={!text.trim() || warn.length > 0} onClick={() => { update((d) => addDoubt(d, target, text)); setText(''); }}>Adicionar</button>
      </Card>
      <div className="my-5 flex flex-wrap gap-3">
        <label className="text-sm"><span className="label">Buscar</span><input className="field" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <label className="text-sm">
          <span className="label">Mostrar</span>
          <select className="field" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="abertas">Abertas</option><option value="resolvidas">Resolvidas</option><option value="todas">Todas</option>
          </select>
        </label>
      </div>
      {list.length === 0 ? (
        <EmptyState title="Nenhuma dúvida aqui." />
      ) : (
        <ul className="space-y-3">
          {list.map((d) => (
            <li key={d.id}>
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <Link to={route(d.targetId)} className="link">{label(d.targetId)}</Link>
                  <span className="muted">{new Date(d.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <label className="sr-only" htmlFor={`d-${d.id}`}>Texto da dúvida</label>
                <textarea id={`d-${d.id}`} className="field mt-2 min-h-16" maxLength={2000} defaultValue={d.text} onBlur={(e) => update((x) => updateDoubt(x, d.id, { text: e.target.value }))} />
                <label className="label mt-2" htmlFor={`a-${d.id}`}>Resposta que encontrei</label>
                <textarea id={`a-${d.id}`} className="field min-h-16" maxLength={2000} defaultValue={d.answer} onBlur={(e) => update((x) => updateDoubt(x, d.id, { answer: e.target.value }))} />
                <div className="mt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-indigo-600" checked={d.resolved} onChange={(e) => update((x) => updateDoubt(x, d.id, { resolved: e.target.checked }))} /> Resolvida</label>
                  <button className="btn-ghost !p-2" aria-label="Excluir dúvida" onClick={() => update((x) => removeDoubt(x, d.id))}><Trash2 size={16} aria-hidden="true" /></button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
