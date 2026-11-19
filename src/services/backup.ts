import type { UserData } from '../types/progress';
import { SCHEMA_VERSION } from '../types/progress';
import { looksLikeV1, migrateV1, sanitizeUserData, SchemaError } from './schema';
import { LIMITS } from './validate';

export const BACKUP_FORMAT = 'trilha-ia-backup';
export const BACKUP_FORMAT_VERSION = 1;
export const APP_VERSION = '2.0.0-alpha.4';

export const BACKUP_NOTICE =
  'Este arquivo contém seus dados de estudo (respostas, anotações, dúvidas e projetos). Ele NÃO é criptografado: guarde-o em local protegido e não o compartilhe.';

export function exportBackup(data: UserData, now: Date = new Date()): string {
  return JSON.stringify(
    {
      format: BACKUP_FORMAT, formatVersion: BACKUP_FORMAT_VERSION, schemaVersion: SCHEMA_VERSION,
      appVersion: APP_VERSION, exportedAt: now.toISOString(), notice: BACKUP_NOTICE, data,
    },
    null,
    2,
  );
}

export interface BackupSummary {
  exportedAt?: string;
  origin: 'backup-v2' | 'dados-v1';
  answers: number;
  checks: number;
  activities: number;
  flashcards: number;
  doubts: number;
  notes: number;
  projects: number;
  exams: number;
  activeExam: boolean;
}

export type ParseResult =
  | { ok: true; data: UserData; summary: BackupSummary; warnings: string[] }
  | { ok: false; error: string };

export function summarize(data: UserData, origin: BackupSummary['origin'], exportedAt?: string): BackupSummary {
  return {
    exportedAt, origin, answers: data.answers.length, checks: data.checkAttempts.length,
    activities: data.activityAttempts.length, flashcards: Object.keys(data.flashcards).length,
    doubts: data.doubts.length, notes: Object.keys(data.notes).length, projects: Object.keys(data.projects).length,
    exams: data.exams.length, activeExam: !!data.activeExam,
  };
}

/** Lê e valida um arquivo de backup. Nunca lança exceção: devolve { ok:false, error }. */
export function parseBackup(text: string): ParseResult {
  if (typeof text !== 'string' || !text.trim()) return { ok: false, error: 'O arquivo está vazio.' };
  if (new Blob([text]).size > LIMITS.backupBytes) return { ok: false, error: 'O arquivo é maior que 5 MB e foi recusado.' };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'O arquivo não é um JSON válido (pode estar corrompido ou incompleto).' };
  }
  try {
    if (raw && typeof raw === 'object' && (raw as Record<string, unknown>).format === BACKUP_FORMAT) {
      const env = raw as Record<string, unknown>;
      if (typeof env.formatVersion !== 'number' || env.formatVersion > BACKUP_FORMAT_VERSION) {
        return { ok: false, error: 'Formato de backup de uma versão mais nova do aplicativo.' };
      }
      const r = sanitizeUserData(env.data);
      const exportedAt = typeof env.exportedAt === 'string' ? env.exportedAt.slice(0, 40) : undefined;
      return { ok: true, data: r.data, summary: summarize(r.data, 'backup-v2', exportedAt), warnings: r.warnings };
    }
    if (looksLikeV1(raw)) {
      const r = migrateV1(raw);
      return { ok: true, data: r.data, summary: summarize(r.data, 'dados-v1'), warnings: r.warnings };
    }
    return { ok: false, error: 'O arquivo não é um backup da Trilha IA.' };
  } catch (e) {
    return { ok: false, error: e instanceof SchemaError ? e.message : 'Backup inválido.' };
  }
}
