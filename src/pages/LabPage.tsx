import { useState } from 'react';
import { Copy, RotateCcw } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { saveNote } from '../services/actions';
import { Card, PageTitle, Callout, ExternalLink, Chip } from '../components/ui';
import { NextTokenWidget } from '../components/activities/OtherActivities';

const STARTER = `# Exercício de estudo: média de notas
# Execute no Google Colab ou no Python instalado no seu computador.
notas = [7.5, 8.0, 9.0]
media = sum(notas) / len(notas)
print(f"Média: {media:.2f}")
# Saída esperada: Média: 8.17`;

const KEY = 'lab:python:media';

export default function LabPage() {
  const { data, update, toast } = useStore();
  const [code, setCode] = useState(data.notes[KEY] ?? STARTER);

  return (
    <>
      <PageTitle title="Laboratório" subtitle="Área de experimentação. Nesta versão há uma demonstração interativa (Mundo 1) e um editor de estudo de Python sem execução." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card aria-labelledby="lab-token">
          <h2 id="lab-token" className="text-lg">Experimento: simulador de próximo token</h2>
          <p className="muted mt-1 mb-4 text-sm">Experimente escolhas diferentes e veja como cada token muda as probabilidades do seguinte (módulo 1.1).</p>
          <NextTokenWidget />
        </Card>

        <Card aria-labelledby="lab-py">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="lab-py" className="text-lg">Python — modo de estudo</h2>
            <Chip tone="aviso">Execução indisponível</Chip>
          </div>
          <Callout tone="atencao" title="Este editor NÃO executa código">
            Executar Python com segurança exige um ambiente isolado com limites de CPU, memória, tempo e rede, que esta versão ainda não tem. Nada é simulado: para rodar, copie o código para o Google Colab ou para o Python do seu computador. Nunca coloque chaves de API no código.
          </Callout>
          <label htmlFor="code" className="label mt-4">Código</label>
          <textarea
            id="code"
            spellCheck={false}
            className="field min-h-64 font-mono !bg-slate-950 !text-emerald-300"
            value={code}
            maxLength={20000}
            onChange={(e) => setCode(e.target.value)}
            onBlur={() => update((d) => saveNote(d, KEY, code))}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={() => navigator.clipboard?.writeText(code).then(() => toast('Código copiado.', 'sucesso'), () => toast('Não foi possível copiar.', 'erro'))}>
              <Copy size={16} aria-hidden="true" /> Copiar código
            </button>
            <button className="btn-ghost" onClick={() => { setCode(STARTER); update((d) => saveNote(d, KEY, STARTER)); }}>
              <RotateCcw size={16} aria-hidden="true" /> Reiniciar exercício
            </button>
          </div>
          <h3 className="mt-5 font-semibold">Onde executar gratuitamente</h3>
          <ul className="mt-2 space-y-1 text-sm">
            <li><ExternalLink href="https://colab.research.google.com/">Google Colab</ExternalLink> <span className="muted">(citado no PDF; exige conta Google)</span></li>
            <li><ExternalLink href="https://docs.python.org/pt-br/3/tutorial/">Tutorial oficial do Python</ExternalLink></li>
          </ul>
        </Card>
      </div>
      <Card className="mt-6" aria-labelledby="lab-prox">
        <h2 id="lab-prox" className="text-lg">Previsto para as próximas etapas</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li><b>Mundo 3 (n8n e APIs):</b> exemplos de JSON, requisições simuladas localmente e roteiros para ferramentas externas (Hoppscotch, n8n).</li>
          <li><b>Mundo 4 (Python, RAG e agentes):</b> execução de Python no próprio navegador em ambiente isolado (WebAssembly em Web Worker, sem servidor), com testes automatizados por exercício. Será avaliada e testada antes de ser habilitada.</li>
          <li>Diagramas de arquitetura, testes de recuperação e explicação de falhas para RAG e agentes.</li>
        </ul>
      </Card>
    </>
  );
}
