import { CheckCircle2, Circle } from 'lucide-react';
import type { Module } from '../types/curriculum';
import { useStore } from '../store/StoreContext';
import { Link } from '../router';
import { flashcardsOfModule, getModule, getReference, getWorld, questionsOfModule } from '../content';
import { bestCheckScore, evaluateModule, lessonTheoryDone, STATUS_LABEL } from '../services/mastery';
import { missingPrerequisites, isWorldUnlocked } from '../services/progress';
import { recordedSeconds } from '../services/plan';
import { toggleSelfReported } from '../services/actions';
import { formatMinutes, formatDateBR } from '../services/dates';
import { Card, PageTitle, ModuleStatusBadge, Chip, Callout, ContentBadge, ExternalLink, pct } from '../components/ui';
import { ClassifyView, JudgeView, NumericView, OrderView } from '../components/activities/GradedActivities';
import { DemoView, ExternalView } from '../components/activities/OtherActivities';
import { ChallengeView } from '../components/ChallengeView';
import { DoubtBox, ReportBox } from '../components/Notes';

const TABS = [
  { id: 'visao', label: 'Visão geral' },
  { id: 'entender', label: '1 · Entender' },
  { id: 'praticar', label: '2 · Praticar' },
  { id: 'aplicar', label: '3 · Aplicar' },
  { id: 'referencias', label: 'Referências' },
  { id: 'duvidas', label: 'Dúvidas' },
] as const;

