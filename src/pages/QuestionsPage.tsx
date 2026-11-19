import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { questions, worlds } from '../content';
import { recordAnswers } from '../services/actions';
import { Card, PageTitle, Callout, Chip } from '../components/ui';
import { QuestionCard } from '../components/QuestionCard';
import { ReportBox } from '../components/Notes';

export default function QuestionsPage() {
  const { data, update } = useStore();
  const [world, setWorld] = useState(0);
  const [status, setStatus] = useState<'todas' | 'pendente-revisao' | 'provisoria' | 'revisada'>('todas');
  const [i, setI] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<1 | 2 | 3 | undefined>();
  const [revealed, setRevealed] = useState(false);

  const list = useMemo(() => questions.filter((q) => (world === 0 || q.worldId === world) && (status === 'todas' || q.review === status)), [world, status]);
  const q = list.length ? list[((i % list.length) + list.length) % list.length] : undefined;
  const uses = q ? data.answers.filter((a) => a.questionId === q.id) : [];

  const go = (delta: number) => {
    setI((x) => x + delta);
    setSelected(null);
    setConfidence(undefined);
    setRevealed(false);
  };
  const confirm = () => {
    if (!q || selected === null) return;
    update((d) => recordAnswers(d, [{ question: q, chosen: selected, confidence }], 'treino'));
    setRevealed(true);
  };

  return (
    <>
      <PageTitle title="Banco de questões" subtitle="Treino sem consulta, com correção comentada de todas as alternativas. Cada resposta conta como evidência independente para os objetivos." />
      <Callout tone="atencao" title="Estado do banco">
        {questions.filter((x) => x.review === 'pendente-revisao').length} questões do módulo 1.1 escritas para o piloto (pendentes de revisão humana) e {questions.filter((x) => x.review === 'provisoria').length} provisórias herdadas da v1, com alternativas fracas. Nenhuma está revisada ainda. São autorais e não oficiais.
      </Callout>
      <div className="my-5 flex flex-wrap gap-3">
        <label className="text-sm">
          <span className="label">Mundo</span>
          <select className="field" value={world} onChange={(e) => { setWorld(Number(e.target.value)); go(-i); }}>
            <option value={0}>Todos</option>
            {worlds.map((w) => <option key={w.id} value={w.id}>{w.id}. {w.title}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="label">Estado de revisão</span>
          <select className="field" value={status} onChange={(e) => { setStatus(e.target.value as typeof status); go(-i); }}>
            <option value="todas">Todas</option>
            <option value="pendente-revisao">Pendentes de revisão</option>
            <option value="provisoria">Provisórias</option>
            <option value="revisada">Revisadas</option>
          </select>
        </label>
        <p className="muted self-end text-sm">{list.length} questão(ões)</p>
      </div>
      {q ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <Card aria-label="Questão">
            <p className="muted mb-3 text-xs">Questão {((i % list.length) + list.length) % list.length + 1} de {list.length} · usada {uses.length} vez(es) · id {q.id}</p>
            <QuestionCard question={q} selected={selected} onSelect={setSelected} revealed={revealed} confidence={confidence} onConfidence={setConfidence} />
            {q.reviewNote && revealed && <p className="muted mt-3 text-xs">Nota de revisão: {q.reviewNote}</p>}
            <div className="mt-5 flex flex-wrap justify-between gap-2">
              <button className="btn-ghost" onClick={() => go(-1)}><ChevronLeft size={16} aria-hidden="true" /> Anterior</button>
              {!revealed ? (
                <button className="btn-primary" disabled={selected === null} onClick={confirm}>Confirmar resposta</button>
              ) : (
                <Chip tone={selected === q.correct ? 'ok' : 'aviso'}>{selected === q.correct ? 'Acertou' : 'Errou'}</Chip>
              )}
              <button className="btn-secondary" onClick={() => go(1)}>Próxima <ChevronRight size={16} aria-hidden="true" /></button>
            </div>
          </Card>
          <ReportBox targetId={q.id} />
        </div>
      ) : (
        <p className="muted">Nenhuma questão com esses filtros.</p>
      )}
    </>
  );
}
