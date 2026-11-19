import { ArrowRight, BookOpen, Clock3, Brain, Target } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { Link } from '../router';
import { getLesson, getModule, worlds } from '../content';
import { nextStep, progressSummary, worldProgress, isWorldUnlocked } from '../services/progress';
import { chooseDayType, dueCardsCount, forecast, recordedSeconds, remainingMinutes, sessionPlan, streak } from '../services/plan';
import { recommendations } from '../services/recommendations';
import { evaluateModule } from '../services/mastery';
import { formatDateBR, formatMinutes } from '../services/dates';
import { Card, PageTitle, ProgressBar, Stat, pct, Callout } from '../components/ui';

const TARGET_LABEL = {
  entender: 'Estudar a teoria',
  praticar: 'Fazer as atividades práticas',
  aplicar: 'Entregar o desafio aplicado',
  revisar: 'Revisar',
  'estudar-pdf': 'Estudar pelo material do PDF',
} as const;

export default function Dashboard() {
  const { data } = useStore();
  const step = nextStep(data);
  const mod = getModule(step.moduleId)!;
  const due = dueCardsCount(data);
  const recs = recommendations(data);
  const weak = mod.devState === 'piloto-completo' ? evaluateModule(mod, data).objectives.filter((o) => o.level === 'dificuldade').length : 0;
  const plan = sessionPlan(data.preferences.sessionMinutes, chooseDayType({ dueCards: due, nextTarget: step.target, isProgramming: mod.isProgramming, weakObjectives: weak }));
  const remaining = remainingMinutes(data);
  const fc = forecast(remaining.total, data.preferences.daysPerWeek, data.preferences.sessionMinutes);
  const summary = progressSummary(data);
  const recorded = recordedSeconds(data);
  const stepRoute =
    step.target === 'entender' && step.lessonId ? `/aula/${step.lessonId}` : step.target === 'praticar' ? `/modulo/${mod.id}/praticar` : step.target === 'aplicar' ? `/modulo/${mod.id}/aplicar` : `/modulo/${mod.id}`;

  return (
    <>
      <PageTitle title="Seu painel" subtitle="Próximo passo, plano da sessão de hoje e o que os seus dados mostram até agora." />

      <Card className="mb-6 bg-gradient-to-br from-primary to-indigo-500 !text-white dark:from-indigo-900 dark:to-slate-900">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-100">Próximo passo</p>
        <h2 className="mt-2 text-2xl">
          {mod.id} · {mod.title}
        </h2>
        <p className="mt-1 text-indigo-100">
          {TARGET_LABEL[step.target]}
          {step.lessonId && ` — lição ${step.lessonId}: ${getLesson(step.lessonId)?.title}`}
        </p>
        <Link to={stepRoute} className="btn mt-4 bg-white text-primary hover:bg-indigo-50">
          Continuar <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Progresso verificado" value={pct(summary.verified)} hint={`níveis com evidência nos ${summary.structuredModules} módulo(s) já estruturado(s)`} />
        <Stat label="Estudo autodeclarado" value={`${summary.selfReported}/${summary.totalModules - summary.structuredModules}`} hint="módulos ainda só com o texto do PDF" />
        <Stat label="Tempo ativo registrado" value={formatMinutes(recorded / 60)} hint={`sequência: ${streak(data)} dia(s)`} />
        <Stat label="Revisões vencidas" value={due} hint={<Link to="/flashcards" className="link">abrir flashcards</Link>} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2" aria-labelledby="plano">
          <h2 id="plano" className="text-lg">Plano de hoje — {plan.label}</h2>
          <p className="muted mt-1 text-sm">
            Sessão de {plan.total} minutos. A distribuição muda conforme a etapa, as revisões pendentes e o seu desempenho.
          </p>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { Icon: BookOpen, t: 'Teoria', m: plan.teoria, d: 'Leia a lição e faça a verificação.' },
              { Icon: Target, t: 'Prática', m: plan.pratica, d: 'Atividades do Nível 2 ou projeto.' },
              { Icon: Brain, t: 'Questões', m: plan.questoes, d: 'Banco de questões sem consulta.' },
              { Icon: Clock3, t: 'Revisão espaçada', m: plan.revisao, d: 'Flashcards vencidos.' },
            ].map(({ Icon, t, m, d }) => (
              <li key={t} className="flex gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                <Icon size={20} className="mt-0.5 text-primary dark:text-primary-dark" aria-hidden="true" />
                <div>
                  <p className="font-semibold">
                    {t} <span className="muted text-sm">· {m} min</span>
                  </p>
                  <p className="muted text-sm">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <Card aria-labelledby="previsao">
          <h2 id="previsao" className="text-lg">Previsão de conclusão</h2>
          <p className="mt-3 text-2xl font-extrabold">{formatDateBR(fc.date)}</p>
          <p className="muted mt-1 text-sm">
            ≈ {fc.sessions} sessões de {data.preferences.sessionMinutes} min, {data.preferences.daysPerWeek} dia(s)/semana.
          </p>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="muted">Conteúdo restante</dt><dd>{formatMinutes(remaining.content)}</dd></div>
            <div className="flex justify-between"><dt className="muted">Projetos</dt><dd>{formatMinutes(remaining.projects)}</dd></div>
            <div className="flex justify-between"><dt className="muted">Revisões (+10%)</dt><dd>{formatMinutes(remaining.reviews)}</dd></div>
          </dl>
          <p className="muted mt-3 text-xs">Estimativa baseada nas durações do PDF (≈7 h/semana). Não é tempo registrado. <Link to="/configuracoes" className="link">Ajustar rotina</Link></p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card aria-labelledby="mundos">
          <h2 id="mundos" className="text-lg">Mundos</h2>
          <ul className="mt-4 space-y-4">
            {worlds.map((w) => {
              const p = worldProgress(w.id, data);
              const unlocked = isWorldUnlocked(w.id, data);
              return (
                <li key={w.id}>
                  <Link to={`/mundo/${w.id}`} className="block rounded-lg p-1 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <div className="mb-1 flex justify-between gap-2 text-sm">
                      <b>
                        {w.id}. {w.title}
                      </b>
                      <span className="muted">{unlocked ? `${p.selfReported} autodecl. · ${Math.round(p.verified * 10) / 10} verif.` : 'Bloqueado pelo checkpoint'}</span>
                    </div>
                    <ProgressBar value={(p.verified + p.selfReported) / p.total} label={`Progresso do Mundo ${w.id}`} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card aria-labelledby="reforco">
          <h2 id="reforco" className="text-lg">Recomendações</h2>
          {recs.length === 0 ? (
            <p className="muted mt-3 text-sm">
              Nenhuma recomendação de reforço. Isso pode significar bom desempenho ou <b>dados insuficientes</b>: o sistema só recomenda reforço depois de pelo menos 3 respostas independentes por objetivo.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {recs.slice(0, 5).map((r, i) => (
                <li key={i} className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950">
                  <Link to={r.route} className="link">{r.title}</Link>
                  <p className="muted mt-1">{r.detail}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <div className="mt-6">
        <Callout tone="info" title="Como o progresso é calculado">
          "Verificado" só conta níveis com evidência: verificações de compreensão, atividades corrigidas automaticamente e entregas. Os 45 módulos ainda sem conteúdo estruturado só podem ser registrados como "estudo autodeclarado" e não entram no progresso verificado.
        </Callout>
      </div>
    </>
  );
}
