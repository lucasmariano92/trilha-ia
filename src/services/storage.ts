import type { UserData } from '../types/progress';
import { emptyUserData, looksLikeV1, migrateV1, sanitizeUserData } from './schema';

/**
 * Persistência local. Os dados pessoais ficam SOMENTE neste navegador (localStorage):
 * - não são criptografados;
 * - podem ser perdidos se o navegador apagar os dados do site;
 * - não são sincronizados entre dispositivos.
 * Nunca armazenar senhas, tokens ou chaves de API.
 *
 * A interface KeyValueStore permite trocar por IndexedDB ou por uma API com autenticação no futuro.
 */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const KEYS = {
  data: 'trilha-ia:v2:dados',
  preImport: 'trilha-ia:v2:antes-da-importacao',
  corrupted: 'trilha-ia:v2:corrompido',
  legacyV1: 'trilha-ia-v1',
  legacyExam: 'trilha-exam',
} as const;

export type LoadSource = 'v2' | 'v1-migrado' | 'novo' | 'corrompido';

export interface LoadResult {
  data: UserData;
  source: LoadSource;
  warnings: string[];
  legacyPresent: boolean;
}

export function loadUserData(store: KeyValueStore, nowIso: string = new Date().toISOString()): LoadResult {
  const legacyRaw = safeGet(store, KEYS.legacyV1);
  const raw = safeGet(store, KEYS.data);
  if (raw) {
    try {
      const r = sanitizeUserData(JSON.parse(raw));
      return { data: r.data, source: 'v2', warnings: r.warnings, legacyPresent: !!legacyRaw };
    } catch (e) {
      // Guarda uma cópia do conteúdo ilegível para recuperação manual e começa do zero.
      try {
        store.setItem(KEYS.corrupted, raw);
      } catch {
        /* sem espaço: segue sem a cópia */
      }
      return {
        data: emptyUserData(nowIso), source: 'corrompido', legacyPresent: !!legacyRaw,
        warnings: [`Os dados salvos estavam ilegíveis (${(e as Error).message}). Uma cópia foi guardada e o progresso foi reiniciado. Restaure um backup em Configurações → Backup.`],
      };
    }
  }
  if (legacyRaw) {
    try {
      const parsed = JSON.parse(legacyRaw);
      if (looksLikeV1(parsed)) {
        const r = migrateV1(parsed, nowIso);
        return { data: r.data, source: 'v1-migrado', warnings: r.warnings, legacyPresent: true };
      }
    } catch {
      /* v1 ilegível: ignora */
    }
  }
  return { data: emptyUserData(nowIso), source: 'novo', warnings: [], legacyPresent: !!legacyRaw };
}

export function saveUserData(store: KeyValueStore, data: UserData): { ok: true } | { ok: false; error: string } {
  try {
    store.setItem(KEYS.data, JSON.stringify(data));
    return { ok: true };
  } catch (e) {
    const quota = e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22);
    return { ok: false, error: quota ? 'Espaço de armazenamento do navegador esgotado. Exporte um backup e apague registros antigos.' : 'Não foi possível salvar no navegador (armazenamento indisponível ou bloqueado).' };
  }
}

function safeGet(store: KeyValueStore, key: string): string | null {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

export function removeLegacy(store: KeyValueStore) {
  store.removeItem(KEYS.legacyV1);
  store.removeItem(KEYS.legacyExam);
}

/** Apaga TODOS os dados pessoais deste aplicativo neste navegador. */
export function wipeAll(store: KeyValueStore) {
  for (const k of Object.values(KEYS)) store.removeItem(k);
}

/** Store em memória, para testes e para navegadores com armazenamento bloqueado. */
export function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { dump(): Record<string, string> } {
  const m = new Map(Object.entries(initial));
  return {
    getItem: (k) => (m.has(k) ? m.get(k)! : null),
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
    dump: () => Object.fromEntries(m),
  };
}

export function browserStore(): KeyValueStore {
  try {
    const t = '__trilha_teste__';
    window.localStorage.setItem(t, t);
    window.localStorage.removeItem(t);
    return window.localStorage;
  } catch {
    return memoryStore();
  }
}
