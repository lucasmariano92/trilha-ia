import { useState } from 'react';
import { glossary, references } from '../content';
import { formatDateBR } from '../services/dates';
import { Card, PageTitle, ContentBadge, ExternalLink, Chip } from '../components/ui';

export default function GlossaryPage() {
  const [q, setQ] = useState('');
  const terms = glossary.filter((g) => (g.term + g.definition + (g.english ?? '')).toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.term.localeCompare(b.term, 'pt-BR'));
  return (
    <>
      <PageTitle title="Glossário e referências" subtitle="Termos do glossário rápido do PDF e termos complementares do módulo 1.1, com a origem de cada definição." />
      <label className="mb-4 block max-w-sm text-sm"><span className="label">Buscar termo</span><input className="field" value={q} onChange={(e) => setQ(e.target.value)} /></label>
      <Card aria-labelledby="gl">
        <h2 id="gl" className="text-lg">Glossário ({terms.length})</h2>
        <dl className="mt-4 grid gap-4 md:grid-cols-2">
          {terms.map((t) => (
            <div key={t.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <dt className="flex flex-wrap items-center gap-2 font-semibold">
                {t.term} {t.english && <span className="muted text-xs font-normal" lang="en">({t.english})</span>}
              </dt>
              <dd className="mt-1 text-sm leading-6">{t.definition}</dd>
              <dd className="mt-2 flex flex-wrap gap-2"><ContentBadge status={t.status} /><Chip>Mundo {t.worlds.join(', ')}</Chip></dd>
            </div>
          ))}
        </dl>
      </Card>
      <Card className="mt-6" aria-labelledby="rf">
        <h2 id="rf" className="text-lg">Referências ({references.length})</h2>
        <p className="muted mt-1 text-sm">Cada referência tem organização responsável, endereço e data da última verificação. As marcadas como "não verificado" vieram da versão anterior e serão conferidas na etapa do mundo correspondente.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th scope="col" className="py-2 pr-3">Título</th>
                <th scope="col" className="py-2 pr-3">Organização</th>
                <th scope="col" className="py-2 pr-3">Origem</th>
                <th scope="col" className="py-2">Última verificação</th>
              </tr>
            </thead>
            <tbody>
              {references.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 align-top dark:border-slate-800">
                  <td className="py-2 pr-3"><ExternalLink href={r.url}>{r.title}</ExternalLink></td>
                  <td className="py-2 pr-3">{r.organization}</td>
                  <td className="py-2 pr-3">{r.citedInPdf ? 'Citada no PDF' : 'Complementar'}</td>
                  <td className="py-2">{r.lastVerified ? `${formatDateBR(r.lastVerified)} (busca)` : <Chip tone="aviso">Não verificado</Chip>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
