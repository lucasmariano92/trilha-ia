import { useState } from 'react';
import type { Challenge } from '../types/curriculum';
import { useStore } from '../store/StoreContext';
import { CHALLENGE_MIN, challengeSubmissionProblems, emptyChallenge, saveChallenge } from '../services/actions';
import { sensitiveWarnings } from '../services/validate';
import { getReference } from '../content';
import { Card, Callout, Chip, ExternalLink } from './ui';

export function ChallengeView({ challenge: c }: { challenge: Challenge }) {
  const { data, update, toast } = useStore();
  const work = data.challenges[c.id] ?? emptyChallenge();
  const [draft, setDraft] = useState({ decisions: work.decisions, evidence: work.evidence, difficulties: work.difficulties, improvements: work.improvements });
  const merged = { ...work, ...draft };
  const problems = challengeSubmissionProblems(merged, c.deliveryChecklist.map((d) => d.id), c.rubric.map((r) => r.id));
  const warn = sensitiveWarnings(Object.values(draft).join('\n'));
  const total = c.rubric.reduce((s, r) => s + (work.rubric[r.id] ?? 0), 0);

  const persist = () => update((d) => saveChallenge(d, c.id, draft));

  const field = (key: keyof typeof draft, label: string, help: string, min?: number) => (
    <div>
      <label htmlFor={`${c.id}-${key}`} className="label">{label}</label>
      <p id={`${c.id}-${key}-h`} className="muted mb-1 text-xs">{help}{min ? ` Mínimo: ${min} caracteres (${draft[key].trim().length} até agora).` : ''}</p>
      <textarea
        id={`${c.id}-${key}`}
        aria-describedby={`${c.id}-${key}-h`}
        className={`field ${key === 'evidence' ? 'min-h-56' : 'min-h-24'}`}
        maxLength={20000}
        value={draft[key]}
        onChange={(e) => setDraft((s) => ({ ...s, [key]: e.target.value }))}
        onBlur={persist}
        disabled={work.status === 'autodeclarado'}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <Card aria-labelledby="desafio">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary dark:text-primary-dark">Nível 3 · Desafio aplicado · ~{c.estimatedMinutes} min</p>
            <h2 id="desafio" className="mt-1 text-xl">{c.title}</h2>
          </div>
          {work.status === 'autodeclarado' ? <Chip tone="ok">Entregue · autodeclarado · pendente de avaliação</Chip> : <Chip>Rascunho</Chip>}
        </div>
        <dl className="mt-4 space-y-4 text-sm leading-6">
          <div><dt className="font-bold">Problema</dt><dd>{c.problem}</dd></div>
          <div><dt className="font-bold">Contexto e cenário</dt><dd>{c.context}</dd></div>
          <div><dt className="font-bold">Resultado esperado</dt><dd>{c.expectedResult}</dd></div>
          <div><dt className="font-bold">Requisitos funcionais</dt><dd><ul className="list-disc pl-5">{c.functionalRequirements.map((r, i) => <li key={i}>{r}</li>)}</ul></dd></div>
          <div><dt className="font-bold">Restrições</dt><dd><ul className="list-disc pl-5">{c.constraints.map((r, i) => <li key={i}>{r}</li>)}</ul></dd></div>
          <div><dt className="font-bold">Etapas sugeridas</dt><dd><ol className="list-decimal pl-5">{c.steps.map((r, i) => <li key={i}>{r}</li>)}</ol></dd></div>
          <div>
            <dt className="font-bold">Materiais de apoio</dt>
            <dd>
              <ul className="list-disc pl-5">
                {c.supportMaterials.map((r, i) => <li key={i}>{r}</li>)}
                {c.supportReferenceIds.map((id) => {
                  const r = getReference(id);
                  return r ? <li key={id}><ExternalLink href={r.url}>{r.title}</ExternalLink></li> : null;
                })}
              </ul>
            </dd>
          </div>
        </dl>
      </Card>

      <Card aria-labelledby="entrega">
        <h2 id="entrega" className="text-lg">Sua entrega</h2>
        <div className="mt-4 space-y-4">
          {field('evidence', 'Evidência: cole aqui o guia (ou um resumo fiel e o link, se estiver publicado)', 'Não inclua dados pessoais nem informações da empresa.', CHALLENGE_MIN.evidence)}
          {field('decisions', 'Decisões', 'Que analogia escolheu e por quê? O que deixou de fora? Usou IA para revisar? Como?', CHALLENGE_MIN.decisions)}
          {field('difficulties', 'Reflexão sobre dificuldades', 'O que foi difícil de explicar? Onde você percebeu que não tinha entendido bem?', CHALLENGE_MIN.difficulties)}
          {field('improvements', 'Possíveis melhorias', `Ideias: ${c.improvementIdeas.join(' · ')}`)}
        </div>
        {warn.length > 0 && <div className="mt-3"><Callout tone="seguranca" title="Possível dado sensível">O texto parece conter {warn.join(', ')}. Remova antes de entregar.</Callout></div>}
      </Card>

      <Card aria-labelledby="check">
        <h2 id="check" className="text-lg">Checklist de entrega</h2>
        <ul className="mt-3 space-y-2">
          {c.deliveryChecklist.map((d) => (
            <li key={d.id}>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1 accent-indigo-600" disabled={work.status === 'autodeclarado'} checked={!!work.checklist[d.id]} onChange={(e) => update((x) => saveChallenge(x, c.id, { ...draft, checklist: { ...work.checklist, [d.id]: e.target.checked } }))} />
                {d.text}
              </label>
            </li>
          ))}
        </ul>
      </Card>

      <Card aria-labelledby="rubrica">
        <h2 id="rubrica" className="text-lg">Autoavaliação pela rubrica</h2>
        <p className="muted mt-1 text-sm">Escolha, com honestidade, o nível que descreve sua entrega em cada critério.</p>
        <div className="mt-4 space-y-5">
          {c.rubric.map((r) => (
            <fieldset key={r.id}>
              <legend className="font-semibold">{r.criterion}</legend>
              <div className="mt-2 grid gap-2 md:grid-cols-4">
                {r.levels.map((l) => (
                  <label key={l.score} className={`option flex items-start gap-2 !p-2 text-xs ${work.rubric[r.id] === l.score ? 'border-primary bg-primary-soft dark:border-primary-dark dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700'}`}>
                    <input type="radio" name={`${c.id}-${r.id}`} className="mt-0.5 accent-indigo-600" disabled={work.status === 'autodeclarado'} checked={work.rubric[r.id] === l.score} onChange={() => update((x) => saveChallenge(x, c.id, { ...draft, rubric: { ...work.rubric, [r.id]: l.score } }))} />
                    <span><b>{l.score}.</b> {l.descriptor}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <p className="mt-4 text-sm">Pontuação autoatribuída: <b>{total}/{c.rubric.length * 4}</b></p>
      </Card>

      <Card aria-labelledby="enviar">
        <h2 id="enviar" className="text-lg">Registrar entrega</h2>
        <Callout tone="atencao" title="Sem avaliação automática">
          Não há um avaliador automático confiável para este desafio. A entrega fica como <b>autodeclarada — pendente de avaliação</b>. Para uma avaliação externa, peça a outra pessoa que use a mesma rubrica.
        </Callout>
        {work.status !== 'autodeclarado' && problems.length > 0 && (
          <ul className="mt-3 list-disc pl-5 text-sm">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {work.status !== 'autodeclarado' ? (
            <>
              <button className="btn-secondary" onClick={() => { persist(); toast('Rascunho salvo.'); }}>Salvar rascunho</button>
              <button
                className="btn-primary"
                disabled={problems.length > 0 || warn.length > 0}
                onClick={() => {
                  update((x) => saveChallenge(x, c.id, { ...draft, status: 'autodeclarado', submittedAt: new Date().toISOString() }));
                  toast('Entrega registrada como autodeclarada.', 'sucesso');
                }}
              >
                Registrar entrega
              </button>
            </>
          ) : (
            <button className="btn-ghost" onClick={() => update((x) => saveChallenge(x, c.id, { status: 'rascunho', submittedAt: undefined }))}>
              Reabrir para editar
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
