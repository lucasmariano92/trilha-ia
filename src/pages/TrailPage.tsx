import { Lock, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { Link } from '../router';
import { getProject, modulesOfWorld, worlds } from '../content';
import { evaluateCheckpoint, isWorldUnlocked, worldProgress } from '../services/progress';
import { Card, PageTitle, ProgressBar, Chip, Callout } from '../components/ui';

export default function TrailPage() {
  const { data } = useStore();
  return (
    <>
      <PageTitle title="A trilha" subtitle="Cinco mundos, cerca de 24 semanas a 6–8 horas por semana. Siga a ordem dos mundos: cada um usa o vocabulário do anterior. Dentro de um mundo, os módulos podem ser feitos em paralelo." />
      <Callout tone="pdf" title="Como usar (segundo o PDF)">
        Cada módulo tem três partes: entender, praticar e registrar. Só avance de mundo quando passar no checkpoint. Se travar, refaça o projeto do mundo com outra ideia.
      </Callout>
      <ol className="mt-6 space-y-4">
        {worlds.map((w) => {
          const unlocked = isWorldUnlocked(w.id, data);
          const cp = evaluateCheckpoint(w, data);
          const p = worldProgress(w.id, data);
          const structured = modulesOfWorld(w.id).filter((m) => m.devState === 'piloto-completo').length;
          return (
            <li key={w.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="muted text-xs font-bold uppercase tracking-widest">Mundo {w.id} · {w.weeks} semanas · {w.moduleIds.length} módulos</p>
                    <h2 className="mt-1 text-xl">{w.title}</h2>
                    <p className="muted mt-1 max-w-2xl text-sm">{w.goal}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!unlocked && <Chip tone="aviso"><Lock size={12} aria-hidden="true" /> Checkpoint anterior pendente</Chip>}
                    {cp.passed && <Chip tone="ok"><CheckCircle2 size={12} aria-hidden="true" /> Checkpoint autodeclarado</Chip>}
                    <Chip tone="info">{structured} de {w.moduleIds.length} módulos estruturados</Chip>
                  </div>
                </div>
                <ProgressBar className="mt-4" value={(p.verified + p.selfReported) / p.total} label={`Progresso do Mundo ${w.id}`} />
                <p className="muted mt-2 text-xs">Projeto: {getProject(w.projectId)?.title} · Checkpoint: {cp.itemsDone}/{cp.itemsTotal} itens</p>
                <Link to={`/mundo/${w.id}`} className="btn-secondary mt-4">Abrir mundo</Link>
              </Card>
            </li>
          );
        })}
      </ol>
    </>
  );
}
