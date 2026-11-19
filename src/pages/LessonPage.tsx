import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import type { Block, Lesson, Question } from '../types/curriculum';
import { useStore } from '../store/StoreContext';
import { Link } from '../router';
import { getLesson, getModule, getQuestion, getReference, getTerm } from '../content';
import { bestCheckScore, lessonTheoryDone } from '../services/mastery';
import { markLessonOpened, recordCheck } from '../services/actions';
import { Card, Callout, ContentBadge, ExternalLink, PageTitle, RichText, Chip, pct } from '../components/ui';
import { Diagram } from '../components/Diagrams';
import { QuestionCard } from '../components/QuestionCard';
import { DoubtBox, NoteBox, ReportBox } from '../components/Notes';

export function BlockView({ b }: { b: Block }) {
  switch (b.type) {
    case 'p': return <p className="leading-7"><RichText text={b.text} /></p>;
    case 'h': return <h2 className="pt-4 text-xl">{b.text}</h2>;
    case 'list': {
      const L = b.ordered ? 'ol' : 'ul';
      return <L className={`${b.ordered ? 'list-decimal' : 'list-disc'} space-y-1 pl-6 leading-7`}>{b.items.map((i, k) => <li key={k}><RichText text={i} /></li>)}</L>;
    }
    case 'term':
      return (
        <dl className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <dt className="font-bold">
            {b.term} {b.english && <span className="muted font-normal">— em inglês: <i lang="en">{b.english}</i></span>}
          </dt>
          <dd className="mt-1 leading-7">{b.definition}</dd>
        </dl>
      );
    case 'analogy': return <Callout tone="info" title={b.title}>{b.text}</Callout>;
    case 'example':
      return (
        <div className={`rounded-xl border-l-4 p-4 text-sm ${b.kind === 'correto' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' : 'border-red-500 bg-red-50 dark:bg-red-950/40'}`}>
          <p className="flex items-center gap-2 font-bold">
            {b.kind === 'correto' ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
            Exemplo {b.kind}
          </p>
          <p className="mt-1 italic">{b.text}</p>
          <p className="mt-1"><b>Por quê:</b> {b.why}</p>
        </div>
      );
    case 'misconception':
      return (
        <div className="rounded-xl bg-amber-50 p-4 text-sm dark:bg-amber-950/40">
          <p className="font-bold">Erro de interpretação comum</p>
          <p className="mt-1"><span className="font-semibold text-red-700 dark:text-red-400">Ideia errada:</span> {b.wrong}</p>
          <p className="mt-1"><span className="font-semibold text-emerald-700 dark:text-emerald-400">O correto:</span> {b.right}</p>
        </div>
      );
    case 'callout': return <Callout tone={b.tone} title={b.title}>{b.text}</Callout>;
    case 'diagram': return <Diagram id={b.diagram} caption={b.caption} />;
    case 'summary':
      return (
        <section className="rounded-xl bg-primary-soft p-4 dark:bg-slate-800" aria-label="Resumo dos conceitos essenciais">
          <h2 className="text-lg">Resumo</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">{b.items.map((i, k) => <li key={k}>{i}</li>)}</ul>
        </section>
      );
  }
}

type Phase = { kind: 'idle' } | { kind: 'answering'; mode: 'assistido' | 'independente' } | { kind: 'result'; mode: 'assistido' | 'independente'; correct: number; total: number };

function LessonCheck({ lesson, threshold, phase, setPhase }: { lesson: Lesson; threshold: number; phase: Phase; setPhase: (p: Phase) => void }) {
  const { data, update, toast } = useStore();
  const qs = lesson.checkQuestionIds.map((id) => getQuestion(id)).filter((q): q is Question => !!q);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [conf, setConf] = useState<Record<string, 1 | 2 | 3>>({});
  const best = bestCheckScore(lesson.id, data);
  const attempts = data.checkAttempts.filter((c) => c.lessonId === lesson.id);
  const allAnswered = qs.every((q) => answers[q.id] !== undefined);

  const start = (mode: 'assistido' | 'independente') => {
    setAnswers({});
    setConf({});
    setPhase({ kind: 'answering', mode });
  };
  const submit = () => {
    if (phase.kind !== 'answering') return;
    const items = qs.map((q) => ({ question: q, chosen: answers[q.id] ?? null, confidence: conf[q.id] }));
    const correct = items.filter((i) => i.chosen === i.question.correct).length;
    update((d) => recordCheck(d, lesson.id, phase.mode, items));
    setPhase({ kind: 'result', mode: phase.mode, correct, total: qs.length });
    toast(correct / qs.length >= threshold ? 'Verificação concluída: teoria da lição registrada.' : 'Verificação registrada. Revise e tente novamente.', correct / qs.length >= threshold ? 'sucesso' : 'info');
  };

  return (
    <Card aria-labelledby="verif">
      <h2 id="verif" className="text-xl">Verifique sua compreensão</h2>
      <p className="muted mt-1 text-sm">
        {qs.length} questões. Para concluir a teoria desta lição: {Math.ceil(threshold * qs.length)} acertos ({pct(threshold)}). Tentativas ilimitadas.
        {best && <> Melhor resultado: <b>{pct(best.ratio)}</b> ({best.mode}). Tentativas: {attempts.length}.</>}
      </p>

      {phase.kind === 'idle' && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <button className="rounded-xl border-2 border-slate-200 p-4 text-left hover:border-primary dark:border-slate-700" onClick={() => start('assistido')}>
            <p className="flex items-center gap-2 font-bold"><BookOpen size={18} aria-hidden="true" /> Estudo assistido</p>
            <p className="muted mt-1 text-sm">O texto da lição continua visível. Conta para concluir a teoria, mas não como evidência de domínio.</p>
          </button>
          <button className="rounded-xl border-2 border-slate-200 p-4 text-left hover:border-primary dark:border-slate-700" onClick={() => start('independente')}>
            <p className="flex items-center gap-2 font-bold"><EyeOff size={18} aria-hidden="true" /> Avaliação independente</p>
            <p className="muted mt-1 text-sm">O texto fica oculto enquanto você responde. Conta como evidência de domínio dos objetivos.</p>
          </button>
        </div>
      )}

      {phase.kind === 'answering' && (
        <div className="mt-4 space-y-6">
          <Chip tone={phase.mode === 'independente' ? 'ok' : 'info'}>{phase.mode === 'independente' ? 'Modo independente: sem consulta' : 'Modo assistido: consulta permitida'}</Chip>
          {qs.map((q, i) => (
            <div key={q.id} className="border-t border-slate-200 pt-4 dark:border-slate-800">
              <QuestionCard question={q} index={i} selected={answers[q.id] ?? null} onSelect={(c) => setAnswers((a) => ({ ...a, [q.id]: c }))} revealed={false} confidence={conf[q.id]} onConfidence={(c) => setConf((s) => ({ ...s, [q.id]: c }))} showMeta={false} />
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" disabled={!allAnswered} onClick={submit}>
              Corrigir respostas {!allAnswered && `(${Object.keys(answers).length}/${qs.length})`}
            </button>
            <button className="btn-ghost" onClick={() => setPhase({ kind: 'idle' })}>Cancelar</button>
          </div>
        </div>
      )}

      {phase.kind === 'result' && (
        <div className="mt-4 space-y-6">
          <p role="status" className={`rounded-xl p-4 font-semibold ${phase.correct / phase.total >= threshold ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'}`}>
            {phase.correct}/{phase.total} ({pct(phase.correct / phase.total)}) no modo {phase.mode}.{' '}
            {phase.correct / phase.total >= threshold ? 'Teoria desta lição concluída.' : 'Abaixo de 80%: leia as explicações abaixo, revise a lição e tente de novo.'}
          </p>
          {qs.map((q, i) => (
            <div key={q.id} className="border-t border-slate-200 pt-4 dark:border-slate-800">
              <QuestionCard question={q} index={i} selected={answers[q.id] ?? null} onSelect={() => undefined} revealed showMeta={false} />
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={() => setPhase({ kind: 'idle' })}>Nova tentativa</button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function LessonPage({ lessonId }: { lessonId: string }) {
  const { data, update } = useStore();
  const lesson = getLesson(lessonId);
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  useEffect(() => {
    if (lesson) update((d) => markLessonOpened(d, lesson.id));
    setPhase({ kind: 'idle' });
  }, [lesson, update]);
  if (!lesson) return <p>Lição não encontrada. <Link to="/mundo/1" className="link">Voltar</Link></p>;
  const m = getModule(lesson.moduleId)!;
  const idx = m.lessons.findIndex((l) => l.id === lesson.id);
  const prev = m.lessons[idx - 1];
  const next = m.lessons[idx + 1];
  const hidden = phase.kind === 'answering' && phase.mode === 'independente';
  const done = lessonTheoryDone(lesson.id, data, m.mastery.theoryThreshold);

  return (
    <>
      <p className="muted mb-2 text-sm">
        <Link to={`/modulo/${m.id}/entender`} className="link">{m.id} · {m.title}</Link> · Lição {idx + 1} de {m.lessons.length}
      </p>
      <PageTitle title={`${lesson.id} · ${lesson.title}`}>
        <div className="flex flex-wrap gap-2">
          <ContentBadge status={lesson.status} />
          <Chip>~{lesson.estimatedMinutes} min</Chip>
          {done && <Chip tone="ok">Teoria concluída</Chip>}
        </div>
      </PageTitle>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-6">
          <Card aria-labelledby="meta">
            <h2 id="meta" className="text-lg">Objetivo desta lição</h2>
            <p className="mt-2 leading-7">{lesson.goal}</p>
            <p className="muted mt-3 text-sm"><b>Pré-requisitos:</b> {lesson.prerequisites.join(' ')}</p>
          </Card>

          {hidden ? (
            <Card>
              <p className="flex items-center gap-2 font-semibold"><EyeOff size={18} aria-hidden="true" /> Texto oculto durante a avaliação independente.</p>
              <p className="muted mt-1 text-sm">Ele volta assim que você corrigir ou cancelar.</p>
            </Card>
          ) : (
            <Card as="article" aria-label="Conteúdo da lição">
              <div className="prose-lesson space-y-4">
                {lesson.blocks.map((b, i) => <BlockView key={i} b={b} />)}
              </div>
            </Card>
          )}

          <LessonCheck lesson={lesson} threshold={m.mastery.theoryThreshold} phase={phase} setPhase={setPhase} />

          <nav aria-label="Navegação entre lições" className="flex flex-wrap justify-between gap-2">
            {prev ? <Link to={`/aula/${prev.id}`} className="btn-secondary"><ArrowLeft size={16} aria-hidden="true" /> {prev.id}</Link> : <span />}
            {next ? <Link to={`/aula/${next.id}`} className="btn-primary">{next.id} · {next.title} <ArrowRight size={16} aria-hidden="true" /></Link> : <Link to={`/modulo/${m.id}/praticar`} className="btn-primary">Ir para o Nível 2 · Praticar <ArrowRight size={16} aria-hidden="true" /></Link>}
          </nav>
        </div>

        <aside className="space-y-6" aria-label="Apoio à lição">
          {!hidden && (
            <Card aria-labelledby="gl">
              <h2 id="gl" className="text-lg">Glossário da lição</h2>
              <dl className="mt-3 space-y-3 text-sm">
                {lesson.glossaryIds.map((id) => {
                  const t = getTerm(id);
                  return t ? (
                    <div key={id}>
                      <dt className="font-semibold">{t.term}</dt>
                      <dd className="muted">{t.definition}</dd>
                    </div>
                  ) : null;
                })}
              </dl>
            </Card>
          )}
          <Card aria-labelledby="fontes">
            <h2 id="fontes" className="text-lg">Fontes e materiais gratuitos</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {lesson.referenceIds.map((id) => {
                const r = getReference(id);
                return r ? (
                  <li key={id}>
                    <ExternalLink href={r.url}>{r.title}</ExternalLink>
                    <span className="muted block text-xs">{r.organization} · {r.language}</span>
                  </li>
                ) : null;
              })}
            </ul>
          </Card>
          <NoteBox id={lesson.id} />
          <DoubtBox targetId={lesson.id} />
          <ReportBox targetId={lesson.id} />
        </aside>
      </div>
    </>
  );
}
