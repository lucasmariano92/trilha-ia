import { Fragment, type ReactNode } from 'react';
import { AlertTriangle, ExternalLink as ExtIcon, Info, ShieldAlert, FileText } from 'lucide-react';
import type { ContentStatus, QuestionReview } from '../types/curriculum';
import type { ModuleStatus } from '../services/mastery';
import { STATUS_LABEL } from '../services/mastery';

export function Card({ children, className = '', as: As = 'section', ...rest }: { children: ReactNode; className?: string; as?: 'section' | 'div' | 'article'; 'aria-label'?: string; 'aria-labelledby'?: string }) {
  return (
    <As className={`panel ${className}`} {...rest}>
      {children}
    </As>
  );
}

export function PageTitle({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl md:text-3xl">{title}</h1>
        {subtitle && <p className="muted mt-2 max-w-3xl">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}

export function ProgressBar({ value, label, className = '' }: { value: number; label: string; className?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className={className}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
      >
        <div className="h-full rounded-full bg-primary transition-all dark:bg-primary-dark" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const CONTENT_LABEL: Record<ContentStatus, string> = {
  pdf: 'Fundamentado no PDF',
  complementar: 'Complementar com referência',
  provisorio: 'Provisório',
  pendente: 'Pendente de revisão',
};
const CONTENT_STYLE: Record<ContentStatus, string> = {
  pdf: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  complementar: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  provisorio: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
  pendente: 'bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-300',
};
export function ContentBadge({ status }: { status: ContentStatus }) {
  return <span className={`chip ${CONTENT_STYLE[status]}`}>{CONTENT_LABEL[status]}</span>;
}

const REVIEW_LABEL: Record<QuestionReview, string> = { provisoria: 'Questão provisória', 'pendente-revisao': 'Pendente de revisão', revisada: 'Revisada' };
export function ReviewBadge({ review }: { review: QuestionReview }) {
  const style = review === 'revisada' ? CONTENT_STYLE.pdf : review === 'provisoria' ? CONTENT_STYLE.provisorio : CONTENT_STYLE.pendente;
  return <span className={`chip ${style}`}>{REVIEW_LABEL[review]}</span>;
}

const MOD_STYLE: Record<ModuleStatus, string> = {
  'nao-iniciado': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'em-estudo': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  'teoria-concluida': 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  'pratica-concluida': 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  'aplicacao-entregue': 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  'dominio-demonstrado': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  'revisao-necessaria': 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
};
export function ModuleStatusBadge({ status }: { status: ModuleStatus }) {
  return <span className={`chip ${MOD_STYLE[status]}`}>{STATUS_LABEL[status]}</span>;
}

export function Chip({ children, tone = 'neutro' }: { children: ReactNode; tone?: 'neutro' | 'aviso' | 'ok' | 'info' }) {
  const s = { neutro: MOD_STYLE['nao-iniciado'], aviso: CONTENT_STYLE.provisorio, ok: CONTENT_STYLE.pdf, info: CONTENT_STYLE.complementar }[tone];
  return <span className={`chip ${s}`}>{children}</span>;
}

export function Callout({ tone, title, children }: { tone: 'info' | 'atencao' | 'seguranca' | 'pdf'; title: string; children: ReactNode }) {
  const map = {
    info: { cls: 'border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/50', Icon: Info },
    atencao: { cls: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40', Icon: AlertTriangle },
    seguranca: { cls: 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40', Icon: ShieldAlert },
    pdf: { cls: 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40', Icon: FileText },
  }[tone];
  return (
    <div className={`rounded-xl border-l-4 p-4 text-sm ${map.cls}`} role={tone === 'seguranca' || tone === 'atencao' ? 'note' : undefined}>
      <p className="flex items-center gap-2 font-bold">
        <map.Icon size={16} aria-hidden="true" />
        {title}
      </p>
      <div className="mt-1 leading-6">{children}</div>
    </div>
  );
}

/** Texto com **negrito** simples. Não interpreta HTML (evita injeção). */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <Fragment key={i}>{p}</Fragment>,
      )}
    </>
  );
}

/** Link externo seguro: abre em nova aba sem dar acesso à janela de origem e sem enviar o referenciador. */
export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1">
      {children}
      <ExtIcon size={13} aria-hidden="true" />
      <span className="sr-only">(abre em nova aba)</span>
    </a>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
      <p className="font-semibold">{title}</p>
      {children && <div className="muted mt-2 text-sm">{children}</div>}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="panel">
      <p className="muted text-sm">{label}</p>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
      {hint && <p className="muted mt-1 text-xs">{hint}</p>}
    </div>
  );
}

export const pct = (n: number) => `${Math.round(n * 100)}%`;
