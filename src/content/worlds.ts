import type { Project, World } from '../types/curriculum';

/**
 * Mundos, projetos e checkpoints — fundamentados no PDF da trilha.
 * Checkpoints: itens copiados do PDF. Projetos: descrição do PDF + estrutura de acompanhamento
 * (checklist, critérios e entregáveis) derivada da própria descrição.
 */

const range = (w: number, n: number) => Array.from({ length: n }, (_, i) => `${w}.${i + 1}`);

export const worlds: World[] = [
  {
    id: 1,
    title: 'Fundamentos de IA',
    theme: 'Fundamentos',
    goal: 'Entender o que acontece entre você digitar uma pergunta e a IA responder, e por que ela às vezes erra com total confiança.',
    weeks: 3,
    moduleIds: range(1, 9),
    projectId: 'p1',
    resourceIds: ['elements-of-ai', 'google-intro-genai', 'karpathy-intro-llms', 'karpathy-deep-dive', 'hf-llm-course-ch1'],
    checkpoint: {
      worldId: 1,
      intro: 'Você está pronto para o Mundo 2 se consegue, sem consultar:',
      status: 'pdf',
      items: [
        { id: 'c1', text: 'Explicar a um amigo por que a IA inventa referências.' },
        { id: 'c2', text: 'Estimar quantos tokens tem uma página de texto (cerca de 500–800 em português).' },
        { id: 'c3', text: 'Dizer o que acontece quando uma conversa passa da janela de contexto.' },
        { id: 'c4', text: 'Explicar o que é um embedding com um exemplo.' },
        { id: 'c5', text: 'Listar 3 tipos de informação que você não colaria numa IA.' },
      ],
    },
  },
  {
    id: 2,
    title: 'IA sem código',
    theme: 'Sem código',
    goal: 'Escrever prompts que dão resultado consistente, escolher a IA certa para cada tarefa e saber avaliar se a resposta presta.',
    weeks: 4,
    moduleIds: range(2, 8),
    projectId: 'p2',
    resourceIds: [],
    checkpoint: {
      worldId: 2,
      intro: 'Checkpoint do Mundo 2:',
      status: 'pdf',
      items: [
        { id: 'c1', text: 'Transformar um prompt vago ("me fala sobre marketing") num prompt com contexto, tarefa, formato e restrições.' },
        { id: 'c2', text: 'Usar few-shot para fazer a IA seguir um formato exato.' },
        { id: 'c3', text: 'Fazer a IA devolver um JSON válido com campos definidos por você.' },
        { id: 'c4', text: 'Justificar qual IA usar para pesquisa, para escrita longa e para estudar um PDF.' },
        { id: 'c5', text: 'Mostrar sua biblioteca com pelo menos 10 prompts testados.' },
      ],
    },
  },
  {
    id: 3,
    title: 'Low-code, automações e agentes',
    theme: 'Low-code',
    goal: 'Tirar a IA do chat e colocá-la para trabalhar dentro de fluxos automatizados, conectada a outros sistemas, com custo zero rodando tudo localmente.',
    weeks: 5,
    moduleIds: range(3, 11),
    projectId: 'p3',
    resourceIds: ['n8n-docs'],
    checkpoint: {
      worldId: 3,
      intro: 'Checkpoint do Mundo 3:',
      status: 'pdf',
      items: [
        { id: 'c1', text: 'Explicar o que significam os códigos 200, 401, 404 e 429.' },
        { id: 'c2', text: 'Chamar uma API de IA pelo Hoppscotch e localizar o texto da resposta no JSON.' },
        { id: 'c3', text: 'Montar no n8n um fluxo com gatilho, IF e tratamento de erro.' },
        { id: 'c4', text: 'Explicar a diferença entre um fluxo fixo com IA e um agente.' },
        { id: 'c5', text: 'Explicar o que é MCP e por que ele existe.' },
        { id: 'c6', text: 'Guardar chaves de API sem expô-las.' },
      ],
    },
  },
  {
    id: 4,
    title: 'Programação com Python e IA',
    theme: 'Código',
    goal: 'Construir em Python aplicações de IA que consultam seus próprios documentos (RAG) e agentes com fluxo controlado (LangGraph), entendendo o que cada framework faz por baixo.',
    weeks: 8,
    moduleIds: range(4, 11),
    projectId: 'p4',
    resourceIds: ['python-tutorial-ptbr', 'langgraph-docs'],
    checkpoint: {
      worldId: 4,
      intro: 'Checkpoint do Mundo 4:',
      status: 'pdf',
      items: [
        { id: 'c1', text: 'Escrever, sem framework, um script que conversa com um modelo mantendo o histórico.' },
        { id: 'c2', text: 'Explicar cada etapa do RAG e o que acontece se o chunk for grande ou pequeno demais.' },
        { id: 'c3', text: 'Desenhar o grafo do seu agente (nós, arestas e condições) e explicar o estado.' },
        { id: 'c4', text: 'Mostrar um eval com números e uma melhoria que você fez a partir dele.' },
        { id: 'c5', text: 'Garantir que nenhuma chave está no repositório.' },
      ],
    },
  },
  {
    id: 5,
    title: 'IA em produção',
    theme: 'Produção',
    goal: 'Transformar um projeto que "funciona na minha máquina" em algo que outras pessoas usam com segurança, e saber medir e controlar o que ele faz.',
    weeks: 4,
    moduleIds: range(5, 7),
    projectId: 'p5',
    resourceIds: ['fastapi-docs-pt', 'owasp-genai', 'anpd'],
    checkpoint: {
      worldId: 5,
      intro: 'Checkpoint final:',
      status: 'pdf',
      items: [
        { id: 'c1', text: 'Alguém que não é você consegue usar o projeto pelo link.' },
        { id: 'c2', text: 'Você explica 3 riscos de segurança do seu sistema e como mitigou cada um.' },
        { id: 'c3', text: 'Você mostra quanto o sistema custaria por 1.000 perguntas num plano pago.' },
        { id: 'c4', text: 'Você justifica por que usou (ou não) RAG, agente e fine-tuning.' },
      ],
    },
  },
];

