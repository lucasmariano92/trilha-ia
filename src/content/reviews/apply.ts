import type { Question } from '../../types/curriculum';

type Idx = 0 | 1 | 2 | 3;

export interface ReviewItem {
  decision: 'aprovada' | 'reescrita' | 'descartada';
  comment?: string;
  stem?: string;
  options?: string[];
  correct?: number;
  rationale?: string;
  distractorRationales?: Record<string, string>;
  referenceIds?: string[];
  difficulty?: Question['difficulty'];
}

export interface ReviewFile {
  source: string;
  reviewedOn: string;
  /** Quem fez a revisão. Só revisões humanas podem aprovar questões. */
  kind?: 'humana' | 'assistente';
  items: Record<string, ReviewItem>;
}

const fmt = (iso: string) => iso.split('-').reverse().join('/');

/**
 * Aplica as decisões de uma revisão humana ao banco de questões.
 * - aprovada: passa a "revisada" (entra no simulado completo).
 * - reescrita: usa o texto revisado, com as alternativas na ordem exata da planilha
 *   (sem novo embaralhamento), e continua "pendente-revisao" até a validação final.
 * - descartada: sai do banco.
 * Questões sem decisão ficam como estavam.
 */
export function applyReview(list: Question[], review: ReviewFile): Question[] {
  const date = fmt(review.reviewedOn);
  const byAssistant = review.kind === 'assistente';
  const out: Question[] = [];
  for (const q of list) {
    const item = review.items[q.id];
    if (!item) {
      out.push(q);
      continue;
    }
    if (item.decision === 'descartada') continue;
    if (item.decision === 'aprovada') {
      if (byAssistant) throw new Error(`Revisão do assistente não pode aprovar questões (${q.id}).`);
      out.push({ ...q, review: 'revisada', reviewNote: `Aprovada em revisão humana em ${date}.` });
      continue;
    }
    const options = item.options as [string, string, string, string];
    const distractorRationales: Partial<Record<Idx, string>> = {};
    for (const [k, v] of Object.entries(item.distractorRationales ?? {})) distractorRationales[Number(k) as Idx] = v;
    out.push({
      ...q,
      stem: item.stem!,
      options,
      correct: item.correct as Idx,
      rationale: item.rationale!,
      distractorRationales,
      referenceIds: item.referenceIds ?? q.referenceIds,
      difficulty: item.difficulty ?? q.difficulty,
      review: 'pendente-revisao',
      reviewNote: byAssistant
        ? `Alternativas ajustadas pelo assistente em ${date} para remover pistas de resposta; aguarda validação final por uma pessoa.`
        : `Reescrita na revisão editorial de ${date}; aguarda validação final por uma pessoa.`,
    });
  }
  return out;
}
