import { useStore } from '../store/StoreContext';
import { getActivity, getLesson, modules, objectives } from '../content';
import { objectiveStats } from '../services/mastery';
import { recordedSeconds } from '../services/plan';
import { addDays, formatMinutes, localDate } from '../services/dates';
import { Card, PageTitle, Stat, Chip, pct, EmptyState } from '../components/ui';

export default function HistoryPage() {
  const { data } = useStore();
  const today = localDate();
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));
  const perDay = days.map((d) => ({ d, s: Object.values(data.studyTime[d] ?? {}).reduce((a, b) => a + b, 0) }));
  const max = Math.max(60, ...perDay.map((x) => x.s));
  const structuredObjectives = objectives.filter((o) => !o.provisional);
  const independent = data.answers.filter((a) => a.mode !== 'assistido');
  const conf = data.answers.filter((a) => a.confidence);

  type Ev = { at: string; text: string };
  const events: Ev[] = [
    ...data.checkAttempts.map((c) => ({ at: c.at, text: `Verificação da lição ${c.lessonId} (${getLesson(c.lessonId)?.title ?? ''}) — ${c.correct}/${c.total}, modo ${c.mode}` })),
    ...data.activityAttempts.map((a) => ({ at: a.at, text: `Atividade "${getActivity(a.activityId)?.title ?? a.activityId}" — ${a.score}/${a.max}${a.passed ? ' (aprovada)' : ''}` })),
    ...data.exams.map((e) => ({ at: e.finishedAt, text: `Simulado ${e.mode} — ${e.correct}/${e.total}` })),
    ...Object.values(data.externalLogs).map((l) => ({ at: l.savedAt, text: `Prática externa registrada (autodeclarada): ${getActivity(l.activityId)?.title ?? l.activityId}` })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <>
      <PageTitle title="Histórico e desempenho" subtitle="O que foi registrado neste navegador. O domínio é avaliado por objetivo, não só pela porcentagem geral." />
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Tempo ativo total" value={formatMinutes(recordedSeconds(data) / 60)} hint="aba visível + interação recente" />
        <Stat label="Respostas registradas" value={data.answers.length} hint={`${independent.length} independentes`} />
        <Stat label="Acerto geral (independentes)" value={independent.length ? pct(independent.filter((a) => a.correct).length / independent.length) : '—'} hint="não é critério de domínio" />
        <Stat label="Respostas com confiança informada" value={conf.length} hint={conf.length ? `${conf.filter((a) => a.confidence === 3 && !a.correct).length} erros com "certeza"` : undefined} />
      </div>

      <Card aria-labelledby="tempo">
        <h2 id="tempo" className="text-lg">Tempo ativo nos últimos 14 dias</h2>
        <div className="mt-4 flex h-40 items-end gap-1" role="img" aria-label={`Minutos por dia: ${perDay.map((x) => `${x.d.slice(8)}: ${Math.round(x.s / 60)}`).join(', ')}`}>
          {perDay.map((x) => (
            <div key={x.d} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full rounded-t bg-primary dark:bg-primary-dark" style={{ height: `${(x.s / max) * 100}%`, minHeight: x.s ? 2 : 0 }} />
              <span className="muted text-[10px]">{x.d.slice(8)}</span>
            </div>
          ))}
        </div>
        <p className="muted mt-2 text-xs">Duração estimada da trilha: {formatMinutes(modules.reduce((s, m) => s + m.estimatedMinutes, 0))} de módulos (sem projetos). O tempo acima é o efetivamente registrado.</p>
      </Card>

      <Card className="mt-6" aria-labelledby="obj">
        <h2 id="obj" className="text-lg">Desempenho por objetivo</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th scope="col" className="py-2 pr-3">Objetivo</th>
                <th scope="col" className="py-2 pr-3">Indep.</th>
                <th scope="col" className="py-2 pr-3">Últimas</th>
                <th scope="col" className="py-2">Situação</th>
              </tr>
            </thead>
            <tbody>
              {structuredObjectives.map((o) => {
                const s = objectiveStats(o.id, data.answers);
                return (
                  <tr key={o.id} className="border-b border-slate-100 align-top dark:border-slate-800">
                    <td className="py-2 pr-3"><b>{o.id}</b> <span className="muted">{o.text}</span></td>
                    <td className="py-2 pr-3">{s.independentCorrect}/{s.independent}</td>
                    <td className="py-2 pr-3">{s.recentAccuracy === null ? '—' : pct(s.recentAccuracy)}</td>
                    <td className="py-2">
                      <Chip tone={s.level === 'dominado' ? 'ok' : s.level === 'dificuldade' ? 'aviso' : s.level === 'em-progresso' ? 'info' : 'neutro'}>
                        {{ 'dados-insuficientes': 'Dados insuficientes', dominado: 'Dominado', 'em-progresso': 'Em progresso', dificuldade: 'Dificuldade' }[s.level]}
                      </Chip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="muted mt-2 text-xs">Classificação só a partir de 3 respostas independentes; usa as últimas 5. Dominado ≥ 80%; dificuldade &lt; 60%.</p>
      </Card>

      <Card className="mt-6" aria-labelledby="ev">
        <h2 id="ev" className="text-lg">Linha do tempo de tentativas</h2>
        {events.length === 0 ? (
          <div className="mt-3"><EmptyState title="Ainda não há tentativas registradas." /></div>
        ) : (
          <ul className="mt-3 max-h-[28rem] space-y-2 overflow-auto text-sm">
            {events.slice(0, 200).map((e, i) => (
              <li key={i} className="flex gap-3 border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="muted w-36 shrink-0 text-xs">{new Date(e.at).toLocaleString('pt-BR')}</span>
                <span>{e.text}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
