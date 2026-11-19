import { useStore } from '../store/StoreContext';
import { Link } from '../router';
import { forecast, remainingMinutes } from '../services/plan';
import { formatDateBR, formatMinutes } from '../services/dates';
import type { ThemePref } from '../types/progress';
import { Card, PageTitle, Callout } from '../components/ui';

export default function SettingsPage() {
  const { data, update } = useStore();
  const p = data.preferences;
  const set = (patch: Partial<typeof p>) => update((d) => ({ ...d, preferences: { ...d.preferences, ...patch }, updatedAt: new Date().toISOString() }));
  const rem = remainingMinutes(data);
  const fc = forecast(rem.total, p.daysPerWeek, p.sessionMinutes);

  return (
    <>
      <PageTitle title="Configurações" subtitle="Rotina de estudos e aparência. Dados e backup ficam em páginas próprias." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card aria-labelledby="rot">
          <h2 id="rot" className="text-lg">Rotina de estudos</h2>
          <label htmlFor="dias" className="label mt-4">Dias de estudo por semana</label>
          <select id="dias" className="field" value={p.daysPerWeek} onChange={(e) => set({ daysPerWeek: Number(e.target.value) })}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'dia' : 'dias'}</option>)}
          </select>
          <label htmlFor="sessao" className="label mt-4">Duração de cada sessão</label>
          <select id="sessao" className="field" value={p.sessionMinutes} onChange={(e) => set({ sessionMinutes: Number(e.target.value) })}>
            {[30, 45, 60, 75, 90, 120].map((n) => <option key={n} value={n}>{n} minutos{n === 60 ? ' (padrão)' : ''}</option>)}
          </select>
          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-950">
            <p className="font-semibold">Previsão com esta rotina: {formatDateBR(fc.date)}</p>
            <p className="muted mt-1">Restam ≈ {formatMinutes(rem.total)} estimados (conteúdo, projetos e 10% de revisões) → {fc.sessions} sessões, ≈ {fc.weeks} semanas.</p>
            <p className="muted mt-1">O PDF considera 6–8 h por semana; com menos tempo, estique cada fase e não pule checkpoints.</p>
          </div>
        </Card>
        <Card aria-labelledby="apar">
          <h2 id="apar" className="text-lg">Aparência</h2>
          <fieldset className="mt-4">
            <legend className="label">Tema</legend>
            <div className="flex flex-wrap gap-2">
              {(['claro', 'escuro', 'sistema'] as ThemePref[]).map((t) => (
                <label key={t} className={`option flex w-auto items-center gap-2 !px-3 !py-2 ${p.theme === t ? 'border-primary bg-primary-soft dark:border-primary-dark dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700'}`}>
                  <input type="radio" name="tema" className="accent-indigo-600" checked={p.theme === t} onChange={() => set({ theme: t })} />
                  {{ claro: 'Claro', escuro: 'Escuro', sistema: 'Seguir o sistema' }[t]}
                </label>
              ))}
            </div>
          </fieldset>
          <p className="muted mt-4 text-sm">A interface respeita a preferência do sistema por menos animação.</p>
          <h2 className="mt-6 text-lg">Seus dados</h2>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link to="/backup" className="link">Exportar, importar ou restaurar backup</Link></li>
            <li><Link to="/privacidade" className="link">Privacidade, retenção e exclusão de dados</Link></li>
          </ul>
        </Card>
      </div>
      <div className="mt-6">
        <Callout tone="info" title="Sem conta e sem nuvem nesta versão">
          Não há login nem sincronização. O código foi organizado (camada de armazenamento separada) para permitir autenticação e sincronização no futuro, com autorização por usuário.
        </Callout>
      </div>
    </>
  );
}
