import { ChevronRight, Lock } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { Link } from '../router';
import { getProject, getReference, getWorld, modulesOfWorld, worlds } from '../content';
import { evaluateModule } from '../services/mastery';
import { evaluateCheckpoint, isWorldUnlocked } from '../services/progress';
import { setCheckpointItem } from '../services/actions';
import { formatMinutes } from '../services/dates';
import { Card, PageTitle, ModuleStatusBadge, Chip, Callout, ExternalLink } from '../components/ui';
import { CheckpointQuiz } from '../components/CheckpointQuiz';

export default function WorldPage({ worldId }: { worldId: number }) {
  const { data, update } = useStore();
  const w = getWorld(worldId);
  if (!w) return <p>Mundo não encontrado.</p>;
  const unlocked = isWorldUnlocked(w.id, data);
  const cp = evaluateCheckpoint(w, data);
  const project = getProject(w.projectId)!;
  const cpWork = data.checkpoints[String(w.id)];

  return (
    <>
      <nav aria-label="Mundos" className="mb-4 flex flex-wrap gap-2">
        {worlds.map((x) => (
          <Link key={x.id} to={`/mundo/${x.id}`} aria-current={x.id === w.id ? 'page' : undefined} className={x.id === w.id ? 'btn-primary' : 'btn-secondary'}>
            Mundo {x.id}
          </Link>
        ))}
      </nav>
      <PageTitle title={`Mundo ${w.id} · ${w.title}`} subtitle={w.goal} />
      {!unlocked && (
        <div className="mb-6">
          <Callout tone="atencao" title="Mundo ainda não liberado">
            O PDF recomenda avançar só depois de passar no checkpoint do Mundo {w.id - 1}. Você pode ler os módulos como prévia, mas o próximo passo sugerido continuará no mundo anterior.
          </Callout>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card aria-labelledby="mods">
          <h2 id="mods" className="text-lg">Módulos</h2>
          <ul className="mt-4 space-y-2">
            {modulesOfWorld(w.id).map((m) => {
              const ev = evaluateModule(m, data);
              return (
                <li key={m.id}>
                  <Link to={`/modulo/${m.id}`} className="flex items-center gap-4 rounded-xl border border-slate-200 p-3 hover:border-primary dark:border-slate-800">
                    <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-sm font-bold text-primary dark:bg-slate-800 dark:text-primary-dark">{m.id}</span>
                    <span className="min-w-0 flex-1">
                      <b className="block text-sm">{m.title}</b>
                      <span className="mt-1 flex flex-wrap gap-1.5">
                        {m.devState === 'piloto-completo' ? <ModuleStatusBadge status={ev.status} /> : data.selfReportedStudy[m.id] ? <Chip>Estudo autodeclarado</Chip> : <Chip>Não iniciado</Chip>}
                        {m.devState === 'piloto-completo' ? <Chip tone="ok">Três níveis disponíveis</Chip> : <Chip tone="aviso">Só texto do PDF · aprofundamento pendente</Chip>}
                        <span className="muted text-xs">~{formatMinutes(m.estimatedMinutes)}</span>
                      </span>
                    </span>
                    <ChevronRight size={18} className="text-slate-400" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
        <div className="space-y-6">
          <Card aria-labelledby="proj">
            <h2 id="proj" className="text-lg">Projeto do mundo</h2>
            <p className="mt-2 font-semibold">{project.title}</p>
            <p className="muted mt-1 text-sm">{project.objective}</p>
            <Link to={`/projetos/${project.id}`} className="btn-secondary mt-3">Abrir projeto</Link>
          </Card>
          <Card aria-labelledby="cp">
            <h2 id="cp" className="text-lg">Checkpoint</h2>
            <p className="muted mt-1 text-sm">{w.checkpoint.intro} Marque só o que você consegue fazer sem consultar nada.</p>
            <ul className="mt-3 space-y-2">
              {w.checkpoint.items.map((i) => (
                <li key={i.id}>
                  <label className="flex items-start gap-2 text-sm">
                    <input type="checkbox" className="mt-1 accent-indigo-600" checked={!!cpWork?.items[i.id]} onChange={(e) => update((d) => setCheckpointItem(d, w.id, i.id, e.target.checked))} />
                    {i.text}
                  </label>
                </li>
              ))}
            </ul>
            <CheckpointQuiz worldId={w.id} />
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950">
              {cp.passed ? (
                <p className="font-semibold text-emerald-700 dark:text-emerald-400">Checkpoint cumprido. O próximo mundo está liberado. (Itens e projeto são autodeclarados; a avaliação prática foi corrigida automaticamente.)</p>
              ) : (
                <>
                  <p className="font-semibold">Falta para passar:</p>
                  <ul className="mt-1 list-disc pl-5">
                    {cp.missing.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <p className="muted mt-2 text-xs">O PDF pede que os checkpoints sejam feitos sem ajuda da IA.</p>
          </Card>
          {w.resourceIds.length > 0 && (
            <Card aria-labelledby="rec">
              <h2 id="rec" className="text-lg">Recursos gratuitos do mundo</h2>
              <ul className="mt-2 space-y-2 text-sm">
                {w.resourceIds.map((id) => {
                  const r = getReference(id);
                  return r ? (
                    <li key={id}>
                      <ExternalLink href={r.url}>{r.title}</ExternalLink>
                      <span className="muted block text-xs">{r.organization}</span>
                    </li>
                  ) : null;
                })}
              </ul>
            </Card>
          )}
          {!unlocked && <p className="muted flex items-center gap-1 text-xs"><Lock size={12} aria-hidden="true" /> Modo prévia</p>}
        </div>
      </div>
    </>
  );
}