export default function ModulePage({ moduleId, tab = 'visao' }: { moduleId: string; tab?: string }) {
  const { data, update } = useStore();
  const m = getModule(moduleId);
  if (!m) return <p>Módulo não encontrado.</p>;
  const w = getWorld(m.worldId)!;
  const ev = evaluateModule(m, data);
  const missing = missingPrerequisites(m.id, data);
  const current = TABS.some((t) => t.id === tab) ? tab : 'visao';

  return (
    <>
      <p className="muted mb-2 text-sm">
        <Link to={`/mundo/${w.id}`} className="link">Mundo {w.id} · {w.title}</Link>
      </p>
      <PageTitle title={`${m.id} · ${m.title}`} subtitle={m.devState === 'piloto-completo' ? 'Módulo piloto com os três níveis de aprendizagem.' : 'Conteúdo base do PDF. O aprofundamento em três níveis ainda não foi desenvolvido.'}>
        <div className="flex flex-wrap gap-2">
          {m.devState === 'piloto-completo' ? <ModuleStatusBadge status={ev.status} /> : <Chip tone="aviso">Aprofundamento pendente</Chip>}
          <Chip>~{formatMinutes(m.estimatedMinutes)} estimados</Chip>
        </div>
      </PageTitle>

      {!isWorldUnlocked(m.worldId, data) && (
        <div className="mb-4"><Callout tone="atencao" title="Prévia">O checkpoint do mundo anterior ainda não foi cumprido.</Callout></div>
      )}
      {missing.length > 0 && (
        <div className="mb-4">
          <Callout tone="info" title="Pré-requisitos recomendados">
            Antes deste módulo, o ideal é concluir: {missing.map((id) => <Link key={id} to={`/modulo/${id}`} className="link mr-2">{id} {getModule(id)?.title}</Link>)}
          </Callout>
        </div>
      )}

      {m.devState !== 'piloto-completo' ? (
        <PendingModule m={m} selfReported={data.selfReportedStudy[m.id]} onToggle={() => update((d) => toggleSelfReported(d, m.id))} />
      ) : (
        <>
          <nav aria-label="Seções do módulo" className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
            {TABS.map((t) => (
              <Link
                key={t.id}
                to={`/modulo/${m.id}${t.id === 'visao' ? '' : `/${t.id}`}`}
                aria-current={current === t.id ? 'page' : undefined}
                className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold ${current === t.id ? 'border-primary text-primary dark:border-primary-dark dark:text-primary-dark' : 'border-transparent muted hover:text-slate-900 dark:hover:text-white'}`}
              >
                {t.label}
              </Link>
            ))}
          </nav>
          {current === 'visao' && <Overview m={m} />}
          {current === 'entender' && <LessonsList m={m} />}
          {current === 'praticar' && <Practice m={m} />}
          {current === 'aplicar' && m.challenge && <ChallengeView challenge={m.challenge} />}
          {current === 'referencias' && <References m={m} />}
          {current === 'duvidas' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <DoubtBox targetId={m.id} />
              <ReportBox targetId={m.id} />
            </div>
          )}
        </>
      )}
    </>
  );
}

function LevelRow({ done, title, detail, to }: { done: boolean; title: string; detail: string; to: string }) {
  return (
    <li className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
      {done ? <CheckCircle2 className="mt-0.5 text-emerald-600" size={20} aria-hidden="true" /> : <Circle className="mt-0.5 text-slate-400" size={20} aria-hidden="true" />}
      <div className="flex-1">
        <Link to={to} className="font-semibold hover:underline">{title}</Link>
        <span className="sr-only">{done ? ' (concluído)' : ' (pendente)'}</span>
        <p className="muted text-sm">{detail}</p>
      </div>
    </li>
  );
}

function Overview({ m }: { m: Module }) {
  const { data } = useStore();
  const ev = evaluateModule(m, data);
  const time = recordedSeconds(data, m.id);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <Card aria-labelledby="obj">
          <h2 id="obj" className="text-lg">Objetivos de aprendizagem</h2>
          <ol className="mt-3 space-y-3">
            {ev.objectives.map((o, i) => {
              const obj = m.objectives[i];
              const label = { 'dados-insuficientes': `Dados insuficientes (${o.independent}/${m.mastery.minEvidencePerObjective} respostas independentes)`, dominado: 'Dominado', 'em-progresso': 'Em progresso', dificuldade: 'Dificuldade' }[o.level];
              const tone = o.level === 'dominado' ? 'ok' : o.level === 'dificuldade' ? 'aviso' : o.level === 'em-progresso' ? 'info' : 'neutro';
              return (
                <li key={o.objectiveId} className="text-sm">
                  <p><b>{obj.id.split('-')[1]}.</b> {obj.text}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2">
                    <Chip tone={tone}>{label}</Chip>
                    {o.recentAccuracy !== null && <span className="muted text-xs">últimas independentes: {pct(o.recentAccuracy)}</span>}
                  </p>
                </li>
              );
            })}
          </ol>
        </Card>
        <Card aria-labelledby="niveis">
          <h2 id="niveis" className="text-lg">Seus três níveis</h2>
          <ul className="mt-3 space-y-2">
            <LevelRow done={ev.l1} title="Nível 1 · Entender" to={`/modulo/${m.id}/entender`} detail={`${m.lessons.filter((l) => lessonTheoryDone(l.id, data)).length}/${m.lessons.length} lições com verificação ≥ 80%.`} />
            <LevelRow done={ev.l2} title="Nível 2 · Praticar" to={`/modulo/${m.id}/praticar`} detail={`Atividades essenciais concluídas.${ev.selfReportedL2.length ? ' Inclui prática externa autodeclarada.' : ''}`} />
            <LevelRow done={ev.l3} title="Nível 3 · Aplicar" to={`/modulo/${m.id}/aplicar`} detail={ev.l3 ? 'Desafio entregue (autodeclarado, pendente de avaliação).' : 'Desafio aplicado ainda não entregue.'} />
          </ul>
          {ev.reviewReasons.length > 0 && (
            <div className="mt-4"><Callout tone="atencao" title="Revisão necessária">{ev.reviewReasons.join(' ')}</Callout></div>
          )}
        </Card>
        <Card aria-labelledby="pdf">
          <h2 id="pdf" className="text-lg">Texto original do PDF</h2>
          <p className="mt-2 text-sm leading-6">{m.pdfText}</p>
          {m.pdfPractice && <p className="mt-2 text-sm"><b>Prática do PDF:</b> {m.pdfPractice}</p>}
          <div className="mt-2"><ContentBadge status="pdf" /></div>
        </Card>
      </div>
      <div className="space-y-6">
        <Card aria-labelledby="dados">
          <h2 id="dados" className="text-lg">Ficha do módulo</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div><dt className="muted">Estado</dt><dd><ModuleStatusBadge status={ev.status} /></dd></div>
            <div><dt className="muted">Duração estimada</dt><dd>{formatMinutes(m.estimatedMinutes)} ({m.lessons.length} lições de 20–25 min, atividades e desafio)</dd></div>
            <div><dt className="muted">Tempo ativo registrado</dt><dd>{formatMinutes(time / 60)}</dd></div>
            <div><dt className="muted">Pré-requisitos</dt><dd>{m.prerequisites.length ? m.prerequisites.join(', ') : 'Nenhum (primeiro módulo da trilha)'}</dd></div>
            <div><dt className="muted">Questões / flashcards</dt><dd>{questionsOfModule(m.id).length} / {flashcardsOfModule(m.id).length}</dd></div>
            <div><dt className="muted">Verificação do conteúdo</dt><dd>Teoria complementar com referências; questões pendentes de revisão humana.</dd></div>
          </dl>
        </Card>
        <Card aria-labelledby="crit">
          <h2 id="crit" className="text-lg">Critérios de domínio</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {m.mastery.description.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </Card>
        <Card aria-labelledby="estados">
          <h2 id="estados" className="text-lg">Estados possíveis</h2>
          <p className="muted mt-1 text-sm">{Object.values(STATUS_LABEL).join(' → ')}</p>
        </Card>
      </div>
    </div>
  );
}

function LessonsList({ m }: { m: Module }) {
  const { data } = useStore();
  return (
    <Card aria-labelledby="licoes">
      <h2 id="licoes" className="text-lg">Lições do Nível 1</h2>
      <p className="muted mt-1 text-sm">Cada lição termina com uma verificação de compreensão. É preciso atingir 80% em cada uma; você pode tentar quantas vezes quiser.</p>
      <ol className="mt-4 space-y-3">
        {m.lessons.map((l) => {
          const best = bestCheckScore(l.id, data);
          const done = lessonTheoryDone(l.id, data, m.mastery.theoryThreshold);
          return (
            <li key={l.id}>
              <Link to={`/aula/${l.id}`} className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 hover:border-primary dark:border-slate-800">
                {done ? <CheckCircle2 className="mt-0.5 text-emerald-600" size={20} aria-hidden="true" /> : <Circle className="mt-0.5 text-slate-400" size={20} aria-hidden="true" />}
                <div className="flex-1">
                  <p className="font-semibold">{l.id} · {l.title}</p>
                  <p className="muted mt-1 text-sm">{l.goal}</p>
                  <p className="mt-2 flex flex-wrap gap-2 text-xs">
                    <Chip>~{l.estimatedMinutes} min</Chip>
                    <ContentBadge status={l.status} />
                    {best && <Chip tone={done ? 'ok' : 'aviso'}>Melhor verificação: {pct(best.ratio)} ({best.mode})</Chip>}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function Practice({ m }: { m: Module }) {
  return (
    <div className="space-y-6">
      <Callout tone="info" title="Como o Nível 2 é concluído">
        As atividades com correção automática só contam quando você atinge o mínimo indicado — clicar em "corrigir" ou ver a resposta não conclui nada. A prática externa do PDF é registrada como autodeclarada.
      </Callout>
      {m.activities.map((a) => {
        switch (a.kind) {
          case 'classify': return <ClassifyView key={a.id} activity={a} />;
          case 'order': return <OrderView key={a.id} activity={a} />;
          case 'judge': return <JudgeView key={a.id} activity={a} />;
          case 'numeric': return <NumericView key={a.id} activity={a} />;
          case 'external': return <ExternalView key={a.id} activity={a} />;
          case 'demo': return <DemoView key={a.id} activity={a} />;
        }
      })}
    </div>
  );
}

function References({ m }: { m: Module }) {
  return (
    <Card aria-labelledby="refs">
      <h2 id="refs" className="text-lg">Referências do módulo</h2>
      <p className="muted mt-1 text-sm">Endereços confirmados por busca na web na data indicada. Conteúdos externos mudam: se um link quebrar, use "Reportar erro".</p>
      <ul className="mt-4 space-y-4">
        {m.referenceIds.map((id) => {
          const r = getReference(id);
          if (!r) return null;
          return (
            <li key={id} className="text-sm">
              <ExternalLink href={r.url}>{r.title}</ExternalLink>
              <p className="muted">
                {r.organization} · {r.format} · {r.language} · {r.free ? 'gratuito' : 'pago'} · {r.citedInPdf ? 'citado no PDF' : 'complementar'}
              </p>
              <p className="muted text-xs">Última verificação: {r.lastVerified ? `${formatDateBR(r.lastVerified)} (${r.verification === 'busca-web' ? 'via busca na web' : r.verification})` : 'não verificado'}</p>
              {r.note && <p className="mt-1 text-xs">{r.note}</p>}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function PendingModule({ m, selfReported, onToggle }: { m: Module; selfReported?: string; onToggle: () => void }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card aria-labelledby="base">
          <div className="flex items-center justify-between gap-2">
            <h2 id="base" className="text-lg">Conteúdo base</h2>
            <ContentBadge status="pdf" />
          </div>
          <p className="mt-3 leading-7">{m.pdfText}</p>
          {m.pdfPractice && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-950">
              <b>Prática indicada no PDF:</b> {m.pdfPractice}
            </div>
          )}
        </Card>
        <Callout tone="atencao" title="Módulo ainda não aprofundado">
          Este módulo mostra apenas o texto do PDF. Ainda faltam: teoria desenvolvida, exercícios corrigidos, desafio aplicado, questões revisadas e flashcards próprios. Isso será feito nas próximas etapas, seguindo o padrão do módulo 1.1. Por isso, aqui você só pode registrar o estudo como autodeclarado.
        </Callout>
      </div>
      <div className="space-y-6">
        <Card aria-labelledby="reg">
          <h2 id="reg" className="text-lg">Registro de estudo</h2>
          <p className="muted mt-1 text-sm">Estudou pelo PDF e pelos recursos do mundo? Registre aqui. Fica marcado como autodeclarado e não conta no progresso verificado.</p>
          <button className={selfReported ? 'btn-secondary mt-3' : 'btn-primary mt-3'} onClick={onToggle} aria-pressed={!!selfReported}>
            {selfReported ? `Estudo registrado em ${formatDateBR(selfReported)} — desfazer` : 'Registrar estudo (autodeclarado)'}
          </button>
        </Card>
        <DoubtBox targetId={m.id} />
        <ReportBox targetId={m.id} />
      </div>
    </div>
  );
}
