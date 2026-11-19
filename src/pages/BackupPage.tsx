import { useRef, useState } from 'react';
import { Download, Upload, Undo2 } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { BACKUP_NOTICE, exportBackup, parseBackup, summarize, type ParseResult } from '../services/backup';
import { KEYS } from '../services/storage';
import { sanitizeUserData } from '../services/schema';
import { localDate } from '../services/dates';
import { Card, PageTitle, Callout } from '../components/ui';

export default function BackupPage() {
  const { data, replaceAll, toast, kv } = useStore();
  const [parsed, setParsed] = useState<Extract<ParseResult, { ok: true }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const current = summarize(data, 'backup-v2');
  let preImport: string | null = null;
  try {
    preImport = kv.getItem(KEYS.preImport);
  } catch {
    preImport = null;
  }

  const doExport = () => {
    const blob = new Blob([exportBackup(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trilha-ia-backup-${localDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Backup exportado. Guarde-o em local protegido.', 'sucesso');
  };

  const onFile = async (f: File | undefined) => {
    setParsed(null);
    setError(null);
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError('O arquivo é maior que 5 MB e foi recusado.');
      return;
    }
    const r = parseBackup(await f.text());
    if (r.ok) setParsed(r);
    else setError(r.error);
    if (fileRef.current) fileRef.current.value = '';
  };

  const row = (label: string, a: number | string, b: number | string) => (
    <tr className="border-b border-slate-100 dark:border-slate-800"><td className="py-1 pr-3">{label}</td><td className="py-1 pr-3">{a}</td><td className="py-1">{b}</td></tr>
  );

  return (
    <>
      <PageTitle title="Backup" subtitle="Exporte seus dados para não perdê-los e restaure em outro navegador ou dispositivo." />
      <div className="mb-6"><Callout tone="seguranca" title="Antes de exportar">{BACKUP_NOTICE}</Callout></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card aria-labelledby="exp">
          <h2 id="exp" className="text-lg">Exportar</h2>
          <p className="muted mt-1 text-sm">Arquivo JSON com versão de esquema ({data.schemaVersion}). Contém apenas os seus dados pessoais de estudo, não o currículo.</p>
          <button className="btn-primary mt-4" onClick={doExport}><Download size={16} aria-hidden="true" /> Exportar backup JSON</button>
        </Card>
        <Card aria-labelledby="imp">
          <h2 id="imp" className="text-lg">Importar</h2>
          <p className="muted mt-1 text-sm">O arquivo é validado antes de qualquer alteração: formato, versão, tamanho (até 5 MB) e cada registro. Itens inválidos são descartados e informados. Também aceita dados exportados da versão 1.</p>
          <label className="btn-secondary mt-4 cursor-pointer">
            <Upload size={16} aria-hidden="true" /> Escolher arquivo
            <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-300"><b>Arquivo recusado:</b> {error}</p>}
        </Card>
      </div>

      {parsed && (
        <Card className="mt-6" aria-labelledby="prev">
          <h2 id="prev" className="text-lg">Confira o que será restaurado</h2>
          <p className="muted mt-1 text-sm">
            Origem: {parsed.summary.origin === 'dados-v1' ? 'dados da versão 1 (convertidos)' : 'backup da versão 2'}
            {parsed.summary.exportedAt && ` · exportado em ${new Date(parsed.summary.exportedAt).toLocaleString('pt-BR')}`}
          </p>
          <table className="mt-3 w-full max-w-lg text-left text-sm">
            <thead><tr className="border-b border-slate-200 dark:border-slate-800"><th scope="col" className="py-1">Registro</th><th scope="col">Atual</th><th scope="col">No arquivo</th></tr></thead>
            <tbody>
              {row('Respostas', current.answers, parsed.summary.answers)}
              {row('Verificações de lição', current.checks, parsed.summary.checks)}
              {row('Atividades', current.activities, parsed.summary.activities)}
              {row('Flashcards no baralho', current.flashcards, parsed.summary.flashcards)}
              {row('Dúvidas', current.doubts, parsed.summary.doubts)}
              {row('Anotações', current.notes, parsed.summary.notes)}
              {row('Projetos', current.projects, parsed.summary.projects)}
              {row('Simulados', current.exams, parsed.summary.exams)}
            </tbody>
          </table>
          {parsed.warnings.length > 0 && (
            <div className="mt-4"><Callout tone="atencao" title="Avisos da validação"><ul className="list-disc pl-5">{parsed.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul></Callout></div>
          )}
          <div className="mt-4"><Callout tone="atencao" title="Substituição completa">Importar SUBSTITUI todos os dados atuais deste navegador. Uma cópia dos dados atuais será guardada para você poder desfazer.</Callout></div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-primary" onClick={() => { replaceAll(parsed.data, { snapshot: true }); setParsed(null); toast('Backup restaurado.', 'sucesso'); }}>Substituir pelos dados do arquivo</button>
            <button className="btn-ghost" onClick={() => setParsed(null)}>Cancelar</button>
          </div>
        </Card>
      )}

      {preImport && (
        <Card className="mt-6" aria-labelledby="undo">
          <h2 id="undo" className="text-lg">Desfazer a última importação</h2>
          <p className="muted mt-1 text-sm">Existe uma cópia dos dados de antes da última importação.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="btn-secondary"
              onClick={() => {
                try {
                  const r = sanitizeUserData(JSON.parse(preImport!));
                  replaceAll(r.data);
                  kv.removeItem(KEYS.preImport);
                  toast('Dados anteriores restaurados.', 'sucesso');
                } catch {
                  toast('A cópia anterior está ilegível.', 'erro');
                }
              }}
            >
              <Undo2 size={16} aria-hidden="true" /> Restaurar dados anteriores
            </button>
            <button className="btn-ghost" onClick={() => { kv.removeItem(KEYS.preImport); toast('Cópia descartada.'); }}>Descartar cópia</button>
          </div>
        </Card>
      )}

      <Card className="mt-6" aria-labelledby="proc">
        <h2 id="proc" className="text-lg">Procedimento de recuperação</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          <li>Exporte um backup ao fim de cada semana de estudo (ou antes de limpar o navegador).</li>
          <li>Para trocar de computador: exporte aqui, abra a plataforma no outro navegador e importe o arquivo.</li>
          <li>Se o navegador apagar os dados do site, importe o backup mais recente. O que foi feito depois dele não pode ser recuperado.</li>
          <li>Se os dados salvos ficarem ilegíveis, a plataforma guarda uma cópia e reinicia; importe seu backup.</li>
        </ol>
        <p className="muted mt-3 text-xs">Limitações: não há cópia automática em nuvem; o arquivo não é criptografado; navegação anônima apaga tudo ao fechar.</p>
      </Card>
    </>
  );
}
