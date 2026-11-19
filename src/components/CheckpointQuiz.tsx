import { useState } from 'react';
import type { Question } from '../types/curriculum';
import { useStore } from '../store/StoreContext';
import { recordCheck } from '../services/actions';
import { selectQuestions } from '../services/exam';
import { CHECKPOINT_QUIZ_SIZE, CHECKPOINT_QUIZ_THRESHOLD, checkpointQuizBest, checkpointQuizId, checkpointQuizPool } from '../services/progress';
import { QuestionCard } from './QuestionCard';
import { pct } from './ui';

/** Avaliação prática do checkpoint: questões sem consulta, sorteadas dos módulos do mundo. */
export function CheckpointQuiz({ worldId }: { worldId: number }) {
  const { data, update, toast } = useStore();
  const pool = checkpointQuizPool(worldId);
  const [qs, setQs] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const best = checkpointQuizBest(worldId, data);
  if (pool.length < CHECKPOINT_QUIZ_SIZE) return null;

  const start = () => {
    setQs(selectQuestions(pool, CHECKPOINT_QUIZ_SIZE, Date.now()));
    setAnswers({});
    setDone(false);
  };
  const correct = qs ? qs.filter((q) => answers[q.id] === q.correct).length : 0;
  const submit = () => {
    if (!qs) return;
    update((d) => recordCheck(d, checkpointQuizId(worldId), 'independente', qs.map((q) => ({ question: q, chosen: answers[q.id] ?? null }))));
    setDone(true);
    toast(correct / qs.length >= CHECKPOINT_QUIZ_THRESHOLD ? 'Avaliação prática aprovada.' : 'Avaliação registrada. Revise e tente de novo.', correct / qs.length >= CHECKPOINT_QUIZ_THRESHOLD ? 'sucesso' : 'info');
  };

  return (
    <div className="mt-4 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
      <p className="font-semibold">Avaliação prática do checkpoint</p>
      <p className="muted mt-1 text-sm">
        {CHECKPOINT_QUIZ_SIZE} questões sorteadas dos módulos do mundo, sem consulta. Mínimo de {pct(CHECKPOINT_QUIZ_THRESHOLD)}. Complementa a autoavaliação do PDF.
        {best !== null && <> Melhor resultado: <b>{pct(best)}</b>.</>}
      </p>
      {!qs ? (
        <button className="btn-secondary mt-3" onClick={start}>Iniciar avaliação</button>
      ) : (
        <div className="mt-4 space-y-5">
          {qs.map((q, i) => (
            <div key={q.id} className="border-t border-slate-200 pt-3 dark:border-slate-800">
              <QuestionCard question={q} index={i} selected={answers[q.id] ?? null} onSelect={(c) => setAnswers((a) => ({ ...a, [q.id]: c }))} revealed={done} showMeta={false} />
            </div>
          ))}
          {!done ? (
            <button className="btn-primary" disabled={Object.keys(answers).length < qs.length} onClick={submit}>
              Corrigir ({Object.keys(answers).length}/{qs.length})
            </button>
          ) : (
            <div className="space-y-2">
              <p role="status" className="font-semibold">{correct}/{qs.length} ({pct(correct / qs.length)}) — {correct / qs.length >= CHECKPOINT_QUIZ_THRESHOLD ? 'aprovado.' : 'abaixo do mínimo.'}</p>
              <button className="btn-secondary" onClick={start}>Nova avaliação</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
