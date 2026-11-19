import { useEffect, useState, type ComponentType } from 'react';
import {
  Brain, LayoutDashboard, Map, Layers, FlaskConical, BookCopy, FileQuestion, ClipboardCheck, Trophy, History,
  NotebookPen, BookMarked, Settings, DatabaseBackup, Menu, X, Moon, Sun, ShieldCheck,
} from 'lucide-react';
import { StoreProvider, useStore } from './store/StoreContext';
import { Link, useRoute } from './router';
import { useActiveTime } from './hooks/useActiveTime';
import { getLesson } from './content';
import Dashboard from './pages/Dashboard';
import TrailPage from './pages/TrailPage';
import WorldPage from './pages/WorldPage';
import ModulePage from './pages/ModulePage';
import LessonPage from './pages/LessonPage';
import LabPage from './pages/LabPage';
import FlashcardsPage from './pages/FlashcardsPage';
import QuestionsPage from './pages/QuestionsPage';
import ExamPage from './pages/ExamPage';
import ProjectsPage from './pages/ProjectsPage';
import HistoryPage from './pages/HistoryPage';
import DoubtsPage from './pages/DoubtsPage';
import GlossaryPage from './pages/GlossaryPage';
import SettingsPage from './pages/SettingsPage';
import BackupPage from './pages/BackupPage';
import PrivacyPage from './pages/PrivacyPage';
import type { KeyValueStore } from './services/storage';

const NAV: { to: string; label: string; Icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>; match: string[] }[] = [
  { to: '/', label: 'Painel', Icon: LayoutDashboard, match: [''] },
  { to: '/trilha', label: 'Trilha', Icon: Map, match: ['trilha'] },
  { to: '/mundo/1', label: 'Mundos e módulos', Icon: Layers, match: ['mundo', 'modulo', 'aula'] },
  { to: '/laboratorio', label: 'Laboratório', Icon: FlaskConical, match: ['laboratorio'] },
  { to: '/flashcards', label: 'Flashcards', Icon: BookCopy, match: ['flashcards'] },
  { to: '/questoes', label: 'Banco de questões', Icon: FileQuestion, match: ['questoes'] },
  { to: '/simulados', label: 'Simulados', Icon: ClipboardCheck, match: ['simulados'] },
  { to: '/projetos', label: 'Projetos', Icon: Trophy, match: ['projetos'] },
  { to: '/historico', label: 'Histórico', Icon: History, match: ['historico'] },
  { to: '/duvidas', label: 'Caderno de dúvidas', Icon: NotebookPen, match: ['duvidas'] },
  { to: '/glossario', label: 'Glossário e referências', Icon: BookMarked, match: ['glossario'] },
  { to: '/configuracoes', label: 'Configurações', Icon: Settings, match: ['configuracoes'] },
  { to: '/backup', label: 'Backup', Icon: DatabaseBackup, match: ['backup'] },
  { to: '/privacidade', label: 'Privacidade', Icon: ShieldCheck, match: ['privacidade'] },
];

function useTheme(): boolean {
  const { data } = useStore();
  const pref = data.preferences.theme;
  const systemDark = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    const apply = () => document.documentElement.classList.toggle('dark', pref === 'escuro' || (pref === 'sistema' && !!mq?.matches));
    apply();
    mq?.addEventListener?.('change', apply);
    return () => mq?.removeEventListener?.('change', apply);
  }, [pref]);
  return pref === 'escuro' || (pref === 'sistema' && systemDark);
}

/** Chave de tempo ativo por rota: páginas de estudo de um módulo ou de revisão. */
function timeKeyFor(segments: string[]): string | null {
  const [a, b] = segments;
  if (a === 'modulo' && b) return b;
  if (a === 'aula' && b) return getLesson(b)?.moduleId ?? null;
  if (a === 'flashcards' || a === 'questoes' || a === 'simulados') return 'revisao';
  if (a === 'laboratorio') return 'laboratorio';
  if (a === 'projetos') return 'projetos';
  return null;
}

function Router({ segments }: { segments: string[] }) {
  const [a, b, c] = segments;
  switch (a) {
    case undefined: return <Dashboard />;
    case 'trilha': return <TrailPage />;
    case 'mundo': return <WorldPage worldId={Number(b) || 1} />;
    case 'modulo': return <ModulePage moduleId={b ?? '1.1'} tab={c} />;
    case 'aula': return <LessonPage lessonId={b ?? ''} />;
    case 'laboratorio': return <LabPage />;
    case 'flashcards': return <FlashcardsPage />;
    case 'questoes': return <QuestionsPage />;
    case 'simulados': return <ExamPage />;
    case 'projetos': return <ProjectsPage projectId={b} />;
    case 'historico': return <HistoryPage />;
    case 'duvidas': return <DoubtsPage />;
    case 'glossario': return <GlossaryPage />;
    case 'configuracoes': return <SettingsPage />;
    case 'backup': return <BackupPage />;
    case 'privacidade': return <PrivacyPage />;
    default:
      return (
        <div className="panel">
          <h1 className="text-xl">Página não encontrada</h1>
          <p className="muted mt-2">O endereço não corresponde a nenhuma página.</p>
          <Link to="/" className="link mt-4 inline-block">Voltar ao painel</Link>
        </div>
      );
  }
}

