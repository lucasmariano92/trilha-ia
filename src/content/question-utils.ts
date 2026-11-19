import type { Question } from '../types/curriculum';

type Idx = 0 | 1 | 2 | 3;

/**
 * Reposiciona a alternativa correta no índice `target`, preservando a ordem relativa das
 * demais e remapeando as explicações das alternativas incorretas.
 * Usado para equilibrar a posição do gabarito (evita que "B" seja sempre a resposta).
 */
export function placeCorrect(
  options: [string, string, string, string],
  correct: Idx,
  rationales: Partial<Record<Idx, string>> | undefined,
  target: Idx,
): { options: [string, string, string, string]; correct: Idx; distractorRationales?: Partial<Record<Idx, string>> } {
  const others = ([0, 1, 2, 3] as Idx[]).filter((i) => i !== correct);
  const order: Idx[] = [];
  let k = 0;
  for (let pos = 0; pos < 4; pos++) order.push(pos === target ? correct : others[k++]);
  const newOptions = order.map((i) => options[i]) as [string, string, string, string];
  let newRationales: Partial<Record<Idx, string>> | undefined;
  if (rationales) {
    newRationales = {};
    order.forEach((oldIdx, newIdx) => {
      const r = rationales[oldIdx];
      if (r !== undefined) newRationales![newIdx as Idx] = r;
    });
  }
  return { options: newOptions, correct: target, distractorRationales: newRationales };
}

/** Sequência equilibrada de posições (cada índice aparece o mesmo número de vezes a cada 8). */
const BALANCED: Idx[] = [2, 0, 3, 1, 1, 3, 0, 2];
export const balancedTarget = (n: number): Idx => BALANCED[(n - 1) % BALANCED.length];

export function balance(question: Question, n: number): Question {
  const placed = placeCorrect(question.options, question.correct, question.distractorRationales, balancedTarget(n));
  return { ...question, ...placed };
}
