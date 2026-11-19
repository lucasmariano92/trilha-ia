import { useState } from 'react';
import type { Project } from '../types/curriculum';
import { Copy } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { Link } from '../router';
import { getProject, projects } from '../content';
import { addProjectVersion, emptyProject, saveProject } from '../services/actions';
import { isGithubRepoUrl, isSafeHttpsUrl } from '../services/validate';
import { Card, PageTitle, Callout, Chip, ContentBadge, ExternalLink } from '../components/ui';
import { LivingGlossaryEditor } from '../components/LivingGlossaryEditor';
import { livingGlossaryStatus } from '../services/livingGlossary';

const README_TEMPLATE = (title: string) => `# ${title}

## O que este projeto faz
(Uma frase para alguém que não conhece o projeto.)

## Como funciona
(Etapas principais e ferramentas usadas. Um diagrama ajuda.)

## Como reproduzir
1. Pré-requisitos
2. Instalação
3. Como executar

## Decisões
(O que você escolheu e por quê.)

## Resultados e evidências
(Exemplos testados, prints sem dados pessoais, números de avaliação.)

## Limitações conhecidas
(O que não funciona ou não foi testado.)

## Segurança e privacidade
(Nenhuma chave no repositório; dados usados são fictícios ou públicos.)
`;

export default function ProjectsPage({ projectId }: { projectId?: string }) {
  const p = getProject(projectId ?? '') ?? projects[0];
  return <ProjectView key={p.id} p={p} />;
}

