import { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { clearCategory, type DataCategory } from '../services/actions';
import { emptyUserData } from '../services/schema';
import { KEYS, removeLegacy, wipeAll } from '../services/storage';
import { Card, PageTitle, Callout } from '../components/ui';

const CATEGORIES: { id: DataCategory; label: string; detail: string }[] = [
  { id: 'respostas', label: 'Respostas e tentativas', detail: 'questões, verificações, atividades, simulados e práticas externas' },
  { id: 'flashcards', label: 'Flashcards', detail: 'agenda de revisões e histórico' },
  { id: 'anotacoes', label: 'Anotações e dúvidas', detail: 'caderno de dúvidas e notas das lições' },
  { id: 'projetos', label: 'Projetos, desafios e checkpoints', detail: 'textos, links, versões e autoavaliações' },
  { id: 'tempo', label: 'Tempo de estudo', detail: 'tempo ativo por dia e lições abertas' },
  { id: 'relatos', label: 'Relatos de erro', detail: 'erros de conteúdo que você registrou' },
];

export default function PrivacyPage() {
  const { replaceAll, update, toast, kv, load } = useStore();
  const [confirm, setConfirm] = useState<DataCategory | 'tudo' | null>(null);
  let legacy = false;
  try {
    legacy = !!kv.getItem(KEYS.legacyV1);
  } catch {
    legacy = false;
  }

  return (
    <>
      <PageTitle title="Privacidade e dados" subtitle="O que é guardado, onde, por quê e como apagar." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card aria-labelledby="oque">
          <h2 id="oque" className="text-lg">O que é coletado e por quê</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
            <li><b>Respostas e tentativas</b> — para corrigir, medir domínio por objetivo e recomendar revisão.</li>
            <li><b>Tempo ativo de estudo</b> — para comparar o tempo estimado com o realizado. Só conta com a aba visível e interação recente.</li>
            <li><b>Anotações, dúvidas, projetos e entregas</b> — porque você os escreveu para estudar.</li>
            <li><b>Preferências</b> — tema, dias por semana e duração da sessão.</li>
          </ul>
          <p className="mt-3 text-sm">Não há cadastro, nome, e-mail, senha, cookies de rastreamento, análise de uso ou anúncios.</p>
        </Card>
        <Card aria-labelledby="onde">
          <h2 id="onde" className="text-lg">Onde fica e quem acessa</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
            <li>Tudo fica <b>somente neste navegador</b> (armazenamento local). Nada é enviado a servidores da plataforma: nesta versão não existe servidor.</li>
            <li>O armazenamento local <b>não é criptografado</b> e não equivale a armazenamento seguro: quem usa este computador e este perfil de navegador pode ver os dados.</li>
            <li>Os dados podem ser <b>perdidos</b> se o navegador apagar os dados do site. Faça backups.</li>
            <li>Links externos (cursos, documentação) abrem em nova aba; ao abri-los, valem as políticas desses sites.</li>
            <li>A página não carrega fontes, scripts ou imagens de terceiros.</li>
          </ul>
        </Card>
        <Card aria-labelledby="ret">
          <h2 id="ret" className="text-lg">Retenção</h2>
          <p className="mt-3 text-sm leading-6">Os dados ficam até você apagá-los aqui ou limpar os dados do site no navegador. Para limitar o volume, a plataforma mantém no máximo os 50.000 registros de resposta mais recentes e 1.000 dúvidas; o excedente mais antigo é descartado.</p>
          <h2 className="mt-5 text-lg">Seus direitos</h2>
          <p className="mt-2 text-sm leading-6">Como os dados não saem do seu dispositivo, você mesmo exerce o acesso (Histórico e Backup), a correção (editando os registros) e a exclusão (abaixo). Se uma versão futura tiver contas e servidor, esta política será revista antes, com base legal definida para cada tratamento, lista de fornecedores e canal de atendimento.</p>
        </Card>
        <Card aria-labelledby="cuid">
          <h2 id="cuid" className="text-lg">Cuidados ao estudar</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
            <li>Não escreva senhas, chaves de API, CPFs ou dados de terceiros nas anotações. A plataforma avisa quando detecta padrões comuns, mas essa verificação não é infalível.</li>
            <li>Nos exercícios com IAs externas, use dados fictícios ou públicos. O PDF lembra que o plano gratuito da API do Gemini pode usar os dados enviados para melhorar produtos do Google.</li>
            <li>O backup exportado contém seus dados pessoais e não é criptografado.</li>
          </ul>
        </Card>
      </div>

      <Card className="mt-6" aria-labelledby="exc">
        <h2 id="exc" className="text-lg">Excluir dados</h2>
        <p className="muted mt-1 text-sm">A exclusão é imediata e não pode ser desfeita. Exporte um backup antes, se quiser guardar algo.</p>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {CATEGORIES.map((c) => (
            <li key={c.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <span className="text-sm"><b>{c.label}</b><span className="muted block text-xs">{c.detail}</span></span>
              {confirm === c.id ? (
                <span className="flex gap-1">
                  <button className="btn-danger !px-3 !py-1.5" onClick={() => { update((d) => clearCategory(d, c.id)); setConfirm(null); toast(`${c.label}: dados excluídos.`); }}>Confirmar</button>
                  <button className="btn-ghost !px-3 !py-1.5" onClick={() => setConfirm(null)}>Cancelar</button>
                </span>
              ) : (
                <button className="btn-ghost !px-3 !py-1.5" onClick={() => setConfirm(c.id)}>Excluir</button>
              )}
            </li>
          ))}
        </ul>
        {legacy && (
          <div className="mt-4 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
            <p><b>Dados da versão 1 ainda guardados.</b> {load.source === 'v1-migrado' ? 'Eles já foram convertidos para a versão 2.' : ''} A cópia antiga pode ser apagada.</p>
            <button className="btn-ghost mt-2" onClick={() => { removeLegacy(kv); toast('Dados da versão 1 apagados.'); }}>Apagar dados da versão 1</button>
          </div>
        )}
        <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
          {confirm === 'tudo' ? (
            <div role="alertdialog" aria-labelledby="tudo-t" className="rounded-xl bg-red-50 p-4 text-sm dark:bg-red-950/40">
              <p id="tudo-t" className="font-semibold">Apagar TODOS os seus dados deste navegador?</p>
              <div className="mt-3 flex gap-2">
                <button className="btn-danger" onClick={() => { wipeAll(kv); replaceAll(emptyUserData()); setConfirm(null); toast('Todos os dados foram apagados.'); }}>Sim, apagar tudo</button>
                <button className="btn-ghost" onClick={() => setConfirm(null)}>Cancelar</button>
              </div>
            </div>
          ) : (
            <button className="btn-danger" onClick={() => setConfirm('tudo')}>Apagar todos os meus dados</button>
          )}
        </div>
      </Card>
      <div className="mt-6">
        <Callout tone="info" title="Referência">
          Orientações oficiais sobre a LGPD: Autoridade Nacional de Proteção de Dados (ANPD), gov.br/anpd. O módulo 5.5 da trilha aprofunda o tema.
        </Callout>
      </div>
    </>
  );
}
