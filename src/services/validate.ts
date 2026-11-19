/** Limites e validações de entrada (proteção contra dados malformados e exposição acidental). */

export const LIMITS = {
  shortText: 300,
  mediumText: 2_000,
  longText: 20_000,
  doubts: 1_000,
  answers: 50_000,
  reports: 500,
  versions: 100,
  backupBytes: 5 * 1024 * 1024,
} as const;

export const clampText = (s: string, max: number) => (s.length > max ? s.slice(0, max) : s);

/** Aceita apenas URLs https (evita "javascript:", "data:" e afins quando o link é exibido). */
export function isSafeHttpsUrl(value: string): boolean {
  if (!value) return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === 'https:' && !!u.hostname && !u.username && !u.password;
  } catch {
    return false;
  }
}

export function isGithubRepoUrl(value: string): boolean {
  if (!isSafeHttpsUrl(value)) return false;
  const u = new URL(value.trim());
  return u.hostname === 'github.com' && u.pathname.split('/').filter(Boolean).length >= 2;
}

/**
 * Heurística de alerta (NÃO é garantia): detecta textos que parecem conter segredos ou dados
 * pessoais, para avisar o aluno antes de salvar.
 */
const SECRET_PATTERNS: { label: string; re: RegExp }[] = [
  { label: 'chave de API (padrão "sk-…")', re: /\bsk-[A-Za-z0-9_-]{16,}/ },
  { label: 'chave do Google (padrão "AIza…")', re: /\bAIza[0-9A-Za-z_-]{30,}/ },
  { label: 'token do GitHub', re: /\bgh[pousr]_[A-Za-z0-9]{30,}/ },
  { label: 'token de bot do Telegram', re: /\b\d{8,10}:[A-Za-z0-9_-]{35}\b/ },
  { label: 'possível senha', re: /\b(senha|password|passwd)\s*[:=]\s*\S+/i },
  { label: 'CPF', re: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/ },
  { label: 'cartão de crédito', re: /\b(?:\d[ -]?){15,16}\b/ },
];

export function sensitiveWarnings(text: string): string[] {
  return SECRET_PATTERNS.filter((p) => p.re.test(text)).map((p) => p.label);
}
