import { useEffect, useState } from 'react';
import { Clock3, Flag, Play } from 'lucide-react';
import type { ExamAttempt } from '../types/progress';
import { useStore } from '../store/StoreContext';
import { getModule, getQuestion, questions } from '../content';
import { finishExam, startExam, updateActiveExam } from '../services/actions';
import { createExam, examStatus, FULL_EXAM_QUESTIONS, fullExamEligibility, isExpired, remainingSeconds, resultByModule, TRAINING_MAX_QUESTIONS } from '../services/exam';
import { formatDuration, formatMinutes } from '../services/dates';
import { Card, PageTitle, Callout, ProgressBar, ReviewBadge, pct, Chip } from '../components/ui';
import { QuestionCard } from '../components/QuestionCard';
import { Link } from '../router';

function useNow(active: boolean) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
}

export default function ExamPage() {
  const { data, update, toast } = useStore();
  const exam = data.activeExam;
  const now = useNow(!!exam);
  const [resultId, setResultId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<null | 'finalizar' | 'antecipado'>(null);
  const elig = fullExamEligibility(questions);

  // Finalização automática quando o prazo termina (inclusive ao reabrir a página depois do prazo).
  useEffect(() => {
    if (exam && isExpired(exam, now)) {
      const id = exam.id;
      update((d) => finishExam(d, getQuestion, exam.startedAtMs + exam.durationSec * 1000, 'tempo-esgotado'));
      setResultId(id);
      toast('Tempo esgotado: simulado finalizado e corrigido.', 'info');
    }
  }, [exam, now, update, toast]);

  const result = resultId ? data.exams.find((e) => e.id === resultId) : undefined;

  if (exam) {
    const qid = exam.questionIds[exam.current];
    // A questão pode ter sido removida do banco depois do início (ex.: descartada numa revisão).
    const q = getQuestion(qid);
    const st = examStatus(exam);
    const remaining = remainingSeconds(exam, now);
    const finish = (reason: 'finalizado' | 'antecipado') => {
      const id = exam.id;
      update((d) => finishExam(d, getQuestion, Date.now(), reason));
      setResultId(id);
      setConfirming(null);
    };
    return (
      <>
        <PageTitle title={exam.mode === 'completo' ? 'Simulado completo' : 'Simulado de treino'} subtitle="Avaliação didática. Não é exame oficial de certificação." />
        <Card aria-label="Simulado em andamento">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold">Questão {exam.current + 1} de {exam.questionIds.length}</p>
            <p className={`chip text-sm ${remaining < 300 ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-slate-100 dark:bg-slate-800'}`} role="timer" aria-label={`Tempo restante ${formatDuration(remaining)}`}>
              <Clock3 size={14} aria-hidden="true" /> {formatDuration(remaining)}
            </p>
          </div>
          <ProgressBar className="mt-3" value={st.answered / exam.questionIds.length} label="Questões respondidas" />
          <p className="muted mt-2 text-xs">{st.answered} respondidas · {st.pending} pendentes · {st.flagged} marcadas para revisão</p>
          <nav aria-label="Mapa de questões" className="my-4 flex flex-wrap gap-1">
            {exam.questionIds.map((id, i) => {
              const answered = exam.answers[id] !== undefined;
              const flagged = exam.flags.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => update((d) => updateActiveExam(d, { current: i }))}
                  aria-current={i === exam.current ? 'step' : undefined}
                  aria-label={`Questão ${i + 1}${answered ? ', respondida' : ', pendente'}${flagged ? ', marcada para revisão' : ''}`}
                  className={`h-8 w-8 rounded-md text-xs font-bold ${i === exam.current ? 'bg-primary text-white dark:bg-primary-dark dark:text-slate-950' : flagged ? 'bg-amber-200 text-amber-900' : answered ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </nav>
          {q ? (
            <>
              <div className="mb-2 flex gap-2"><ReviewBadge review={q.review} /><Chip>{q.moduleId}</Chip></div>
              <QuestionCard question={q} selected={exam.answers[qid] ?? null} onSelect={(c) => update((d) => updateActiveExam(d, { answers: { ...exam.answers, [qid]: c } }))} revealed={false} showMeta={false} />
            </>
          ) : (
            <p role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/40">
              Esta questão foi retirada do banco depois que o simulado começou (por exemplo, descartada numa revisão). Ela conta como não respondida; siga para a próxima.
            </p>
          )}
          <div className="mt-5 flex flex-wrap justify-between gap-2">
            <button className="btn-ghost" aria-pressed={exam.flags.includes(qid)} onClick={() => update((d) => updateActiveExam(d, { flags: exam.flags.includes(qid) ? exam.flags.filter((x) => x !== qid) : [...exam.flags, qid] }))}>
              <Flag size={16} aria-hidden="true" /> {exam.flags.includes(qid) ? 'Desmarcar revisão' : 'Marcar para revisão'}
            </button>
            <div className="flex gap-2">
              <button className="btn-secondary" disabled={exam.current === 0} onClick={() => update((d) => updateActiveExam(d, { current: exam.current - 1 }))}>Anterior</button>
              {exam.current < exam.questionIds.length - 1 ? (
                <button className="btn-primary" onClick={() => update((d) => updateActiveExam(d, { current: exam.current + 1 }))}>Próxima</button>
              ) : (
                <button className="btn-primary" onClick={() => setConfirming('finalizar')}>Finalizar</button>
              )}
            </div>
          </div>
          <button className="mt-6 text-sm font-semibold text-red-700 dark:text-red-400" onClick={() => setConfirming('antecipado')}>Finalizar antecipadamente</button>
          {confirming && (
            <div role="alertdialog" aria-labelledby="cf-t" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/40">
              <p id="cf-t" className="font-semibold">Finalizar e corrigir agora?</p>
              <p className="mt-1">{st.pending > 0 ? `${st.pending} questão(ões) em branco contarão como erradas.` : 'Todas as questões foram respondidas.'}</p>
              <div className="mt-3 flex gap-2">
                <button className="btn-primary" onClick={() => finish(confirming === 'antecipado' && st.pending > 0 ? 'antecipado' : 'finalizado')}>Sim, finalizar</button>
                <button className="btn-ghost" onClick={() => setConfirming(null)}>Continuar respondendo</button>
              </div>
            </div>
          )}
          <p className="muted mt-4 text-xs">O andamento e o horário de início ficam salvos: recarregar a página não reinicia o tempo.</p>
        </Card>
      </>
    );
  }

  if (result) return <ExamResult attempt={result} onBack={() => setResultId(null)} />;

  const trainingCount = Math.min(TRAINING_MAX_QUESTIONS, questions.length);
  return (
    <>
      <PageTitle title="Simulados" subtitle={`Simulado completo: ${FULL_EXAM_QUESTIONS} questões distintas em 1 h 50 min. Avaliação didática — não é exame oficial de certificação.`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card aria-labelledby="sc">
          <h2 id="sc" className="text-lg">Simulado completo</h2>
          <p className="muted mt-1 text-sm">Usa somente questões revisadas por uma pessoa.</p>
          <p className="mt-4 text-sm">
            Questões revisadas disponíveis: <b>{elig.eligible}</b> de {elig.required} necessárias.
          </p>
          <ProgressBar className="mt-2" value={elig.eligible / elig.required} label="Questões revisadas disponíveis" />
          {!elig.canStart && (
            <div className="mt-4">
              <Callout tone="atencao" title={`Simulado completo indisponível: faltam ${elig.missing} questões revisadas`}>
                O banco ainda não tem {elig.required} questões revisadas. As questões do piloto aguardam revisão humana e as herdadas da v1 são provisórias. Isso será resolvido na etapa de ampliação e revisão do banco.
              </Callout>
            </div>
          )}
          <button className="btn-primary mt-4 w-full" disabled={!elig.canStart} onClick={() => update((d) => startExam(d, createExam(questions, 'completo', Date.now())))}>
            <Play size={16} aria-hidden="true" /> Iniciar simulado completo
          </button>
        </Card>
        <Card aria-labelledby="st">
          <h2 id="st" className="text-lg">Simulado de treino</h2>
          <p className="muted mt-1 text-sm">
            {trainingCount} questões distintas, {formatMinutes((trainingCount * 110) / 60)} de prova (mesmo ritmo do completo). Inclui questões pendentes de revisão e provisórias, sempre identificadas. Serve para praticar o formato; não tem valor certificador.
          </p>
          <button className="btn-secondary mt-4 w-full" onClick={() => update((d) => startExam(d, createExam(questions, 'treino', Date.now())))}>
            <Play size={16} aria-hidden="true" /> Iniciar treino
          </button>
        </Card>
      </div>
      <Card className="mt-6" aria-labelledby="hist">
        <h2 id="hist" className="text-lg">Histórico de simulados</h2>
        {data.exams.length === 0 ? (
          <p className="muted mt-2 text-sm">Nenhum simulado realizado.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {[...data.exams].reverse().map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 py-2 dark:border-slate-800">
                <span>{new Date(e.finishedAt).toLocaleString('pt-BR')} · {e.mode} · {e.reason}</span>
                <span className="flex items-center gap-3">
                  <b>{e.correct}/{e.total} ({pct(e.total ? e.correct / e.total : 0)})</b>
                  <button className="link" onClick={() => setResultId(e.id)}>ver correção</button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

function ExamResult({ attempt, onBack }: { attempt: ExamAttempt; onBack: () => void }) {
  const byModule = resultByModule(attempt, getQuestion);
  const weak = byModule.filter((r) => r.total >= 2 && r.correct / r.total < 0.6);
  return (
    <>
      <PageTitle title="Resultado do simulado" subtitle={`${attempt.mode === 'completo' ? 'Simulado completo' : 'Treino'} · ${new Date(attempt.finishedAt).toLocaleString('pt-BR')} · ${attempt.reason === 'tempo-esgotado' ? 'tempo esgotado' : attempt.reason}`} />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <Card>
            <p className="text-5xl font-extrabold text-primary dark:text-primary-dark">{pct(attempt.total ? attempt.correct / attempt.total : 0)}</p>
            <p className="muted mt-2">{attempt.correct} de {attempt.total} · tempo usado {formatDuration(attempt.usedSec)}</p>
          </Card>
          <Card aria-labelledby="pa">
            <h2 id="pa" className="text-lg">Resultado por assunto</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {byModule.map((r) => (
                <li key={r.key}>
                  <div className="mb-1 flex justify-between gap-2"><span>{r.key} · {getModule(r.key)?.title}</span><b>{r.correct}/{r.total}</b></div>
                  <ProgressBar value={r.correct / r.total} label={`Acertos em ${r.key}`} />
                </li>
              ))}
            </ul>
            <p className="muted mt-3 text-xs">Assuntos com uma única questão não permitem conclusões ("dados insuficientes").</p>
          </Card>
          <Card aria-labelledby="rv">
            <h2 id="rv" className="text-lg">Recomendações de revisão</h2>
            {weak.length ? (
              <ul className="mt-2 space-y-1 text-sm">{weak.map((r) => <li key={r.key}><Link to={`/modulo/${r.key}`} className="link">Revisar {r.key} · {getModule(r.key)?.title}</Link></li>)}</ul>
            ) : (
              <p className="muted mt-2 text-sm">Nenhum assunto com pelo menos 2 questões ficou abaixo de 60%.</p>
            )}
          </Card>
          <button className="btn-secondary w-full" onClick={onBack}>Voltar aos simulados</button>
        </div>
        <Card aria-labelledby="corr">
          <h2 id="corr" className="text-lg">Correção comentada</h2>
          <ol className="mt-4 space-y-6">
            {attempt.answers.map((a, i) => {
              const q = getQuestion(a.questionId);
              return q ? (
                <li key={a.questionId} className="border-t border-slate-200 pt-4 dark:border-slate-800">
                  <QuestionCard question={q} index={i} selected={a.chosen} onSelect={() => undefined} revealed />
                </li>
              ) : null;
            })}
          </ol>
        </Card>
      </div>
    </>
  );
}
