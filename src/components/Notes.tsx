import { useState } from 'react';
import { Flag, Plus } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { addDoubt, addReport, saveNote } from '../services/actions';
import { sensitiveWarnings } from '../services/validate';
import { Card } from './ui';
import { Link } from '../router';

export function DoubtBox({ targetId }: { targetId: string }) {
  const { data, update, toast } = useStore();
  const [text, setText] = useState('');
  const mine = data.doubts.filter((d) => d.targetId === targetId);
  const warn = sensitiveWarnings(text);
  return (
    <Card aria-labelledby={`dv-${targetId}`}>
      <h2 id={`dv-${targetId}`} className="text-lg">Registro de dúvidas</h2>
      <label htmlFor={`dt-${targetId}`} className="sr-only">Nova dúvida</label>
      <textarea id={`dt-${targetId}`} className="field mt-3 min-h-20" maxLength={2000} placeholder="Escreva uma dúvida sobre este conteúdo…" value={text} onChange={(e) => setText(e.target.value)} />
      {warn.length > 0 && <p className="mt-1 text-xs text-red-700 dark:text-red-400" role="alert">Parece conter {warn.join(', ')}. Não registre dados sensíveis.</p>}
      <button
        className="btn-secondary mt-2"
        disabled={!text.trim() || warn.length > 0}
        onClick={() => {
          update((d) => addDoubt(d, targetId, text));
          setText('');
          toast('Dúvida salva no caderno.', 'sucesso');
        }}
      >
        <Plus size={16} aria-hidden="true" /> Salvar dúvida
      </button>
      {mine.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm">
          {mine.map((d) => (
            <li key={d.id} className="rounded-lg bg-slate-50 p-2 dark:bg-slate-950">
              {d.resolved ? '✓ ' : '• '}
              {d.text}
            </li>
          ))}
        </ul>
      )}
      <Link to="/duvidas" className="link mt-3 inline-block text-sm">Abrir o caderno completo</Link>
    </Card>
  );
}

export function ReportBox({ targetId }: { targetId: string }) {
  const { update, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  return (
    <Card aria-labelledby={`rp-${targetId}`}>
      <h2 id={`rp-${targetId}`} className="text-lg">Encontrou um erro?</h2>
      <p className="muted mt-1 text-sm">Os relatos ficam salvos neste navegador e saem no backup, para você enviar a quem mantém o conteúdo. Nada é enviado automaticamente.</p>
      {!open ? (
        <button className="btn-ghost mt-2" onClick={() => setOpen(true)} aria-expanded={open}>
          <Flag size={16} aria-hidden="true" /> Reportar erro de conteúdo
        </button>
      ) : (
        <>
          <label htmlFor={`rt-${targetId}`} className="label mt-3">Descreva o erro</label>
          <textarea id={`rt-${targetId}`} className="field min-h-20" maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} />
          <div className="mt-2 flex gap-2">
            <button className="btn-primary" disabled={!text.trim()} onClick={() => { update((d) => addReport(d, targetId, text)); setText(''); setOpen(false); toast('Relato registrado localmente.', 'sucesso'); }}>
              Registrar
            </button>
            <button className="btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
          </div>
        </>
      )}
    </Card>
  );
}

export function NoteBox({ id, label = 'Minhas anotações' }: { id: string; label?: string }) {
  const { data, update } = useStore();
  const [text, setText] = useState(data.notes[id] ?? '');
  const warn = sensitiveWarnings(text);
  return (
    <Card aria-labelledby={`nt-${id}`}>
      <h2 id={`nt-${id}`} className="text-lg">{label}</h2>
      <p className="muted mt-1 text-sm">O PDF sugere registrar em 3–5 linhas o que você aprendeu. Salva automaticamente ao sair do campo.</p>
      <label htmlFor={`na-${id}`} className="sr-only">{label}</label>
      <textarea id={`na-${id}`} className="field mt-3 min-h-28" maxLength={20000} value={text} onChange={(e) => setText(e.target.value)} onBlur={() => update((d) => saveNote(d, id, text))} />
      {warn.length > 0 && <p className="mt-1 text-xs text-red-700 dark:text-red-400" role="alert">Parece conter {warn.join(', ')}.</p>}
    </Card>
  );
}