function ProjectView({ p }: { p: Project }) {
  const { data, update, toast } = useStore();
  const work = data.projects[p.id] ?? emptyProject();
  const [notes, setNotes] = useState(work.notes);
  const [reflection, setReflection] = useState(work.reflection);
  const [gh, setGh] = useState(work.githubUrl);
  const [demo, setDemo] = useState(work.demoUrl);
  const [vLabel, setVLabel] = useState('');
  const [vNote, setVNote] = useState('');
  const ghOk = !gh || isGithubRepoUrl(gh);
  const demoOk = !demo || isSafeHttpsUrl(demo);
  const auto: Record<string, boolean> = p.id === 'p1' ? livingGlossaryStatus(data).auto : {};
  const isChecked = (id: string) => (id in auto ? auto[id] : !!work.checklist[id]);
  const allChecked = p.checklist.every((c) => isChecked(c.id));

  return (
    <>
      <PageTitle title="Projetos e portfólio" subtitle="Um projeto por mundo, conforme o PDF. Cadastrar um link não aprova tecnicamente um projeto: a entrega fica autodeclarada." />
      <nav aria-label="Projetos" className="mb-6 flex flex-wrap gap-2">
        {projects.map((x) => (
          <Link key={x.id} to={`/projetos/${x.id}`} aria-current={x.id === p.id ? 'page' : undefined} className={x.id === p.id ? 'btn-primary' : 'btn-secondary'}>
            {x.worldId}. {x.title}
          </Link>
        ))}
      </nav>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <Card aria-labelledby="pj">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="pj" className="text-xl">{p.title}</h2>
              <div className="flex gap-2"><ContentBadge status={p.status} /><Chip>{{ 'nao-iniciado': 'Não iniciado', 'em-andamento': 'Em andamento', autodeclarado: 'Entregue (autodeclarado)' }[work.status]}</Chip></div>
            </div>
            <p className="mt-2"><b>Objetivo:</b> {p.objective}</p>
            <p className="mt-3 text-sm leading-6"><b>Descrição do PDF:</b> {p.pdfDescription}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
              <div><h3 className="font-semibold">Pré-requisitos</h3><ul className="list-disc pl-5">{p.prerequisites.map((x) => <li key={x}>{x}</li>)}</ul></div>
              <div><h3 className="font-semibold">Ferramentas</h3><ul className="list-disc pl-5">{p.tools.map((x) => <li key={x}>{x}</li>)}</ul></div>
              <div><h3 className="font-semibold">Etapas</h3><ol className="list-decimal pl-5">{p.steps.map((x) => <li key={x}>{x}</li>)}</ol></div>
              <div>
                <h3 className="font-semibold">Critérios de avaliação</h3><ul className="list-disc pl-5">{p.criteria.map((x) => <li key={x}>{x}</li>)}</ul>
                <h3 className="mt-3 font-semibold">Entregáveis</h3><ul className="list-disc pl-5">{p.deliverables.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            </div>
          </Card>

          {p.id === 'p1' && <LivingGlossaryEditor />}

          <Card aria-labelledby="ck">
            <h2 id="ck" className="text-lg">Checklist</h2>
            <ul className="mt-3 space-y-2">
              {p.checklist.map((c) => (
                <li key={c.id}>
                  <label className="flex items-start gap-2 text-sm">
                    <input type="checkbox" className="mt-1 accent-indigo-600" checked={isChecked(c.id)} disabled={c.id in auto} onChange={(e) => update((d) => saveProject(d, p.id, { checklist: { ...work.checklist, [c.id]: e.target.checked } }))} />
                    <span>{c.text}{c.id in auto && <span className="muted block text-xs">Verificado automaticamente pelo editor do Glossário vivo.</span>}</span>
                  </label>
                </li>
              ))}
            </ul>
          </Card>

          <Card aria-labelledby="nt">
            <h2 id="nt" className="text-lg">Anotações e reflexão final</h2>
            <label htmlFor="pnotes" className="label mt-3">Anotações de trabalho</label>
            <textarea id="pnotes" className="field min-h-28" maxLength={20000} value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => update((d) => saveProject(d, p.id, { notes }))} />
            <label htmlFor="prefl" className="label mt-3">Reflexão final: o que aprendeu, o que faria diferente, consegue explicar cada decisão?</label>
            <textarea id="prefl" className="field min-h-28" maxLength={20000} value={reflection} onChange={(e) => setReflection(e.target.value)} onBlur={() => update((d) => saveProject(d, p.id, { reflection }))} />
          </Card>

          <Card aria-labelledby="rd">
            <h2 id="rd" className="text-lg">Modelo de README</h2>
            <p className="muted mt-1 text-sm">Todo projeto deve ter um README que explique o que ele faz e como funciona.</p>
            <pre tabIndex={0} aria-label="Modelo de README" className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-950 p-4 text-xs text-emerald-200">{README_TEMPLATE(p.title)}</pre>
            <button className="btn-secondary mt-3" onClick={() => navigator.clipboard?.writeText(README_TEMPLATE(p.title)).then(() => toast('Modelo copiado.', 'sucesso'), () => toast('Não foi possível copiar.', 'erro'))}>
              <Copy size={16} aria-hidden="true" /> Copiar modelo
            </button>
          </Card>
        </div>

        <div className="space-y-6">
          <Card aria-labelledby="lk">
            <h2 id="lk" className="text-lg">Links</h2>
            <label htmlFor="gh" className="label mt-3">Repositório no GitHub</label>
            <input id="gh" className="field" placeholder="https://github.com/usuario/projeto" value={gh} onChange={(e) => setGh(e.target.value)} onBlur={() => ghOk && update((d) => saveProject(d, p.id, { githubUrl: gh }))} aria-invalid={!ghOk} aria-describedby="gh-h" />
            <p id="gh-h" className={`mt-1 text-xs ${ghOk ? 'muted' : 'text-red-700 dark:text-red-400'}`}>{ghOk ? 'Só endereços https://github.com/usuario/repositorio.' : 'Endereço inválido: use https://github.com/usuario/repositorio.'}</p>
            {work.githubUrl && isGithubRepoUrl(work.githubUrl) && <p className="mt-1 text-sm"><ExternalLink href={work.githubUrl}>Abrir repositório</ExternalLink></p>}
            <label htmlFor="demo" className="label mt-3">Demonstração (opcional)</label>
            <input id="demo" className="field" placeholder="https://…" value={demo} onChange={(e) => setDemo(e.target.value)} onBlur={() => demoOk && update((d) => saveProject(d, p.id, { demoUrl: demo }))} aria-invalid={!demoOk} />
            {!demoOk && <p className="mt-1 text-xs text-red-700 dark:text-red-400">Use um endereço https.</p>}
          </Card>

          <Card aria-labelledby="vs">
            <h2 id="vs" className="text-lg">Histórico de versões</h2>
            <label htmlFor="vl" className="label mt-3">Versão</label>
            <input id="vl" className="field" placeholder="ex.: v0.2 — diário de alucinações" value={vLabel} maxLength={300} onChange={(e) => setVLabel(e.target.value)} />
            <label htmlFor="vn" className="label mt-2">O que mudou</label>
            <textarea id="vn" className="field min-h-16" value={vNote} maxLength={2000} onChange={(e) => setVNote(e.target.value)} />
            <button className="btn-secondary mt-2" disabled={!vLabel.trim()} onClick={() => { update((d) => addProjectVersion(d, p.id, vLabel, vNote)); setVLabel(''); setVNote(''); }}>Adicionar versão</button>
            <ul className="mt-3 space-y-2 text-sm">
              {[...work.versions].reverse().map((v) => (
                <li key={v.id}><b>{v.label}</b> <span className="muted text-xs">{new Date(v.at).toLocaleDateString('pt-BR')}</span>{v.note && <p className="muted">{v.note}</p>}</li>
              ))}
            </ul>
          </Card>

          <Card aria-labelledby="en">
            <h2 id="en" className="text-lg">Entrega</h2>
            <Callout tone="atencao" title="Autodeclarado">
              O site não executa nem testa o seu projeto. Marcar como entregue registra uma autodeclaração, que conta para o checkpoint do mundo.
            </Callout>
            {work.status !== 'autodeclarado' ? (
              <button className="btn-primary mt-3 w-full" disabled={!allChecked} onClick={() => update((d) => saveProject(d, p.id, { status: 'autodeclarado' }))}>
                {allChecked ? 'Registrar entrega (autodeclarada)' : 'Marque todo o checklist para registrar'}
              </button>
            ) : (
              <button className="btn-ghost mt-3 w-full" onClick={() => update((d) => saveProject(d, p.id, { status: 'em-andamento' }))}>Reabrir projeto</button>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
