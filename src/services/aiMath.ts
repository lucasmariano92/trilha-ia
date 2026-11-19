/**
 * Cálculos didáticos usados nas demonstrações do Mundo 1.
 * São versões simplificadas e transparentes dos mecanismos reais.
 */

/**
 * Aplica temperatura a uma distribuição de probabilidades: p_i^(1/T), renormalizado.
 * Equivale a dividir os logits por T antes do softmax. T = 0 → escolhe sempre o mais provável.
 */
export function applyTemperature(probs: number[], t: number): number[] {
  if (!probs.length) return [];
  if (t <= 0) {
    const max = Math.max(...probs);
    const idx = probs.indexOf(max);
    return probs.map((_, i) => (i === idx ? 1 : 0));
  }
  const logs = probs.map((p) => Math.log(Math.max(p, 1e-12)) / t);
  const m = Math.max(...logs);
  const exps = logs.map((l) => Math.exp(l - m));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

/** Similaridade de cosseno entre dois vetores: 1 = mesma direção, 0 = sem relação, −1 = opostos. */
export function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length || !a.length) throw new Error('Vetores de tamanhos diferentes.');
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export interface Msg { id: string; tokens: number; pinned?: boolean }

/**
 * Estratégia comum de corte: mantém as mensagens fixas (instruções do sistema) e as mais recentes
 * que couberem na janela, reservando espaço para a resposta. As mais antigas saem primeiro.
 */
export function fitContext(messages: Msg[], windowTokens: number, reservedOutput: number): { kept: string[]; dropped: string[]; used: number } {
  let budget = windowTokens - reservedOutput;
  const kept = new Set<string>();
  for (const m of messages.filter((x) => x.pinned)) {
    budget -= m.tokens;
    kept.add(m.id);
  }
  for (const m of [...messages].reverse()) {
    if (m.pinned) continue;
    if (m.tokens <= budget) {
      kept.add(m.id);
      budget -= m.tokens;
    } else break; // não "pula" mensagens: a conversa precisa continuar contínua
  }
  const keptList = messages.filter((m) => kept.has(m.id)).map((m) => m.id);
  return { kept: keptList, dropped: messages.filter((m) => !kept.has(m.id)).map((m) => m.id), used: messages.filter((m) => kept.has(m.id)).reduce((s, m) => s + m.tokens, 0) };
}

/** Custo em dólares de uma chamada, com preços por MILHÃO de tokens. */
export function callCost(inputTokens: number, outputTokens: number, pricePerMInput: number, pricePerMOutput: number): number {
  return (inputTokens * pricePerMInput + outputTokens * pricePerMOutput) / 1_000_000;
}

/** Converte texto digitado ("0,5", "1.200", "1 200") em número. */
export function parseNumberBR(raw: string): number | null {
  const s = raw.trim().replace(/\s/g, '');
  if (!s) return null;
  let norm = s;
  if (s.includes(',')) norm = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) norm = s.replace(/\./g, '');
  const n = Number(norm);
  return Number.isFinite(n) ? n : null;
}