const readmeCriteria = 'README explica o que o projeto faz, como funciona, como reproduzir e quais são as limitações.';

export const projects: Project[] = [
  {
    id: 'p1', worldId: 1, title: 'Glossário vivo', status: 'pdf', estimatedMinutes: 240,
    objective: 'Consolidar os 9 conceitos do Mundo 1 com suas próprias palavras e evidências testadas.',
    pdfDescription: 'Crie um documento com os 9 conceitos explicados com suas palavras, cada um com um exemplo real que você testou. Inclua um "diário de alucinações" com pelo menos 3 erros que você pegou e como descobriu. Esse glossário será atualizado em todos os mundos.',
    prerequisites: ['Módulos 1.1 a 1.9 estudados'],
    tools: ['Editor de texto ou Markdown', 'Contas gratuitas de chat de IA (Claude, ChatGPT, Gemini, Copilot)', 'GitHub (opcional, para portfólio)'],
    steps: ['Liste os 9 conceitos do Mundo 1.', 'Para cada conceito, escreva uma explicação com suas palavras (sem copiar da IA).', 'Teste cada conceito numa ferramenta e registre o exemplo real.', 'Monte o diário de alucinações: o que a IA disse, como você descobriu o erro e qual era a informação correta.', 'Revise o texto e publique (opcional) com um README.'],
    checklist: [
      { id: 'k1', text: 'Os 9 conceitos estão explicados com minhas palavras.' },
      { id: 'k2', text: 'Cada conceito tem um exemplo real que eu testei.' },
      { id: 'k3', text: 'O diário de alucinações tem pelo menos 3 erros, com a forma de descoberta.' },
      { id: 'k4', text: 'Não incluí dados pessoais, senhas ou informações sigilosas.' },
      { id: 'k5', text: 'Escrevi um README explicando o objetivo e a organização do glossário.' },
    ],
    criteria: ['Precisão conceitual de cada definição.', 'Exemplos realmente testados (descreve ferramenta, entrada e resultado).', 'Diário de alucinações com verificação em fonte confiável.', readmeCriteria],
    deliverables: ['Documento do glossário (Markdown, documento ou repositório).', 'Diário de alucinações com 3 ou mais casos.'],
  },
  {
    id: 'p2', worldId: 2, title: 'Batalha de IAs', status: 'pdf', estimatedMinutes: 360,
    objective: 'Comparar IAs com critérios explícitos e construir uma biblioteca de prompts testados.',
    pdfDescription: 'Escolha 5 tarefas do seu dia a dia (por exemplo: resumir um artigo, escrever um e-mail difícil, montar um plano de estudos, extrair dados de um PDF, explicar um conceito). Rode cada uma em 3 IAs, com o mesmo prompt, e dê notas de 1 a 5 com sua rubrica. Depois, melhore o prompt da pior nota até chegar a 4 ou 5 e registre as versões. Entregável: uma tabela comparativa + uma biblioteca com seus 10 melhores prompts.',
    prerequisites: ['Mundo 1 concluído', 'Módulos 2.1 a 2.8 estudados'],
    tools: ['Planos gratuitos de 3 IAs', 'Planilha ou tabela Markdown'],
    steps: ['Escolha 5 tarefas reais.', 'Defina a rubrica (precisão, completude, formato, tom).', 'Rode as 5 tarefas em 3 IAs com o mesmo prompt.', 'Dê notas e justifique.', 'Melhore o prompt da pior nota, registrando versões.', 'Monte a biblioteca com os 10 melhores prompts.'],
    checklist: [
      { id: 'k1', text: 'Tabela com 5 tarefas × 3 IAs e notas justificadas.' },
      { id: 'k2', text: 'Rubrica escrita antes dos testes.' },
      { id: 'k3', text: 'Versões do prompt melhorado registradas até nota 4 ou 5.' },
      { id: 'k4', text: 'Biblioteca com 10 prompts testados, com variáveis entre colchetes.' },
      { id: 'k5', text: 'Usei apenas dados fictícios ou públicos.' },
    ],
    criteria: ['Comparação justa (mesma tarefa, mesmo prompt, mesmos critérios).', 'Justificativa das notas.', 'Evolução documentada dos prompts.', readmeCriteria],
    deliverables: ['Tabela comparativa.', 'Biblioteca com 10 prompts.'],
  },
  {
    id: 'p3', worldId: 3, title: 'Assistente pessoal no Telegram', status: 'pdf', estimatedMinutes: 600,
    objective: 'Construir no n8n um bot com classificação de intenção, agente com ferramentas e registro de erros.',
    pdfDescription: 'Um bot no Telegram, feito no n8n, que: 1. Recebe sua mensagem (texto ou áudio transcrito). 2. Classifica a intenção: anotar tarefa, pesquisar algo ou resumir um link. 3. Usa um agente com 3 ferramentas: salvar numa planilha do Google Sheets, buscar numa API pública e ler o conteúdo de uma URL. 4. Responde no Telegram e registra erros num log. Tudo com Gemini gratuito ou Ollama. Exporte o fluxo em JSON (sem credenciais) e publique no GitHub com um README.',
    prerequisites: ['Mundos 1 e 2 concluídos', 'Módulos 3.1 a 3.11 estudados', 'Docker e n8n instalados'],
    tools: ['n8n Community Edition (Docker)', 'Bot do Telegram', 'Gemini (chave gratuita) ou Ollama', 'Google Sheets', 'GitHub'],
    steps: ['Crie o bot no Telegram e o gatilho no n8n.', 'Implemente a classificação de intenção.', 'Configure o agente com as 3 ferramentas, com permissões mínimas.', 'Implemente respostas e log de erros.', 'Exporte o fluxo em JSON SEM credenciais.', 'Publique com README.'],
    checklist: [
      { id: 'k1', text: 'O bot recebe mensagens e classifica as 3 intenções.' },
      { id: 'k2', text: 'O agente usa exatamente as 3 ferramentas previstas.' },
      { id: 'k3', text: 'Erros são registrados em log.' },
      { id: 'k4', text: 'O JSON exportado não contém credenciais (conferi manualmente).' },
      { id: 'k5', text: 'README publicado.' },
    ],
    criteria: ['Funciona de ponta a ponta.', 'Tratamento de erros.', 'Segurança: nenhuma chave exposta; ferramentas limitadas.', readmeCriteria],
    deliverables: ['Fluxo n8n exportado (JSON sem credenciais).', 'Repositório com README.'],
  },
  {
    id: 'p4', worldId: 4, title: 'Tutor dos meus estudos', status: 'pdf', estimatedMinutes: 900,
    objective: 'Construir um assistente com RAG, grafo de decisão, modo quiz, interface e eval.',
    pdfDescription: 'Um assistente que responde perguntas usando suas próprias anotações e PDFs desta trilha: 1. RAG com Chroma e embeddings abertos, citando o arquivo e o trecho de origem. 2. Um grafo no LangGraph que decide: responder pelos documentos, pesquisar na web quando não achar, ou dizer "não encontrei". 3. Um modo "quiz" que gera perguntas sobre o conteúdo e corrige suas respostas. 4. Interface em Gradio ou Streamlit. 5. Um eval com 20 perguntas e o resultado registrado no README. Publique no GitHub com instruções de instalação e um .env.example sem chaves reais.',
    prerequisites: ['Mundos 1 a 3 concluídos', 'Módulos 4.1 a 4.11 estudados'],
    tools: ['Python', 'Chroma', 'sentence-transformers ou Ollama', 'LangGraph', 'Gradio ou Streamlit', 'GitHub'],
    steps: ['Monte o RAG com citação de fonte.', 'Implemente o grafo de decisão.', 'Implemente o modo quiz.', 'Crie a interface.', 'Monte e rode o eval com 20 perguntas.', 'Publique com README e .env.example.'],
    checklist: [
      { id: 'k1', text: 'Respostas citam arquivo e trecho de origem.' },
      { id: 'k2', text: 'O grafo cobre os 3 caminhos (documentos, web, "não encontrei").' },
      { id: 'k3', text: 'Eval com 20 perguntas e resultados no README.' },
      { id: 'k4', text: 'Nenhuma chave no repositório; existe .env.example.' },
      { id: 'k5', text: 'Instruções de instalação reproduzíveis.' },
    ],
    criteria: ['Fidelidade das respostas aos trechos.', 'Eval com números e uma melhoria feita a partir dele.', 'Código organizado e testado.', readmeCriteria],
    deliverables: ['Repositório com código, README e resultados do eval.'],
  },
  {
    id: 'p5', worldId: 5, title: 'Tutor no ar', status: 'pdf', estimatedMinutes: 900,
    objective: 'Publicar o tutor com API, container, proteção, monitoramento e documentação.',
    pdfDescription: 'Pegue o projeto do Mundo 4 e: 1. Exponha como API com FastAPI e empacote com Docker. 2. Publique uma demo no Hugging Face Spaces. 3. Adicione proteção contra prompt injection e limite de uso por pessoa. 4. Ligue o Langfuse e rode o eval antes de cada nova versão. 5. Conecte o n8n do Mundo 3 à sua API, por exemplo para o bot do Telegram responder usando o tutor. 6. Escreva um README com arquitetura, decisões, resultados do eval e limitações conhecidas.',
    prerequisites: ['Mundos 1 a 4 concluídos', 'Módulos 5.1 a 5.7 estudados'],
    tools: ['FastAPI', 'Docker', 'Hugging Face Spaces', 'Langfuse', 'n8n'],
    steps: ['Exponha o tutor como API.', 'Empacote com Docker.', 'Publique a demo com segredos da plataforma.', 'Adicione proteção contra prompt injection e limite de uso.', 'Ligue observabilidade e eval por versão.', 'Integre com o n8n.', 'Escreva o README final.'],
    checklist: [
      { id: 'k1', text: 'A demo funciona para outra pessoa pelo link.' },
      { id: 'k2', text: 'Chave guardada como segredo da plataforma, nunca no código.' },
      { id: 'k3', text: 'Proteção contra prompt injection testada com casos de ataque.' },
      { id: 'k4', text: 'Limite de uso por pessoa implementado.' },
      { id: 'k5', text: 'README com arquitetura, decisões, eval e limitações.' },
    ],
    criteria: ['Funciona publicamente.', 'Riscos de segurança identificados e mitigados.', 'Custo estimado por 1.000 perguntas.', readmeCriteria],
    deliverables: ['Link da demo.', 'Repositório com README completo.'],
  },
];