function Shell() {
  const { segments, path } = useRoute();
  const { data, update, toastState, saveError, load } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const isDark = useTheme();
  useActiveTime(timeKeyFor(segments));

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo?.(0, 0);
    document.getElementById('conteudo')?.focus({ preventScroll: true });
  }, [path]);

  const active = (m: string[]) => m.includes(segments[0] ?? '');

  return (
    <div className="min-h-screen lg:flex">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3 focus:shadow dark:focus:bg-slate-900">
        Pular para o conteúdo
      </a>
      <aside
        id="menu"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white px-3 py-5 transition-transform dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Menu principal"
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white dark:bg-primary-dark dark:text-slate-950">
              <Brain size={22} aria-hidden={true} />
            </span>
            <span>
              <b className="text-lg">Trilha IA</b>
              <span className="muted block text-[11px] uppercase tracking-widest">do zero à produção</span>
            </span>
          </Link>
          <button className="btn-ghost !p-2 lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-0.5">
            {NAV.map(({ to, label, Icon, match }) => (
              <li key={to}>
                <Link
                  to={to}
                  aria-current={active(match) ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${active(match) ? 'bg-primary-soft text-primary dark:bg-slate-800 dark:text-primary-dark' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                >
                  <Icon size={18} aria-hidden={true} />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="muted mt-4 px-3 text-[11px] leading-4">Dados salvos só neste navegador · sem login · v2.0.0-alpha.2</p>
      </aside>
      {menuOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 md:px-8">
          <button className="btn-ghost !p-2 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Abrir menu" aria-expanded={menuOpen} aria-controls="menu">
            <Menu size={22} aria-hidden="true" />
          </button>
          <span className="muted hidden text-sm sm:block">Aprenda IA em três níveis: entender, praticar e aplicar.</span>
          <button
            className="btn-ghost !p-2"
            aria-label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
            onClick={() => update((d) => ({ ...d, preferences: { ...d.preferences, theme: isDark ? 'claro' : 'escuro' } }))}
          >
            {isDark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
          </button>
        </header>

        <main id="conteudo" tabIndex={-1} className="mx-auto max-w-6xl p-4 outline-none md:p-8">
          {saveError && (
            <div role="alert" className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200">
              <b>Não foi possível salvar.</b> {saveError}
            </div>
          )}
          {!dismissed && load.warnings.length > 0 && (
            <div role="status" className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950/40">
              <p className="font-semibold">
                {load.source === 'v1-migrado' ? 'Seus dados da versão anterior foram convertidos.' : 'Aviso sobre os dados salvos.'}
              </p>
              <ul className="mt-1 list-disc pl-5">
                {load.warnings.slice(0, 6).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
              <button className="link mt-2 text-sm" onClick={() => setDismissed(true)}>Entendi</button>
            </div>
          )}
          {data.activeExam && segments[0] !== 'simulados' && (
            <div className="mb-4 rounded-xl bg-primary-soft p-3 text-sm dark:bg-slate-800">
              Você tem um simulado em andamento. O tempo continua correndo. <Link to="/simulados" className="link">Voltar ao simulado</Link>
            </div>
          )}
          <Router segments={segments} />
          <footer className="muted mt-12 border-t border-slate-200 pt-6 text-xs dark:border-slate-800">
            Projeto educacional independente. Conteúdo curricular baseado no PDF "Trilha de Aprendizagem em IA — do zero ao código". Questões e simulados são didáticos e não equivalem a certificação oficial.{' '}
            <Link to="/privacidade" className="link">Privacidade</Link>
          </footer>
        </main>
      </div>

      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-50">
        {toastState && (
          <div
            key={toastState.id}
            role={toastState.tone === 'erro' ? 'alert' : 'status'}
            className={`pointer-events-auto rounded-xl px-4 py-3 text-sm shadow-lg ${toastState.tone === 'erro' ? 'bg-red-700 text-white' : toastState.tone === 'sucesso' ? 'bg-emerald-700 text-white' : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'}`}
          >
            {toastState.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App({ kv }: { kv?: KeyValueStore }) {
  return (
    <StoreProvider kv={kv}>
      <Shell />
    </StoreProvider>
  );
}
