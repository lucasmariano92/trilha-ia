/**
 * Medição de tempo de estudo ATIVO.
 * Regra do prompt: não marcar tempo como estudado só porque a página ficou aberta.
 * Conta apenas intervalos em que a aba estava visível E houve interação (tecla, clique,
 * rolagem, toque ou movimento) nos últimos IDLE_LIMIT_MS.
 */
export const IDLE_LIMIT_MS = 90_000;
export const TICK_MS = 15_000;

/**
 * Segundos a creditar entre o último tique e agora.
 * Só credita o trecho até (última interação + limite de inatividade), e nada se a aba estava oculta.
 */
export function accrueSeconds(lastTickMs: number, nowMs: number, lastInteractionMs: number, visible: boolean, idleLimitMs = IDLE_LIMIT_MS): number {
  if (!visible || nowMs <= lastTickMs) return 0;
  const activeUntil = Math.min(nowMs, lastInteractionMs + idleLimitMs);
  if (activeUntil <= lastTickMs) return 0;
  // limita cada tique a 2× o intervalo esperado, para não creditar suspensões do computador
  return Math.floor(Math.min(activeUntil - lastTickMs, TICK_MS * 2) / 1000);
}
