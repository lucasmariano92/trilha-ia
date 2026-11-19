import type { GlossaryTerm } from '../types/curriculum';

/** Glossário rápido do PDF (definições literais da trilha) + termos complementares do módulo 1.1. */
const pdf = (id: string, term: string, definition: string, worlds: number[], english?: string): GlossaryTerm => ({
  id, term, definition, worlds, english, status: 'pdf',
});

export const glossary: GlossaryTerm[] = [
  pdf('llm', 'LLM', 'Modelo de linguagem grande, treinado para prever o próximo token.', [1], 'Large Language Model'),
  pdf('token', 'Token', 'Pedaço de texto que o modelo processa; base de custo e limite.', [1]),
  pdf('janela-contexto', 'Janela de contexto', 'Quantidade máxima de tokens que o modelo enxerga de uma vez.', [1], 'context window'),
  pdf('alucinacao', 'Alucinação', 'Resposta plausível, mas falsa ou inventada.', [1], 'hallucination'),
  pdf('embedding', 'Embedding', 'Representação numérica do significado de um texto.', [1, 4]),
  pdf('temperatura', 'Temperatura', 'Parâmetro que controla a aleatoriedade da resposta.', [1], 'temperature'),
  pdf('few-shot', 'Few-shot', 'Dar exemplos no prompt para guiar o formato.', [2]),
  pdf('system-prompt', 'System prompt', 'Instrução fixa que define o comportamento do assistente.', [2]),
  pdf('api', 'API', 'Interface para um programa conversar com outro.', [3], 'Application Programming Interface'),
  pdf('webhook', 'Webhook', 'URL que recebe dados quando um evento acontece.', [3]),
  pdf('tool-use', 'Tool use / function calling', 'Capacidade do modelo de chamar ferramentas externas.', [3]),
  pdf('agente', 'Agente', 'Sistema em que o modelo decide os passos e as ferramentas.', [3, 4], 'agent'),
  pdf('mcp', 'MCP', 'Protocolo aberto para conectar IAs a ferramentas e dados.', [3], 'Model Context Protocol'),
  pdf('chunking', 'Chunking', 'Dividir documentos em pedaços para indexar.', [4]),
  pdf('banco-vetorial', 'Banco vetorial', 'Banco que guarda embeddings e busca por similaridade.', [4], 'vector database'),
  pdf('rag', 'RAG', 'Geração aumentada por recuperação: buscar trechos e responder com base neles.', [4], 'Retrieval-Augmented Generation'),
  pdf('reranking', 'Reranking', 'Reordenar os trechos encontrados por relevância.', [4]),
  pdf('langgraph', 'LangGraph', 'Framework para fluxos de agentes como grafos com estado.', [4]),
  pdf('eval', 'Eval', 'Teste sistemático da qualidade das respostas.', [4, 5], 'evaluation'),
  pdf('prompt-injection', 'Prompt injection', 'Ataque que esconde instruções maliciosas no conteúdo.', [5]),
  pdf('guardrail', 'Guardrail', 'Regra que valida ou bloqueia entradas e saídas.', [5]),
  pdf('fine-tuning', 'Fine-tuning', 'Ajustar os pesos de um modelo com dados próprios.', [5], 'ajuste fino'),

  /* ---------- Complementares (módulo 1.1) ---------- */
  { id: 'ia', term: 'Inteligência Artificial (IA)', english: 'Artificial Intelligence, AI', definition: 'Campo da computação que cria sistemas capazes de realizar tarefas que, em pessoas, associamos à inteligência: reconhecer padrões, entender linguagem, decidir, planejar. Inclui sistemas com e sem aprendizado a partir de dados.', worlds: [1], moduleId: '1.1', status: 'complementar' },
  { id: 'machine-learning', term: 'Aprendizado de máquina', english: 'machine learning', definition: 'Abordagem da IA em que o sistema ajusta seu comportamento a partir de exemplos (dados), em vez de seguir apenas regras escritas à mão.', worlds: [1], moduleId: '1.1', status: 'complementar' },
  { id: 'deep-learning', term: 'Aprendizado profundo', english: 'deep learning', definition: 'Tipo de aprendizado de máquina que usa redes neurais com muitas camadas. É a base dos LLMs atuais.', worlds: [1], moduleId: '1.1', status: 'complementar' },
  { id: 'ia-generativa', term: 'IA generativa', english: 'generative AI', definition: 'Sistemas de IA que produzem conteúdo novo — texto, imagem, áudio, código — em vez de apenas classificar ou prever um rótulo.', worlds: [1], moduleId: '1.1', status: 'complementar' },
  { id: 'modelo', term: 'Modelo', english: 'model', definition: 'O resultado do treinamento: uma função matemática com parâmetros ajustados que recebe uma entrada e produz uma saída. Em um LLM, entra texto (tokens) e sai uma distribuição de probabilidades para o próximo token.', worlds: [1], moduleId: '1.1', status: 'complementar' },
  { id: 'parametro', term: 'Parâmetro (peso)', english: 'parameter, weight', definition: 'Número interno do modelo ajustado durante o treinamento. LLMs têm de milhões a centenas de bilhões de parâmetros. Não confundir com "parâmetros de geração" como a temperatura (módulo 1.6).', worlds: [1], moduleId: '1.1', status: 'complementar' },
  { id: 'rede-neural', term: 'Rede neural', english: 'neural network', definition: 'Estrutura matemática formada por camadas de operações simples conectadas por pesos. Inspirada de forma muito livre nos neurônios biológicos.', worlds: [1], moduleId: '1.1', status: 'complementar' },
  { id: 'transformer', term: 'Transformer', definition: 'Arquitetura de rede neural apresentada em 2017 que usa um mecanismo chamado atenção para relacionar todas as partes do texto entre si. É a arquitetura da maioria dos LLMs atuais.', worlds: [1], moduleId: '1.1', status: 'complementar' },
  { id: 'pre-treinamento', term: 'Pré-treinamento', english: 'pre-training', definition: 'Primeira fase de treinamento: o modelo aprende a prever o próximo token em um volume enorme de textos. Produz um "modelo-base", que completa textos mas não necessariamente segue instruções.', worlds: [1], moduleId: '1.1', status: 'complementar' },
  { id: 'ajuste-fino-supervisionado', term: 'Ajuste fino supervisionado', english: 'supervised fine-tuning, SFT', definition: 'Treinamento adicional com exemplos de instruções e respostas escritas por pessoas, para o modelo aprender o formato de um assistente.', worlds: [1], moduleId: '1.1', status: 'complementar' },
  { id: 'rlhf', term: 'Aprendizado por reforço com feedback humano', english: 'reinforcement learning from human feedback, RLHF', definition: 'Técnica de alinhamento: pessoas comparam respostas do modelo, um "modelo de recompensa" aprende essas preferências e o LLM é ajustado para produzir respostas preferidas.', worlds: [1], moduleId: '1.1', status: 'complementar' },
  { id: 'alinhamento', term: 'Alinhamento', english: 'alignment', definition: 'Conjunto de técnicas para fazer o comportamento do modelo corresponder às intenções e valores das pessoas: ser útil, honesto e evitar danos.', worlds: [1], moduleId: '1.1', status: 'complementar' },
  { id: 'inferencia', term: 'Inferência', english: 'inference', definition: 'Uso de um modelo já treinado para gerar uma saída a partir de uma nova entrada. Conversar com um chatbot é inferência; os parâmetros não mudam durante a conversa.', worlds: [1], moduleId: '1.1', status: 'complementar' },
  { id: 'modelo-base', term: 'Modelo-base', english: 'base model', definition: 'Modelo logo após o pré-treinamento. Sabe continuar textos, mas ainda não foi ajustado para conversar e seguir instruções.', worlds: [1], moduleId: '1.1', status: 'complementar' },
  { id: 'autorregressivo', term: 'Geração autorregressiva', english: 'autoregressive generation', definition: 'Modo de gerar texto um token por vez: cada token escolhido é acrescentado ao contexto e usado para prever o seguinte.', worlds: [1], moduleId: '1.1', status: 'complementar' },

  /* ---------- Complementares (módulos 1.2 a 1.9) ---------- */
  c('tokenizador', 'Tokenizador', 'Programa que divide o texto em tokens e converte cada um em um número (id). Cada família de modelos tem o seu.', '1.2', 'tokenizer'),
  c('vocabulario', 'Vocabulário (do modelo)', 'Conjunto fixo de tokens que o tokenizador conhece, em geral dezenas de milhares.', '1.2', 'vocabulary'),
  c('subpalavra', 'Subpalavra', 'Pedaço de palavra usado como token. Palavras frequentes costumam ser um token só; palavras raras são divididas em vários.', '1.2', 'subword'),
  c('tokens-entrada-saida', 'Tokens de entrada e de saída', 'Entrada: tudo o que é enviado ao modelo (instruções, histórico, documentos). Saída: o que o modelo gera. Em APIs, costumam ter preços diferentes.', '1.2', 'input / output tokens'),
  c('truncamento', 'Truncamento', 'Corte do que não cabe na janela de contexto. Muitos aplicativos descartam primeiro as mensagens mais antigas.', '1.3', 'truncation'),
  c('perdido-no-meio', 'Perdido no meio', 'Fenômeno observado em pesquisas: modelos tendem a usar melhor informações no início e no fim de um contexto longo do que no meio.', '1.3', 'lost in the middle'),
  c('limite-saida', 'Limite de tokens de saída', 'Número máximo de tokens que o modelo pode gerar numa resposta. Se for baixo, a resposta é cortada.', '1.6', 'max output tokens'),
  c('verificacao-lateral', 'Verificação em fonte primária', 'Conferir uma afirmação na origem (lei publicada, artigo, documentação oficial, catálogo do fabricante), e não em outra resposta de IA.', '1.4'),
  c('vetor', 'Vetor', 'Lista ordenada de números. Um embedding é um vetor; cada posição é uma "dimensão".', '1.5', 'vector'),
  c('similaridade-cosseno', 'Similaridade de cosseno', 'Medida de quanto dois vetores apontam na mesma direção: perto de 1 = muito parecidos; perto de 0 = sem relação.', '1.5', 'cosine similarity'),
  c('busca-semantica', 'Busca semântica', 'Busca pelo significado, comparando embeddings, em vez de procurar as mesmas palavras.', '1.5', 'semantic search'),
  c('amostragem', 'Amostragem', 'Sortear o próximo token de acordo com as probabilidades, em vez de escolher sempre o mais provável.', '1.6', 'sampling'),
  c('top-p', 'Top-p (amostragem por núcleo)', 'Considera só os tokens mais prováveis cuja soma de probabilidades atinge p (ex.: 0,9) e sorteia entre eles.', '1.6', 'nucleus sampling'),
  c('multimodal', 'Modelo multimodal', 'Modelo que trabalha com mais de um tipo de dado, como texto, imagem, áudio ou vídeo.', '1.7', 'multimodal'),
  c('modelo-raciocinio', 'Modelo de raciocínio', 'Modelo treinado para gerar etapas intermediárias ("pensar") antes da resposta final. Costuma ser melhor em problemas de várias etapas, mas é mais lento e gasta mais tokens.', '1.7', 'reasoning model'),
  c('pesos-abertos', 'Pesos abertos', 'Modelo cujos parâmetros podem ser baixados e executados por qualquer pessoa, conforme a licença. Não significa necessariamente que dados e código de treinamento sejam públicos.', '1.7', 'open weights'),
  c('data-corte', 'Data de corte do conhecimento', 'Data até a qual vão os textos usados no treinamento. Sem uma ferramenta de busca, o modelo não sabe o que aconteceu depois.', '1.8', 'knowledge cutoff'),
  c('vies', 'Viés', 'Tendência sistemática nas respostas, herdada dos dados ou do treinamento, que pode favorecer ou prejudicar grupos e pontos de vista.', '1.8', 'bias'),
  c('dado-pessoal', 'Dado pessoal', 'Pela LGPD, informação relacionada a pessoa natural identificada ou identificável.', '1.8', 'personal data'),
  c('preco-por-milhao', 'Preço por milhão de tokens', 'Forma usual de cobrança de APIs de modelos: um valor por milhão de tokens de entrada e outro por milhão de tokens de saída.', '1.9', 'price per 1M tokens'),
  c('gpu', 'GPU', 'Chip especializado em muitos cálculos em paralelo; é o hardware usado para treinar e executar modelos grandes.', '1.9', 'graphics processing unit'),
  c('latencia', 'Latência', 'Tempo entre enviar o pedido e receber a resposta (ou o primeiro token).', '1.9', 'latency'),
];

function c(id: string, term: string, definition: string, moduleId: string, english?: string): GlossaryTerm {
  return { id, term, definition, english, worlds: [1], moduleId, status: 'complementar' };
}


const byId = new Map(glossary.map((g) => [g.id, g]));
export const getTerm = (id: string) => byId.get(id);
