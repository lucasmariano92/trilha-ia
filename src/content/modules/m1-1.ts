import type { Activity, Challenge, Flashcard, Lesson, Objective, Question } from '../../types/curriculum';
import { balance } from '../question-utils';

/**
 * MÓDULO PILOTO 1.1 — O que é um modelo de linguagem (LLM)
 *
 * Base curricular (PDF): "Um modelo de linguagem prevê o próximo pedaço de texto com base em padrões
 * aprendidos em enormes volumes de dados. Entenda as fases: pré-treinamento, ajuste fino e alinhamento
 * com feedback humano. Diferencie IA, machine learning, deep learning e IA generativa."
 * Prática do PDF: "peça a três IAs diferentes que expliquem como foram treinadas e compare as respostas."
 *
 * Tudo o que vai além desse texto está marcado como conteúdo complementar, com referência.
 * Questões e flashcards foram escritos para este piloto e estão "pendentes de revisão" humana.
 */

const M = '1.1';

export const objectives1_1: Objective[] = [
  { id: '1.1-O1', moduleId: M, bloom: 'aplicar', text: 'Diferenciar IA, aprendizado de máquina, aprendizado profundo e IA generativa, classificando corretamente exemplos de sistemas reais.' },
  { id: '1.1-O2', moduleId: M, bloom: 'compreender', text: 'Explicar, com um exemplo, como um LLM gera texto prevendo um token de cada vez a partir de probabilidades.' },
  { id: '1.1-O3', moduleId: M, bloom: 'compreender', text: 'Ordenar e descrever as fases de pré-treinamento, ajuste fino e alinhamento com feedback humano, dizendo o que cada uma acrescenta ao modelo.' },
  { id: '1.1-O4', moduleId: M, bloom: 'analisar', text: 'Distinguir treinamento de inferência e identificar o que muda (e o que não muda) no modelo durante uma conversa.' },
  { id: '1.1-O5', moduleId: M, bloom: 'avaliar', text: 'Avaliar uma resposta de LLM identificando limitações que exigem verificação humana antes do uso.' },
];

/* ======================================================================
 * LIÇÕES (Nível 1 — Entender)
 * ==================================================================== */

export const lessons1_1: Lesson[] = [
  {
    id: '1.1.1', moduleId: M, order: 1, estimatedMinutes: 20, status: 'complementar',
    title: 'IA, machine learning, deep learning e IA generativa',
    goal: 'Ao final, você classifica corretamente pelo menos 4 de 5 exemplos de sistemas como baseados em regras, aprendizado de máquina ou IA generativa, e explica por que um LLM está dentro dos quatro campos.',
    objectiveIds: ['1.1-O1'],
    prerequisites: ['Nenhum. Esta é a primeira lição da trilha.'],
    glossaryIds: ['ia', 'machine-learning', 'deep-learning', 'ia-generativa', 'rede-neural', 'llm'],
    referenceIds: ['elements-of-ai', 'google-intro-genai'],
    checkQuestionIds: ['q1.1-01', 'q1.1-02', 'q1.1-03', 'q1.1-04', 'q1.1-05'],
    blocks: [
      { type: 'callout', tone: 'pdf', title: 'O que o PDF da trilha pede', text: 'Diferencie IA, machine learning, deep learning e IA generativa. Esta lição desenvolve essa frase em profundidade.' },
      { type: 'p', text: 'Você já ouviu "IA" ser usada para tudo: do corretor do celular ao robô que conversa. Antes de entender um modelo de linguagem, vale arrumar o vocabulário. Esses quatro termos não são sinônimos: eles formam **círculos um dentro do outro**.' },
      { type: 'h', text: 'Quatro termos, do mais amplo ao mais específico' },
      { type: 'term', term: 'Inteligência Artificial (IA)', english: 'Artificial Intelligence', definition: 'O campo inteiro: qualquer sistema computacional que realiza tarefas que, em pessoas, associamos à inteligência — reconhecer padrões, entender linguagem, decidir, planejar. Inclui sistemas que NÃO aprendem com dados, como um programa de xadrez antigo feito só de regras.' },
      { type: 'term', term: 'Aprendizado de máquina', english: 'machine learning', definition: 'Uma forma de fazer IA. Em vez de alguém escrever todas as regras, o sistema recebe muitos exemplos e ajusta números internos até acertar a tarefa. Exemplo: um filtro de spam que aprendeu com milhares de e-mails marcados como "spam" ou "não spam".' },
      { type: 'term', term: 'Aprendizado profundo', english: 'deep learning', definition: 'Um tipo de aprendizado de máquina que usa redes neurais com muitas camadas. "Profundo" se refere ao número de camadas, não a uma compreensão profunda. É o que tornou possível reconhecer rostos, transcrever voz e gerar textos fluentes.' },
      { type: 'term', term: 'IA generativa', english: 'generative AI', definition: 'Sistemas que produzem conteúdo novo — texto, imagem, áudio, código — em vez de apenas dar um rótulo ("spam") ou um número ("vai vender 120 unidades"). Os sistemas generativos atuais são, em geral, construídos com aprendizado profundo.' },
      { type: 'diagram', diagram: 'ai-hierarchy', caption: 'Cada campo está contido no anterior. Um LLM é um modelo de IA generativa, construído com aprendizado profundo, que é um tipo de aprendizado de máquina, que é uma forma de IA.' },
      { type: 'analogy', title: 'Analogia: a cozinha', text: 'Pense em "cozinhar" como a IA. Uma forma de cozinhar é seguir uma receita fixa, passo a passo (sistema de regras). Outra é aprender provando e ajustando o tempero ao longo de muitas tentativas (aprendizado de máquina). Um chef com anos de prática e muitas camadas de experiência é o aprendizado profundo. E um chef que inventa pratos novos, em vez de só reconhecer se um prato está bom, é a IA generativa.' },
      { type: 'h', text: 'Como diferenciar na prática' },
      { type: 'p', text: 'Faça duas perguntas sobre qualquer sistema. **Primeira: ele aprendeu com exemplos ou alguém escreveu todas as regras?** Se foram regras fixas ("se o pedido tem a palavra urgente, marque como urgente"), é um sistema baseado em regras — pode até ser chamado de IA em sentido amplo, mas não é aprendizado de máquina. **Segunda: ele produz conteúdo novo ou só classifica e prevê?** Se ele escreve, desenha ou fala algo novo, é generativo.' },
      { type: 'example', kind: 'correto', text: 'Um aplicativo de banco que aprendeu com o histórico de transações a sinalizar compras suspeitas é aprendizado de máquina, mas não é IA generativa.', why: 'Ele aprendeu com dados (machine learning) e devolve um rótulo — "suspeita" ou "normal" —, não um conteúdo novo.' },
      { type: 'example', kind: 'incorreto', text: '"Toda IA é um chatbot."', why: 'Chatbots são só uma das aplicações. Recomendações de filmes, leitura de placas de carro e filtros de spam também são IA, e nenhum deles conversa.' },
      { type: 'example', kind: 'incorreto', text: '"Deep learning é uma IA que entende profundamente o assunto."', why: '"Profundo" descreve a arquitetura (muitas camadas), não o nível de compreensão. Um modelo de deep learning pode errar coisas simples.' },
      { type: 'misconception', wrong: 'IA e aprendizado de máquina são a mesma coisa.', right: 'Aprendizado de máquina é uma parte da IA. Existem sistemas de IA que não aprendem com dados, como sistemas especialistas feitos só de regras.' },
      { type: 'misconception', wrong: 'Se é IA generativa, então não é aprendizado de máquina.', right: 'Os modelos generativos atuais SÃO aprendizado de máquina (e, em geral, aprendizado profundo). "Generativa" descreve o que o sistema faz; "aprendizado de máquina" descreve como ele foi construído.' },
      { type: 'h', text: 'E o LLM, onde fica?' },
      { type: 'p', text: 'LLM é a sigla em inglês de Large Language Model, ou **modelo de linguagem grande**. Ele está no centro dos círculos: é IA, foi construído com aprendizado de máquina, usa aprendizado profundo (uma rede neural chamada transformer) e é generativo, porque produz texto. ChatGPT, Claude, Gemini e Copilot são aplicativos construídos em cima de LLMs.' },
      { type: 'summary', items: [
        'IA é o campo inteiro; aprendizado de máquina é a parte que aprende com dados.',
        'Aprendizado profundo é aprendizado de máquina com redes neurais de muitas camadas.',
        'IA generativa produz conteúdo novo; não é o mesmo que "toda IA".',
        'Duas perguntas resolvem a maioria dos casos: aprendeu com dados? Produz conteúdo novo?',
        'Um LLM pertence aos quatro círculos ao mesmo tempo.',
      ] },
    ],
  },
  {
    id: '1.1.2', moduleId: M, order: 2, estimatedMinutes: 25, status: 'complementar',
    title: 'Como um LLM escreve: prever o próximo token',
    goal: 'Ao final, você explica com um exemplo seu como um LLM gera uma frase escolhendo um token de cada vez a partir de probabilidades, e por que isso não garante que a frase seja verdadeira.',
    objectiveIds: ['1.1-O2', '1.1-O5'],
    prerequisites: ['Lição 1.1.1 (o que é um LLM).'],
    glossaryIds: ['modelo', 'parametro', 'token', 'autorregressivo', 'transformer'],
    referenceIds: ['3b1b-llm-briefly', 'google-mlcc-intro-llms', 'karpathy-intro-llms'],
    checkQuestionIds: ['q1.1-06', 'q1.1-07', 'q1.1-08', 'q1.1-09', 'q1.1-10'],
    blocks: [
      { type: 'callout', tone: 'pdf', title: 'O que o PDF da trilha diz', text: 'Um modelo de linguagem prevê o próximo pedaço de texto com base em padrões aprendidos em enormes volumes de dados.' },
      { type: 'p', text: 'Essa frase do PDF é a ideia mais importante do Mundo 1. Quase tudo o que você vai estudar depois — tokens, janela de contexto, alucinação, temperatura — é consequência dela. Vamos desmontá-la parte por parte.' },
      { type: 'h', text: 'Primeiro: o que é um "modelo"?' },
      { type: 'term', term: 'Modelo', english: 'model', definition: 'Uma função matemática que recebe uma entrada e devolve uma saída. Ela tem muitos números internos, chamados parâmetros, que foram ajustados durante o treinamento.' },
      { type: 'term', term: 'Parâmetro (ou peso)', english: 'parameter / weight', definition: 'Cada um dos números internos do modelo. LLMs atuais têm de bilhões a centenas de bilhões deles. Ninguém escreve esses números à mão: eles são ajustados automaticamente no treinamento.' },
      { type: 'analogy', title: 'Analogia: a mesa de som', text: 'Imagine uma mesa de som com bilhões de botões giratórios. Cada posição dos botões produz um "som" diferente para a mesma música de entrada. Treinar o modelo é girar esses botões, pouco a pouco, até que a saída fique boa. Depois do treinamento, os botões ficam parados: usar o modelo não mexe neles.' },
      { type: 'h', text: 'Segundo: o "pedaço de texto" é um token' },
      { type: 'p', text: 'O modelo não lê letras nem palavras inteiras: ele trabalha com **tokens**, que são pedaços de texto — às vezes uma palavra inteira ("casa"), às vezes parte dela ("inteli" + "gência"), às vezes um sinal de pontuação. O módulo 1.2 aprofunda isso. Por enquanto, basta saber que "o próximo pedaço de texto" do PDF é o próximo token.' },
      { type: 'h', text: 'Terceiro: prever = dar uma probabilidade para cada opção' },
      { type: 'p', text: 'Quando recebe um texto, o modelo calcula, para **cada token do seu vocabulário** (dezenas de milhares de opções), a probabilidade de ele vir em seguida. O resultado é uma lista do tipo:' },
      { type: 'list', items: ['Texto de entrada: "O café da manhã de hoje foi pão com"', '"manteiga" → 46%', '"queijo" → 22%', '"café" → 12%', '"ovo" → 9%', '… milhares de outras opções com probabilidades menores'] },
      { type: 'callout', tone: 'atencao', title: 'Números ilustrativos', text: 'Essas porcentagens foram inventadas para fins didáticos. Um modelo real dá valores diferentes, que dependem do modelo e de todo o texto anterior.' },
      { type: 'h', text: 'Quarto: escolher, acrescentar e repetir' },
      { type: 'p', text: 'O sistema escolhe um token dessa lista (nem sempre o mais provável — isso é controlado pela temperatura, assunto do módulo 1.6), acrescenta o token ao texto e faz a previsão de novo, agora com o texto um pouco maior. Esse ciclo se repete até formar a resposta inteira. Esse modo de gerar um token por vez, usando os anteriores como base, chama-se **geração autorregressiva**.' },
      { type: 'diagram', diagram: 'next-token-loop', caption: 'O ciclo de geração: o texto entra, o modelo calcula probabilidades, um token é escolhido e acrescentado, e o ciclo recomeça.' },
      { type: 'h', text: 'De onde vêm as probabilidades?' },
      { type: 'p', text: 'Dos **padrões aprendidos em enormes volumes de dados**. Durante o treinamento, o modelo viu trilhões de tokens de livros, sites, código e outros textos, e ajustou seus parâmetros para prever bem o token seguinte. A arquitetura usada pela maioria dos LLMs atuais se chama **transformer**, apresentada em 2017. Ela usa um mecanismo chamado atenção, que permite relacionar cada parte do texto com todas as outras.' },
      { type: 'h', text: 'A consequência mais importante' },
      { type: 'p', text: 'O modelo aprende o que é **provável** num texto, não o que é **verdadeiro** no mundo. Na maior parte das vezes, as duas coisas coincidem, porque os textos de treinamento costumam dizer coisas verdadeiras. Mas, quando o modelo não "sabe" algo, ele ainda produz a continuação mais plausível — com a mesma fluência e o mesmo tom confiante. É daí que vêm as alucinações (módulo 1.4).' },
      { type: 'example', kind: 'correto', text: '"O LLM escolheu a palavra que, segundo os padrões que aprendeu, tinha boa chance de vir a seguir."', why: 'Descreve corretamente o mecanismo: escolha a partir de probabilidades aprendidas.' },
      { type: 'example', kind: 'incorreto', text: '"O LLM procurou a resposta certa num banco de dados e copiou."', why: 'Um LLM não é um banco de dados de respostas prontas. Ele gera cada token na hora. (Alguns aplicativos combinam o modelo com buscas em documentos — isso é o RAG, do Mundo 4 —, mas é um recurso a mais, não o funcionamento do modelo.)' },
      { type: 'misconception', wrong: 'O modelo pensa a frase inteira antes e depois escreve.', right: 'A geração acontece token a token. O texto que já foi gerado influencia os próximos tokens. Modelos "de raciocínio" (módulo 1.7) geram etapas intermediárias antes da resposta final, mas também token a token.' },
      { type: 'misconception', wrong: 'Se a resposta soa segura e bem escrita, ela está certa.', right: 'Fluência é o que o modelo foi treinado para produzir. Ela não é evidência de veracidade.' },
      { type: 'summary', items: [
        'Um modelo é uma função com bilhões de parâmetros ajustados no treinamento.',
        'O LLM calcula probabilidades para o próximo token, escolhe um, acrescenta e repete.',
        'As probabilidades vêm de padrões aprendidos em grandes volumes de texto.',
        'Provável não é o mesmo que verdadeiro: fluência não prova correção.',
      ] },
    ],
  },
  {
    id: '1.1.3', moduleId: M, order: 3, estimatedMinutes: 25, status: 'complementar',
    title: 'Como um LLM é treinado: pré-treinamento, ajuste fino e alinhamento',
    goal: 'Ao final, você coloca em ordem as fases de criação de um assistente e explica, para cada uma, o que ela acrescenta — partindo de um modelo que só completa textos até um assistente que segue instruções.',
    objectiveIds: ['1.1-O3'],
    prerequisites: ['Lição 1.1.2 (previsão do próximo token).'],
    glossaryIds: ['pre-treinamento', 'modelo-base', 'ajuste-fino-supervisionado', 'rlhf', 'alinhamento'],
    referenceIds: ['instructgpt-paper', 'karpathy-deep-dive', 'hf-llm-course-ch1'],
    checkQuestionIds: ['q1.1-11', 'q1.1-12', 'q1.1-13', 'q1.1-14', 'q1.1-15'],
    blocks: [
      { type: 'callout', tone: 'pdf', title: 'O que o PDF da trilha pede', text: 'Entenda as fases: pré-treinamento, ajuste fino e alinhamento com feedback humano.' },
      { type: 'p', text: 'Um assistente como o ChatGPT ou o Claude não nasce pronto. Ele passa por fases, e cada uma resolve um problema que a anterior deixou. Entender essas fases explica por que o modelo sabe muitas coisas, por que ele responde em formato de conversa e por que ele recusa certos pedidos.' },
      { type: 'diagram', diagram: 'training-pipeline', caption: 'Da coleta de textos ao assistente: cada fase parte do modelo produzido pela anterior.' },
      { type: 'h', text: 'Fase 1 — Pré-treinamento: aprender a linguagem e o mundo' },
      { type: 'term', term: 'Pré-treinamento', english: 'pre-training', definition: 'O modelo recebe uma quantidade enorme de texto e, trecho por trecho, tenta prever o próximo token. A cada erro, os parâmetros são ajustados um pouco. Não é preciso que alguém rotule os dados: o próprio texto já traz a "resposta certa" (o token que de fato veio depois).' },
      { type: 'p', text: 'Essa é de longe a fase mais cara: exige milhares de chips especializados (GPUs) trabalhando por semanas ou meses. O resultado é um **modelo-base**: ele conhece gramática, fatos, estilos e até código, mas só sabe **continuar textos**.' },
      { type: 'example', kind: 'correto', text: 'Se você escreve para um modelo-base "Qual é a capital da França?", ele pode responder "Qual é a capital da Alemanha? Qual é a capital da Itália?".', why: 'Para um modelo-base, uma pergunta parece o início de uma lista de perguntas, algo comum em textos da internet. Ele continua o padrão em vez de responder.' },
      { type: 'h', text: 'Fase 2 — Ajuste fino supervisionado: aprender a ser assistente' },
      { type: 'term', term: 'Ajuste fino supervisionado', english: 'supervised fine-tuning, SFT', definition: 'O modelo-base continua sendo treinado, agora com um conjunto muito menor de exemplos escritos por pessoas, no formato "instrução → resposta ideal". Assim ele aprende o formato de uma conversa: quando recebe um pedido, responde.' },
      { type: 'analogy', title: 'Analogia: o estagiário que leu a biblioteca inteira', text: 'O pré-treinamento é como alguém que leu uma biblioteca enorme, mas nunca trabalhou com atendimento. O ajuste fino é o treinamento no novo emprego: ver centenas de exemplos de como responder bem a um cliente.' },
      { type: 'h', text: 'Fase 3 — Alinhamento com feedback humano: preferir respostas melhores' },
      { type: 'term', term: 'RLHF', english: 'reinforcement learning from human feedback', definition: 'Aprendizado por reforço com feedback humano. Pessoas avaliam várias respostas do modelo para o mesmo pedido e indicam quais são melhores. Com essas comparações, treina-se um "modelo de recompensa" que imita a preferência humana. Depois, o LLM é ajustado para produzir respostas que esse modelo de recompensa avalia bem.' },
      { type: 'p', text: 'É nessa fase que o modelo aprende a ser mais útil, mais honesto sobre o que não sabe e a recusar pedidos perigosos. O artigo científico que popularizou esse processo em três etapas — exemplos escritos por pessoas, comparação de respostas e aprendizado por reforço — é o do InstructGPT (Ouyang e colegas, 2022), indicado nas referências. Hoje existem variações e métodos mais novos, mas a ideia central é a mesma: **usar preferências humanas para orientar o comportamento**.' },
      { type: 'callout', tone: 'info', title: 'Conteúdo complementar', text: 'Os detalhes de cada empresa variam e nem sempre são públicos. O que está nesta lição é o esquema geral descrito em fontes abertas, não a receita exata de um produto específico.' },
      { type: 'h', text: 'Resumo da sequência' },
      { type: 'list', ordered: true, items: [
        'Coletar e filtrar grandes volumes de texto.',
        'Pré-treinamento: prever o próximo token → modelo-base.',
        'Ajuste fino supervisionado: exemplos de instrução e resposta → modelo que segue instruções.',
        'Coletar comparações humanas entre respostas.',
        'Aprendizado por reforço com essas preferências → assistente alinhado.',
        'Disponibilizar para uso (inferência).',
      ] },
      { type: 'misconception', wrong: 'O alinhamento ensina ao modelo todos os fatos que ele sabe.', right: 'Quase todo o conhecimento vem do pré-treinamento. O ajuste fino e o alinhamento mudam principalmente o comportamento: formato, tom, utilidade, recusas.' },
      { type: 'misconception', wrong: 'Depois do alinhamento, o modelo não erra mais.', right: 'O alinhamento reduz certos problemas, mas não elimina alucinações nem vieses. A verificação humana continua necessária.' },
      { type: 'example', kind: 'incorreto', text: '"O ajuste fino é a fase mais cara, porque usa mais dados."', why: 'É o contrário: o ajuste fino usa muito menos dados que o pré-treinamento. A fase mais cara em computação é o pré-treinamento.' },
      { type: 'summary', items: [
        'Pré-treinamento: prever o próximo token em muito texto; gera um modelo-base que só continua textos.',
        'Ajuste fino supervisionado: exemplos de instrução e resposta ensinam o formato de assistente.',
        'Alinhamento com feedback humano (RLHF): comparações de respostas ensinam a preferir respostas melhores.',
        'O conhecimento vem sobretudo do pré-treinamento; o comportamento, das fases seguintes.',
      ] },
    ],
  },
  {
    id: '1.1.4', moduleId: M, order: 4, estimatedMinutes: 20, status: 'complementar',
    title: 'Treinamento ou uso? O que um LLM é — e o que não é',
    goal: 'Ao final, você diferencia treinamento de inferência, explica o que acontece com o modelo durante uma conversa e aponta três limitações que exigem verificação antes de usar uma resposta.',
    objectiveIds: ['1.1-O4', '1.1-O5'],
    prerequisites: ['Lições 1.1.2 e 1.1.3.'],
    glossaryIds: ['inferencia', 'janela-contexto', 'alucinacao'],
    referenceIds: ['google-intro-llm', 'karpathy-intro-llms'],
    checkQuestionIds: ['q1.1-16', 'q1.1-17', 'q1.1-18', 'q1.1-19', 'q1.1-20'],
    blocks: [
      { type: 'p', text: 'Agora que você sabe como um LLM é criado, falta separar duas coisas que muita gente confunde: **treinar** um modelo e **usar** um modelo.' },
      { type: 'term', term: 'Inferência', english: 'inference', definition: 'Usar um modelo já treinado para gerar uma saída a partir de uma entrada nova. Cada vez que você manda uma mensagem num chat, acontece uma inferência.' },
      { type: 'p', text: 'Durante a inferência, **os parâmetros do modelo não mudam**. Os botões da mesa de som continuam na mesma posição. O modelo que responde à sua décima mensagem é exatamente o mesmo que respondeu à primeira.' },
      { type: 'h', text: 'Então como ele "lembra" do que eu disse antes?' },
      { type: 'p', text: 'Porque o aplicativo reenvia o histórico da conversa a cada nova mensagem. Tudo o que o modelo enxerga de uma vez — instruções, histórico, arquivos — cabe numa **janela de contexto** de tamanho limitado (módulo 1.3). A "memória" da conversa está no texto enviado, não nos parâmetros.' },
      { type: 'diagram', diagram: 'model-vs-app', caption: 'O modelo fica no centro e não muda durante o uso. O aplicativo ao redor monta o contexto (instruções, histórico, memórias salvas, resultados de busca) e envia tudo a cada mensagem.' },
      { type: 'h', text: 'Modelo não é o mesmo que aplicativo' },
      { type: 'p', text: 'ChatGPT, Claude e Gemini são **aplicativos**. Eles usam um ou mais modelos e acrescentam recursos: busca na web, leitura de arquivos, "memória" entre conversas, execução de código. Quando um aplicativo "lembra" de você em outra conversa, em geral ele guardou um texto e o insere no contexto — isso não é retreinar o modelo.' },
      { type: 'callout', tone: 'seguranca', title: 'Privacidade: uso agora × treinamento futuro', text: 'Sua conversa não altera o modelo enquanto você conversa. Mas, conforme os termos e as configurações de cada serviço, as conversas podem ser guardadas e usadas para treinar versões futuras. O PDF recomenda conferir essa opção nas configurações de privacidade de cada aplicativo. Nunca cole senhas, dados pessoais de terceiros ou documentos sigilosos (módulo 1.8).' },
      { type: 'h', text: 'Três limitações que exigem verificação' },
      { type: 'list', items: [
        '**Fluência não é verdade.** O modelo gera o que é provável; pode inventar números, leis, citações e referências com tom confiante (alucinação, módulo 1.4).',
        '**Conhecimento com data de corte.** O pré-treinamento usou textos até certa data. Sem uma ferramenta de busca, o modelo não sabe o que aconteceu depois (módulo 1.8).',
        '**Contexto limitado e incompleto.** O modelo só considera o que está na janela de contexto. Se uma informação importante não foi enviada — ou ficou de fora por excesso de tamanho —, ele responde sem ela.',
      ] },
      { type: 'example', kind: 'correto', text: 'Antes de enviar a um cliente a resposta que a IA sugeriu sobre prazo de garantia, a atendente confere o prazo no contrato oficial.', why: 'Prazos, valores e regras são exatamente o tipo de informação que o modelo pode gerar de forma plausível e errada.' },
      { type: 'example', kind: 'incorreto', text: '"Expliquei a regra certa três vezes na conversa, então agora o modelo aprendeu para sempre."', why: 'A regra está no contexto desta conversa. Em outra conversa, sem esse texto, o modelo pode errar de novo. Os parâmetros não mudaram.' },
      { type: 'misconception', wrong: 'O modelo consulta a internet para responder.', right: 'O modelo, sozinho, não acessa nada: ele só transforma o texto de entrada em texto de saída. Buscar na web é um recurso de alguns aplicativos, que colocam os resultados no contexto.' },
      { type: 'summary', items: [
        'Treinamento ajusta os parâmetros; inferência usa o modelo sem mudá-los.',
        'A "memória" de uma conversa é o histórico reenviado dentro da janela de contexto.',
        'Aplicativos somam recursos ao modelo (busca, arquivos, memória salva).',
        'Verifique sempre: fluência não é verdade, há data de corte e o contexto é limitado.',
      ] },
    ],
  },
];

/* ======================================================================
 * QUESTÕES — escritas para o piloto. Estado: pendente de revisão humana.
 * ==================================================================== */

const q = (
  n: number,
  objectiveIds: string[],
  stem: string,
  options: [string, string, string, string],
  correct: 0 | 1 | 2 | 3,
  rationale: string,
  distractorRationales: Partial<Record<0 | 1 | 2 | 3, string>>,
  difficulty: Question['difficulty'],
  cognitive: Question['cognitive'],
  referenceIds: string[],
): Question =>
  balance(
    {
      id: `q1.1-${String(n).padStart(2, '0')}`,
      worldId: 1, moduleId: M, objectiveIds, stem, options, correct, rationale, distractorRationales,
      difficulty, cognitive, referenceIds, review: 'pendente-revisao', contentStatus: 'complementar',
      reviewNote: 'Escrita para o módulo piloto; aguarda revisão por uma pessoa antes de uso em simulado completo.',
    },
    n,
  );

export const questions1_1: Question[] = [
  // ---- Lição 1.1.1 · O1
  q(1, ['1.1-O1'], 'Qual afirmação descreve corretamente a relação entre inteligência artificial e aprendizado de máquina?',
    ['Aprendizado de máquina é uma das abordagens dentro do campo da IA.', 'IA e aprendizado de máquina são nomes diferentes para a mesma coisa.', 'IA é uma parte do aprendizado de máquina, voltada para robôs.', 'Aprendizado de máquina é a área que estuda apenas computadores físicos.'],
    0, 'Aprendizado de máquina é um subconjunto da IA: a parte que aprende a partir de dados. Existem sistemas de IA que não aprendem com dados.',
    { 1: 'Não são sinônimos: há IA baseada só em regras, sem aprendizado.', 2: 'A relação é inversa: aprendizado de máquina está dentro da IA, e IA não se limita a robôs.', 3: 'Aprendizado de máquina trata de algoritmos que aprendem com dados, não de hardware.' },
    'basica', 'compreensao', ['elements-of-ai']),
  q(2, ['1.1-O1'], 'Uma planilha marca automaticamente um pedido como "urgente" sempre que a descrição contém a palavra "urgente". Como esse sistema se classifica?',
    ['IA generativa, porque produz uma marcação automaticamente.', 'Aprendizado profundo, porque analisa texto.', 'Sistema baseado em regras, sem aprendizado de máquina.', 'Aprendizado de máquina, porque toma decisões sozinho.'],
    2, 'Alguém escreveu a regra ("se contém a palavra, marque"). O sistema não aprendeu nada com exemplos, então não é aprendizado de máquina.',
    { 0: 'Marcar um rótulo não é gerar conteúdo novo; e não houve aprendizado.', 1: 'Analisar texto não basta: aprendizado profundo exige uma rede neural treinada com dados.', 3: 'Tomar uma decisão automática por regra fixa não é aprender com dados.' },
    'basica', 'aplicacao', ['elements-of-ai']),
  q(3, ['1.1-O1'], 'O que a palavra "profundo" significa em "aprendizado profundo" (deep learning)?',
    ['Que o modelo compreende o assunto com profundidade, como um especialista.', 'Que a rede neural tem muitas camadas de processamento.', 'Que o treinamento usa dados extraídos da "deep web".', 'Que o modelo só funciona com perguntas complexas.'],
    1, '"Profundo" se refere à arquitetura: redes neurais com muitas camadas empilhadas.',
    { 0: 'Essa é a interpretação equivocada mais comum. Profundidade descreve camadas, não compreensão.', 2: 'Não há relação com a "deep web".', 3: 'Modelos de deep learning também respondem a perguntas simples; o termo não fala sobre o tipo de pergunta.' },
    'basica', 'compreensao', ['google-intro-genai']),
  q(4, ['1.1-O1'], 'Uma loja usa dois sistemas: (A) um modelo treinado com o histórico de vendas que prevê quantas unidades serão vendidas no mês; (B) um assistente que escreve a descrição de um produto novo a partir de uma lista de características. Qual classificação está correta?',
    ['A e B são IA generativa, pois ambos usam IA.', 'A é IA generativa e B é aprendizado de máquina sem geração.', 'A é aprendizado de máquina que prevê um número; B é IA generativa.', 'Nenhum dos dois usa aprendizado de máquina.'],
    2, 'A aprende com dados e devolve uma previsão (um número). B produz conteúdo novo (um texto), o que caracteriza IA generativa.',
    { 0: 'Prever um número não é gerar conteúdo novo; nem toda IA é generativa.', 1: 'A classificação está invertida.', 3: 'Os dois foram treinados com dados; ambos são aprendizado de máquina.' },
    'intermediaria', 'aplicacao', ['google-intro-genai']),
  q(5, ['1.1-O1'], 'Por que é correto dizer que um LLM pertence, ao mesmo tempo, à IA, ao aprendizado de máquina, ao aprendizado profundo e à IA generativa?',
    ['Porque um LLM aprende com dados, usa uma rede neural de muitas camadas e produz texto novo.', 'Porque os quatro termos são sinônimos e podem ser usados livremente.', 'Porque todo sistema de IA moderno pertence obrigatoriamente aos quatro campos.', 'Porque um LLM combina quatro programas diferentes, um de cada campo.'],
    0, 'Os campos estão contidos uns nos outros. O LLM atende a todos os critérios: aprende com dados, é uma rede neural profunda e gera conteúdo.',
    { 1: 'Os termos não são sinônimos; eles têm abrangências diferentes.', 2: 'Muitos sistemas modernos não são generativos (por exemplo, um detector de fraudes).', 3: 'É um único modelo; ele pertence aos quatro círculos por suas características, não por ter quatro partes.' },
    'intermediaria', 'interpretacao', ['google-intro-genai']),

  // ---- Lição 1.1.2 · O2 (+O5)
  q(6, ['1.1-O2'], 'Qual descrição corresponde melhor ao que um LLM faz ao gerar uma resposta?',
    ['Procura a resposta pronta mais parecida num banco de dados e a copia.', 'Calcula probabilidades para o próximo token, escolhe um, acrescenta ao texto e repete.', 'Planeja a resposta inteira de uma vez e depois a traduz para palavras.', 'Pesquisa na internet e resume os primeiros resultados.'],
    1, 'É a geração autorregressiva: um token de cada vez, cada um condicionado ao texto anterior.',
    { 0: 'Um LLM não armazena respostas prontas; ele gera cada token na hora.', 2: 'A geração é token a token; o texto já gerado influencia o próximo token.', 3: 'O modelo, sozinho, não acessa a internet. Busca é um recurso de alguns aplicativos.' },
    'basica', 'compreensao', ['3b1b-llm-briefly']),
  q(7, ['1.1-O2'], 'Um modelo recebe "O café da manhã de hoje foi pão com" e calcula: "manteiga" 46%, "queijo" 22%, "café" 12%. Se o sistema sempre escolher a opção mais provável, o que acontece a seguir?',
    ['O texto termina, porque a previsão já foi feita.', '"manteiga" é acrescentado e o modelo calcula novas probabilidades para o token seguinte.', 'O modelo mostra as três opções e pede para a pessoa escolher.', 'O modelo acrescenta as três palavras, em ordem de probabilidade.'],
    1, 'Escolhido o token, ele entra no texto e o ciclo recomeça com o texto maior. A geração continua até um critério de parada.',
    { 0: 'Cada previsão produz só um token; a resposta é montada repetindo o ciclo.', 2: 'A escolha é feita automaticamente pelo sistema de geração.', 3: 'Só um token é escolhido por vez.' },
    'intermediaria', 'aplicacao', ['3b1b-llm-briefly']),
  q(8, ['1.1-O2'], 'O que são os parâmetros (ou pesos) de um LLM?',
    ['As configurações que o usuário escolhe no aplicativo, como idioma e tema.', 'Números internos do modelo, ajustados durante o treinamento, que determinam suas previsões.', 'As palavras que o modelo tem permissão de usar.', 'Os documentos usados no treinamento, guardados dentro do modelo.'],
    1, 'Parâmetros são os bilhões de números ajustados no treinamento. Eles definem como a entrada vira probabilidades de saída.',
    { 0: 'Isso são configurações do aplicativo. Cuidado também com "parâmetros de geração", como temperatura (módulo 1.6), que são outra coisa.', 2: 'O conjunto de tokens possíveis é o vocabulário, não os parâmetros.', 3: 'O modelo não guarda cópias dos documentos; ele guarda padrões estatísticos nos parâmetros.' },
    'basica', 'compreensao', ['google-mlcc-intro-llms']),
  q(9, ['1.1-O2'], 'De onde vêm as probabilidades que um LLM calcula para o próximo token?',
    ['De regras gramaticais escritas manualmente por linguistas.', 'De padrões aprendidos ao treinar com grandes volumes de texto.', 'De uma consulta em tempo real a enciclopédias confiáveis.', 'De um sorteio sem relação com o texto anterior.'],
    1, 'Durante o pré-treinamento, o modelo ajusta seus parâmetros para prever bem o próximo token em grandes volumes de texto. As probabilidades refletem esses padrões e o contexto atual.',
    { 0: 'LLMs não são construídos com regras escritas à mão; eles aprendem com dados.', 2: 'O modelo não consulta fontes ao responder, a menos que o aplicativo acrescente uma busca.', 3: 'As probabilidades dependem fortemente do texto anterior; não são aleatórias.' },
    'basica', 'compreensao', ['google-mlcc-intro-llms', '3b1b-llm-briefly']),
  q(10, ['1.1-O5', '1.1-O2'], 'Um LLM responde com total segurança que uma lei foi publicada em determinado ano, e o ano está errado. Qual explicação é mais adequada?',
    ['O modelo mentiu de propósito para enganar o usuário.', 'O modelo gera a continuação mais plausível, e plausibilidade não garante veracidade.', 'O modelo estava com defeito e precisa ser reinstalado.', 'Isso só acontece quando a pergunta é feita em português.'],
    1, 'O treinamento otimiza a previsão do que é provável num texto. Quando falta informação confiável, o modelo ainda produz algo plausível, com o mesmo tom confiante.',
    { 0: 'Não há intenção: o modelo não "decide enganar". O erro é consequência do mecanismo de geração.', 2: 'Não é um defeito pontual; é uma limitação conhecida de todos os LLMs (módulo 1.4).', 3: 'Alucinações acontecem em qualquer idioma.' },
    'intermediaria', 'interpretacao', ['google-mlcc-intro-llms']),

  // ---- Lição 1.1.3 · O3
  q(11, ['1.1-O3'], 'Qual é a ordem correta das fases de criação de um assistente de IA?',
    ['Alinhamento com feedback humano → pré-treinamento → ajuste fino supervisionado.', 'Pré-treinamento → ajuste fino supervisionado → alinhamento com feedback humano.', 'Ajuste fino supervisionado → pré-treinamento → alinhamento com feedback humano.', 'Pré-treinamento → alinhamento com feedback humano → coleta dos textos.'],
    1, 'Primeiro o modelo aprende com muito texto (pré-treinamento), depois aprende o formato de assistente (ajuste fino) e por fim é ajustado com preferências humanas (alinhamento).',
    { 0: 'O alinhamento parte de um modelo que já foi pré-treinado e ajustado.', 2: 'O ajuste fino é aplicado sobre um modelo-base, que só existe depois do pré-treinamento.', 3: 'A coleta de textos acontece antes do pré-treinamento, não no fim.' },
    'basica', 'compreensao', ['instructgpt-paper']),
  q(12, ['1.1-O3'], 'Você envia "Qual é a capital da França?" a um modelo que passou APENAS pelo pré-treinamento. Qual resultado é mais provável e por quê?',
    ['"Paris." — porque o pré-treinamento já ensina o modelo a responder perguntas diretamente.', 'Uma continuação como "Qual é a capital da Alemanha?", porque o modelo-base aprendeu a continuar textos, não a seguir instruções.', 'Uma mensagem de erro, porque modelos-base não aceitam perguntas.', 'Uma recusa educada, porque o modelo ainda não foi alinhado.'],
    1, 'O modelo-base continua padrões de texto. Uma pergunta isolada pode parecer o início de uma lista de perguntas, então ele continua a lista. O formato pergunta-resposta é aprendido no ajuste fino.',
    { 0: 'O modelo-base até "sabe" o fato, mas não foi treinado para responder no formato de assistente; a resposta direta não é garantida.', 2: 'O modelo-base aceita qualquer texto; ele simplesmente o continua.', 3: 'Recusas educadas são justamente um comportamento aprendido no alinhamento, que ainda não aconteceu.' },
    'intermediaria', 'interpretacao', ['karpathy-deep-dive']),
  q(13, ['1.1-O3'], 'No alinhamento com feedback humano (RLHF), qual é o papel das pessoas?',
    ['Escrever todos os textos usados no pré-treinamento.', 'Comparar respostas do modelo e indicar quais são melhores, para orientar o ajuste.', 'Programar manualmente cada resposta que o modelo pode dar.', 'Verificar, em tempo real, cada resposta antes de ela chegar ao usuário.'],
    1, 'As comparações humanas treinam um modelo de recompensa, que passa a orientar o ajuste do LLM para produzir respostas preferidas.',
    { 0: 'O pré-treinamento usa enormes volumes de texto já existentes, não textos escritos para isso.', 2: 'As respostas continuam sendo geradas pelo modelo; pessoas não programam cada uma.', 3: 'O feedback é usado no treinamento, antes da disponibilização, não como revisão ao vivo de cada resposta.' },
    'basica', 'compreensao', ['instructgpt-paper']),
  q(14, ['1.1-O3'], 'Qual fase costuma consumir MAIS recursos de computação (chips, energia e tempo)?',
    ['O ajuste fino supervisionado, porque exige exemplos escritos por pessoas.', 'O pré-treinamento, porque processa volumes enormes de texto para ajustar bilhões de parâmetros.', 'A inferência de uma única pergunta, porque o modelo precisa "pensar".', 'O alinhamento, porque exige reescrever o modelo do zero.'],
    1, 'O pré-treinamento processa trilhões de tokens ao longo de semanas ou meses em milhares de GPUs. As fases seguintes usam muito menos dados.',
    { 0: 'Exemplos escritos por pessoas têm custo humano, mas o volume de dados e de computação é bem menor.', 2: 'Uma única inferência é barata se comparada ao treinamento (embora o custo de muitas inferências some, como você verá no módulo 1.9).', 3: 'O alinhamento ajusta um modelo existente; não o reescreve do zero.' },
    'intermediaria', 'compreensao', ['karpathy-deep-dive']),
  q(15, ['1.1-O3'], 'Uma colega diz: "Depois do alinhamento, o modelo aprendeu todos os fatos que sabe e parou de errar." O que está errado nessa frase?',
    ['Nada; o alinhamento é a fase em que o modelo aprende fatos e elimina erros.', 'O conhecimento vem principalmente do pré-treinamento, e o alinhamento reduz alguns problemas sem eliminar erros.', 'O alinhamento só existe em modelos de imagem, não em LLMs.', 'O alinhamento apaga o conhecimento do pré-treinamento para evitar erros.'],
    1, 'O alinhamento muda sobretudo o comportamento (formato, tom, recusas, honestidade). O conhecimento vem do pré-treinamento, e alucinações continuam possíveis.',
    { 0: 'Atribui ao alinhamento um papel que ele não tem.', 2: 'O alinhamento com feedback humano é central nos assistentes de texto atuais.', 3: 'O alinhamento não apaga o conhecimento; ele ajusta como o modelo responde.' },
    'avancada', 'interpretacao', ['instructgpt-paper']),

  // ---- Lição 1.1.4 · O4 e O5
  q(16, ['1.1-O4'], 'O que acontece com os parâmetros de um LLM enquanto você conversa com ele num aplicativo?',
    ['São atualizados a cada mensagem, para o modelo aprender com você.', 'Permanecem os mesmos; o modelo usa o histórico enviado no contexto.', 'São apagados ao final de cada resposta e recarregados.', 'Mudam apenas quando você elogia a resposta.'],
    1, 'Conversar é inferência. Os parâmetros ficam fixos; o que muda é o texto enviado (histórico, instruções, arquivos) dentro da janela de contexto.',
    { 0: 'Atualizar parâmetros é treinamento, um processo separado e caro, que não acontece durante a conversa.', 2: 'Os parâmetros não são apagados; o mesmo modelo responde a todas as mensagens.', 3: 'Avaliações podem ser coletadas para treinar versões futuras, mas não alteram o modelo durante a conversa.' },
    'basica', 'compreensao', ['google-intro-llm']),
  q(17, ['1.1-O4'], 'Num aplicativo de chat, você explica uma regra da sua empresa. Dias depois, numa conversa nova, a IA erra a mesma regra. Qual explicação é mais provável?',
    ['O modelo esqueceu porque seus parâmetros foram apagados.', 'A regra estava no contexto da conversa antiga, não nos parâmetros; a conversa nova não traz esse texto.', 'A empresa responsável retreinou o modelo para remover sua regra.', 'O modelo erra de propósito para você reforçar o ensino.'],
    1, 'O que você ensina numa conversa vale para aquele contexto. Uma conversa nova começa sem esse texto, a não ser que o aplicativo tenha um recurso de memória que o reinsira.',
    { 0: 'Os parâmetros não guardavam a regra e não foram apagados.', 2: 'Não há indício de retreinamento; a explicação mais simples é a ausência da regra no novo contexto.', 3: 'O modelo não tem intenções pedagógicas.' },
    'intermediaria', 'resolucao', ['google-intro-llm']),
  q(18, ['1.1-O4'], 'Qual situação é um exemplo de inferência, e não de treinamento?',
    ['Uma empresa ajusta um modelo com milhares de exemplos de atendimento.', 'Um modelo processa trilhões de tokens para aprender a prever o próximo token.', 'Uma pessoa pede ao assistente um resumo de um texto e recebe a resposta.', 'Pessoas comparam pares de respostas para criar um modelo de recompensa.'],
    2, 'Pedir uma resposta a um modelo pronto é inferência. As outras opções descrevem fases de treinamento.',
    { 0: 'É ajuste fino, uma forma de treinamento.', 1: 'É pré-treinamento.', 3: 'É parte do alinhamento com feedback humano, também uma fase de treinamento.' },
    'basica', 'aplicacao', ['google-intro-llm']),
  q(19, ['1.1-O5'], 'Uma loja de autopeças quer usar um assistente de IA para responder clientes. Qual uso exige verificação em fonte oficial ANTES de a resposta chegar ao cliente?',
    ['Reescrever uma mensagem de boas-vindas em tom mais cordial.', 'Informar se uma peça específica é compatível com o modelo e o ano do carro do cliente.', 'Sugerir três formas educadas de dizer que a loja fecha às 18h.', 'Corrigir erros de digitação num aviso interno.'],
    1, 'Compatibilidade de peças é informação factual e específica, com consequência real se estiver errada. O modelo pode gerar uma resposta plausível e falsa; é preciso conferir no catálogo do fabricante.',
    { 0: 'Mudar o tom de um texto fornecido é tarefa de baixo risco; uma revisão rápida basta.', 2: 'O fato (horário) foi dado por você; o modelo só varia a redação.', 3: 'Correção de digitação é de baixo risco e fácil de revisar.' },
    'intermediaria', 'resolucao', ['google-intro-llm']),
  q(20, ['1.1-O5'], 'Qual conjunto reúne três limitações de um LLM que justificam verificar respostas importantes?',
    ['Ele é lento, caro e só funciona em inglês.', 'Fluência não garante veracidade, o conhecimento tem data de corte e ele só considera o que está no contexto.', 'Ele não entende perguntas, não escreve em português e não aceita textos longos.', 'Ele sempre consulta fontes desatualizadas, apaga conversas e muda de opinião ao acaso.'],
    1, 'São limitações estruturais: o mecanismo gera o que é provável; o pré-treinamento tem uma data limite; e a janela de contexto é limitada ao que foi enviado.',
    { 0: 'Velocidade e custo variam e não são, em si, motivo para verificar fatos; e LLMs funcionam em muitos idiomas.', 2: 'LLMs lidam bem com perguntas, com o português e com textos razoavelmente longos.', 3: 'O modelo não "consulta fontes" sozinho; as outras afirmações não descrevem o funcionamento real.' },
    'avancada', 'interpretacao', ['google-intro-llm']),
];

/* ======================================================================
 * FLASHCARDS
 * ==================================================================== */

const card = (n: number, objectiveIds: string[], front: string, back: string, referenceIds: string[]): Flashcard => ({
  id: `f1.1-${String(n).padStart(2, '0')}`, moduleId: M, worldId: 1, objectiveIds, front, back, referenceIds, status: 'complementar',
});

export const flashcards1_1: Flashcard[] = [
  card(1, ['1.1-O1'], 'Coloque em ordem, do mais amplo ao mais específico: IA generativa, IA, aprendizado profundo, aprendizado de máquina.', 'IA ⊃ aprendizado de máquina ⊃ aprendizado profundo ⊃ (a maior parte da) IA generativa atual.', ['elements-of-ai']),
  card(2, ['1.1-O1'], 'Quais duas perguntas ajudam a classificar um sistema de IA?', '1) Ele aprendeu com exemplos ou segue regras escritas? 2) Ele produz conteúdo novo ou só classifica/prevê?', ['elements-of-ai']),
  card(3, ['1.1-O1'], 'O que significa "profundo" em aprendizado profundo?', 'Que a rede neural tem muitas camadas. Não significa compreensão profunda.', ['google-intro-genai']),
  card(4, ['1.1-O2'], 'Em uma frase: o que um LLM faz?', 'Prevê o próximo token com base em padrões aprendidos em grandes volumes de texto, um token de cada vez.', ['3b1b-llm-briefly']),
  card(5, ['1.1-O2'], 'O que é geração autorregressiva?', 'Gerar um token por vez: cada token escolhido é acrescentado ao texto e usado para prever o seguinte.', ['3b1b-llm-briefly']),
  card(6, ['1.1-O2'], 'O que são parâmetros (pesos) de um modelo?', 'Os bilhões de números internos ajustados no treinamento que transformam a entrada em probabilidades de saída.', ['google-mlcc-intro-llms']),
  card(7, ['1.1-O3'], 'O que o pré-treinamento produz?', 'Um modelo-base: sabe continuar textos e tem muito conhecimento, mas ainda não segue instruções como assistente.', ['karpathy-deep-dive']),
  card(8, ['1.1-O3'], 'O que o ajuste fino supervisionado ensina?', 'O formato de assistente, usando exemplos de instrução → resposta escritos por pessoas.', ['instructgpt-paper']),
  card(9, ['1.1-O3'], 'Como funciona o RLHF, em três passos?', 'Pessoas comparam respostas → treina-se um modelo de recompensa com essas preferências → o LLM é ajustado para obter recompensas altas.', ['instructgpt-paper']),
  card(10, ['1.1-O4'], 'Treinamento × inferência: qual muda os parâmetros?', 'Só o treinamento. Inferência (usar o modelo, conversar) não muda os parâmetros.', ['google-intro-llm']),
  card(11, ['1.1-O4'], 'Se o modelo não muda durante a conversa, como ele "lembra" do que eu disse?', 'O aplicativo reenvia o histórico dentro da janela de contexto a cada mensagem.', ['google-intro-llm']),
  card(12, ['1.1-O5'], 'Três motivos para verificar uma resposta importante de um LLM.', 'Fluência não é verdade (alucinação); conhecimento tem data de corte; o modelo só vê o que está no contexto.', ['google-intro-llm']),
];

/* ======================================================================
 * NÍVEL 2 — PRATICAR
 * ==================================================================== */

export const activities1_1: Activity[] = [
  {
    kind: 'demo', id: 'a1.1-demo', moduleId: M, widget: 'next-token', level: 'demonstracao', essential: false,
    title: 'Demonstração guiada: o simulador de próximo token',
    objectiveIds: ['1.1-O2'], estimatedMinutes: 10,
    instructions: [
      'Leia a frase inicial e observe a lista de candidatos com suas probabilidades.',
      'Clique em "Escolher o mais provável" para ver a decodificação gulosa (sempre o maior valor).',
      'Recomece e escolha manualmente um candidato menos provável. Observe como a lista seguinte muda.',
      'Repare: em nenhum momento o simulador "verifica" se a frase é verdadeira. Ele só segue probabilidades.',
    ],
    hints: ['O simulador usa uma tabela pequena com probabilidades inventadas. Um LLM real calcula valores para dezenas de milhares de tokens.'],
    commonErrors: ['Achar que o modelo escolhe a frase inteira de uma vez: observe que a lista muda a cada token.'],
  },
  {
    kind: 'classify', id: 'a1.1-classify', moduleId: M, level: 'introdutorio', essential: true, passThreshold: 0.8,
    title: 'Exercício introdutório: classifique os sistemas',
    objectiveIds: ['1.1-O1'], estimatedMinutes: 10,
    instructions: [
      'Para cada sistema, escolha a categoria que melhor o descreve.',
      'Use as duas perguntas da lição: aprendeu com dados? produz conteúdo novo?',
      'Clique em "Corrigir" para ver a explicação de cada item. Você pode refazer quantas vezes quiser.',
    ],
    categories: [
      { id: 'regras', label: 'Regras escritas por pessoas (sem aprendizado de máquina)' },
      { id: 'aprende', label: 'Aprende com dados e classifica ou prevê (não gera conteúdo)' },
      { id: 'generativa', label: 'IA generativa (produz conteúdo novo)' },
    ],
    items: [
      { id: 'i1', text: 'Termostato que liga o ar-condicionado sempre que a temperatura passa de 26 °C.', category: 'regras', explanation: 'Regra fixa definida por uma pessoa ("acima de 26 °C, ligue"). Nada é aprendido.' },
      { id: 'i2', text: 'Filtro de spam treinado com milhares de e-mails marcados como "spam" ou "não spam".', category: 'aprende', explanation: 'Aprendeu com exemplos rotulados e devolve um rótulo. Não cria conteúdo.' },
      { id: 'i3', text: 'Assistente que redige uma resposta a um cliente a partir da reclamação recebida.', category: 'generativa', explanation: 'Produz um texto novo — típico de IA generativa.' },
      { id: 'i4', text: 'Calculadora de frete que consulta uma tabela de preços por faixa de CEP.', category: 'regras', explanation: 'Consulta de tabela é lógica programada; não há aprendizado com dados.' },
      { id: 'i5', text: 'Desbloqueio do celular por reconhecimento facial.', category: 'aprende', explanation: 'Um modelo treinado com imagens decide "é o dono" ou "não é". Classifica, não gera.' },
      { id: 'i6', text: 'Ferramenta que cria uma imagem a partir da descrição "gato astronauta em aquarela".', category: 'generativa', explanation: 'Produz uma imagem nova a partir de texto.' },
      { id: 'i7', text: 'Sistema que prevê a demanda de estoque do mês com base no histórico de vendas.', category: 'aprende', explanation: 'Aprendeu com dados históricos e devolve um número previsto.' },
      { id: 'i8', text: 'Ferramenta que transforma a gravação de uma reunião em um resumo com tarefas.', category: 'generativa', explanation: 'O resumo é um texto novo, escrito pelo sistema.' },
      { id: 'i9', text: 'Recomendação de filmes baseada no que você assistiu antes.', category: 'aprende', explanation: 'Aprende padrões de preferência e prevê o que você vai gostar; escolhe itens existentes, não cria novos.' },
      { id: 'i10', text: 'Formulário que recusa CPF com quantidade de dígitos diferente de 11.', category: 'regras', explanation: 'Validação por regra explícita.' },
    ],
    hints: [
      'Comece pela pergunta mais fácil: o sistema cria algo que não existia (texto, imagem, resumo)? Se sim, é generativo.',
      'Se não cria nada, pergunte: alguém poderia escrever a regra completa numa frase? Se sim, provavelmente é regra fixa.',
      'Sistemas que "reconhecem" ou "preveem" a partir de muitos exemplos costumam ser aprendizado de máquina.',
    ],
    commonErrors: [
      'Classificar como IA generativa tudo o que parece moderno ou automático. Automação não é geração.',
      'Achar que reconhecimento facial é generativo: ele decide, não cria.',
      'Classificar recomendação como generativa: ela escolhe entre itens que já existem.',
    ],
  },
  {
    kind: 'order', id: 'a1.1-order', moduleId: M, level: 'intermediario', essential: true, passThreshold: 1,
    title: 'Exercício intermediário: monte a linha do tempo de um assistente',
    objectiveIds: ['1.1-O3'], estimatedMinutes: 10,
    instructions: [
      'Os passos de criação de um assistente estão embaralhados.',
      'Use os botões "Subir" e "Descer" para colocá-los na ordem correta.',
      'Clique em "Corrigir". Para concluir, todos os passos precisam estar na posição certa.',
    ],
    steps: [
      { id: 's1', text: 'Coletar e filtrar grandes volumes de texto.', explanation: 'Sem dados, não há o que aprender. Esta é a matéria-prima do pré-treinamento.' },
      { id: 's2', text: 'Treinar o modelo para prever o próximo token nesses textos.', explanation: 'Pré-treinamento: gera o modelo-base.' },
      { id: 's3', text: 'Treinar com exemplos de instrução e resposta escritos por pessoas.', explanation: 'Ajuste fino supervisionado: ensina o formato de assistente.' },
      { id: 's4', text: 'Pedir a pessoas que comparem respostas do modelo e indiquem as melhores.', explanation: 'Coleta de preferências para o alinhamento.' },
      { id: 's5', text: 'Ajustar o modelo para preferir respostas bem avaliadas (aprendizado por reforço).', explanation: 'Usa as preferências coletadas (via modelo de recompensa) para orientar o comportamento.' },
      { id: 's6', text: 'Disponibilizar o modelo para as pessoas usarem (inferência).', explanation: 'Só agora o modelo é usado. Durante o uso, seus parâmetros não mudam.' },
    ],
    hints: [
      'O que precisa existir antes de qualquer treinamento?',
      'O modelo-base vem antes do ajuste fino: não dá para ensinar formato de conversa a um modelo que ainda não sabe linguagem.',
      'As comparações humanas são coletadas antes de serem usadas no ajuste por reforço.',
    ],
    commonErrors: [
      'Colocar o ajuste fino antes do pré-treinamento.',
      'Colocar o uso (inferência) no meio: ele só acontece depois do treinamento.',
      'Inverter a coleta de comparações e o ajuste por reforço.',
    ],
  },
  {
    kind: 'judge', id: 'a1.1-judge', moduleId: M, level: 'intermediario', essential: true, passThreshold: 0.8,
    title: 'Exercício intermediário: verdadeiro ou falso sobre como um LLM funciona',
    objectiveIds: ['1.1-O2', '1.1-O4'], estimatedMinutes: 10,
    instructions: ['Marque cada afirmação como verdadeira ou falsa.', 'Depois de corrigir, leia a justificativa de cada item, inclusive dos que você acertou.'],
    statements: [
      { id: 'j1', text: 'Um LLM calcula probabilidades para o próximo token considerando o texto que veio antes.', correct: true, explanation: 'É o mecanismo central do modelo.' },
      { id: 'j2', text: 'Quando você corrige o modelo numa conversa, os parâmetros dele são atualizados na hora.', correct: false, explanation: 'Conversar é inferência; os parâmetros não mudam. A correção fica só no contexto daquela conversa.' },
      { id: 'j3', text: 'O modelo-base, logo após o pré-treinamento, já segue instruções tão bem quanto um assistente.', correct: false, explanation: 'O modelo-base continua textos. Seguir instruções é ensinado no ajuste fino e reforçado no alinhamento.' },
      { id: 'j4', text: 'Uma resposta fluente e confiante pode estar factualmente errada.', correct: true, explanation: 'O modelo otimiza plausibilidade, não verdade.' },
      { id: 'j5', text: 'Todo LLM, por si só, pesquisa na internet antes de responder.', correct: false, explanation: 'O modelo sozinho não acessa a internet. Alguns aplicativos acrescentam busca e colocam os resultados no contexto.' },
      { id: 'j6', text: 'A maior parte do conhecimento do modelo vem do pré-treinamento.', correct: true, explanation: 'As fases seguintes mudam principalmente o comportamento.' },
      { id: 'j7', text: 'A geração de texto acontece um token de cada vez.', correct: true, explanation: 'Geração autorregressiva.' },
      { id: 'j8', text: 'Os parâmetros do modelo são escritos manualmente por engenheiros.', correct: false, explanation: 'Eles são ajustados automaticamente durante o treinamento; são bilhões de valores.' },
    ],
    hints: ['Pergunte-se, para cada frase: isso acontece no treinamento ou durante o uso?', 'Desconfie de afirmações com "todo", "sempre" e "já".'],
    commonErrors: ['Confundir o recurso de um aplicativo (busca, memória) com o funcionamento do modelo.', 'Achar que corrigir o modelo na conversa o "treina".'],
  },
  {
    kind: 'classify', id: 'a1.1-transfer', moduleId: M, level: 'transferencia', essential: true, passThreshold: 0.8,
    title: 'Exercício de transferência: a IA no atendimento de uma loja',
    objectiveIds: ['1.1-O5'], estimatedMinutes: 15,
    instructions: [
      'Cenário: uma loja de autopeças vai usar um assistente de IA no atendimento.',
      'Para cada uso proposto, decida o nível de cuidado necessário.',
      'Aplique o que você aprendeu: o modelo gera o que é provável, tem data de corte e só vê o que está no contexto.',
    ],
    categories: [
      { id: 'revisao-leve', label: 'Pode usar com revisão rápida (baixo risco)' },
      { id: 'verificar', label: 'Exige verificação em fonte oficial antes de usar' },
      { id: 'nao-fazer', label: 'Não deve ser feito (risco de privacidade ou segurança)' },
    ],
    items: [
      { id: 't1', text: 'Reescrever em tom mais cordial uma mensagem de "pedido recebido" já escrita pela equipe.', category: 'revisao-leve', explanation: 'O conteúdo vem da equipe; a IA só ajusta o tom. Uma leitura rápida basta.' },
      { id: 't2', text: 'Responder ao cliente se o filtro de óleo X serve no carro modelo Y, ano 2019.', category: 'verificar', explanation: 'Compatibilidade é um fato específico. A resposta pode ser plausível e errada; confira no catálogo do fabricante.' },
      { id: 't3', text: 'Colar a planilha com nome, CPF e telefone de todos os clientes num chat público para "organizar os contatos".', category: 'nao-fazer', explanation: 'Expõe dados pessoais de terceiros a um serviço externo sem necessidade. Use dados fictícios ou ferramentas aprovadas (módulos 1.8 e 5.5).' },
      { id: 't4', text: 'Informar o prazo de garantia de uma peça com base no que a IA "lembra".', category: 'verificar', explanation: 'Prazos e regras comerciais mudam e podem ser inventados. Use o termo de garantia oficial.' },
      { id: 't5', text: 'Gerar três opções de texto para um cartaz de promoção, que a equipe vai escolher e editar.', category: 'revisao-leve', explanation: 'Tarefa criativa com revisão humana prevista; o risco é baixo.' },
      { id: 't6', text: 'Enviar a senha do sistema de estoque para a IA "testar se é forte".', category: 'nao-fazer', explanation: 'Nunca envie senhas a uma IA. Credenciais são segredos (módulos 1.8 e 3.3).' },
      { id: 't7', text: 'Citar ao cliente o artigo do Código de Defesa do Consumidor sobre troca, conforme indicado pela IA.', category: 'verificar', explanation: 'Leis e números de artigos são casos clássicos de alucinação. Confira no texto oficial da lei.' },
      { id: 't8', text: 'Resumir para a equipe, internamente, um manual técnico público que foi colado no chat.', category: 'revisao-leve', explanation: 'O conteúdo foi fornecido no contexto e é público. Ainda assim, revise o resumo antes de usar decisões importantes.' },
      { id: 't9', text: 'Dizer ao cliente o preço atual de uma peça no concorrente, segundo a IA.', category: 'verificar', explanation: 'Preços mudam constantemente e o modelo tem data de corte; sem busca confiável, a informação pode estar desatualizada ou inventada.' },
      { id: 't10', text: 'Pedir à IA que aprove sozinha reembolsos acima de R$ 1.000, sem conferência humana.', category: 'nao-fazer', explanation: 'Ações financeiras e irreversíveis exigem confirmação humana (princípio que você verá nos módulos 3.9 e 5.4).' },
    ],
    hints: [
      'Se a resposta depende de um fato específico (prazo, lei, preço, compatibilidade), ele precisa de verificação.',
      'Se o pedido expõe dados pessoais, senhas ou dá poder de decisão financeira à IA, ele não deve ser feito.',
      'Se a IA só melhora um texto que você mesmo forneceu, o risco é baixo.',
    ],
    commonErrors: [
      'Confiar em respostas factuais porque "parecem certas".',
      'Achar que tarefas internas não têm risco de privacidade.',
      'Tratar o resumo de um texto fornecido como se fosse uma informação nova inventada.',
    ],
  },
  {
    kind: 'external', id: 'a1.1-external', moduleId: M, level: 'transferencia', essential: true,
    title: 'Prática do PDF: pergunte a três IAs como foram treinadas',
    objectiveIds: ['1.1-O3', '1.1-O5'], estimatedMinutes: 25,
    instructions: [
      'Esta é a prática indicada no PDF da trilha. Ela acontece fora deste site, nas contas gratuitas que você já tem.',
      'Faça exatamente a mesma pergunta a três IAs diferentes (por exemplo: Claude, ChatGPT e Gemini): "Explique, para um iniciante, como você foi treinado. Cite as fases."',
      'Compare as respostas com o que você estudou: elas mencionam pré-treinamento, ajuste fino e alinhamento com feedback humano?',
      'Escolha uma afirmação concreta de alguma resposta e confira numa das referências do módulo.',
      'Registre abaixo. Não cole dados pessoais nem prints com informações da sua conta.',
    ],
    fields: [
      { id: 'ias', label: 'Quais três IAs você usou?', placeholder: 'Ex.: Claude, ChatGPT, Gemini', minLength: 5 },
      { id: 'pergunta', label: 'Qual pergunta exata você fez?', placeholder: 'Copie a pergunta usada', minLength: 20 },
      { id: 'comum', label: 'O que as três respostas têm em comum?', placeholder: 'Pelo menos dois pontos', minLength: 60 },
      { id: 'diferencas', label: 'Onde elas divergem ou omitem algo?', placeholder: 'Ex.: uma não citou o feedback humano…', minLength: 40 },
      { id: 'verificacao', label: 'Qual afirmação você verificou, em qual fonte, e qual foi o resultado?', placeholder: 'Afirmação → fonte → confirmada ou não', minLength: 60 },
    ],
    hints: [
      'Se uma IA diz que "aprende com cada conversa", compare com a lição 1.1.4: o que realmente acontece durante o uso?',
      'Use o artigo do InstructGPT ou a palestra do Karpathy como fonte de verificação.',
    ],
    commonErrors: ['Fazer perguntas diferentes a cada IA, o que impede a comparação.', 'Aceitar a autodescrição da IA como verdade sem verificar.'],
  },
];

/* ======================================================================
 * NÍVEL 3 — APLICAR
 * ==================================================================== */

export const challenge1_1: Challenge = {
  id: 'c1.1', moduleId: M, estimatedMinutes: 60,
  title: 'Guia de bolso: o que é (e o que não é) um LLM',
  problem: 'Uma pequena empresa vai liberar um assistente de IA para a equipe, mas as pessoas têm ideias erradas: umas acham que a IA "pesquisa tudo na internet" e nunca erra; outras acham que ela "aprende com cada conversa". Você foi convidado a escrever um guia curto que corrija esses equívocos.',
  context: 'O público são colegas sem formação técnica, que vão usar a IA para escrever e-mails, resumir documentos e tirar dúvidas. Eles leem no celular, entre uma tarefa e outra. Este guia também será a primeira entrada do seu projeto "Glossário vivo".',
  expectedResult: 'Um guia de uma página (cerca de 400 a 700 palavras), escrito com suas palavras, que um colega leigo consiga ler em cinco minutos e usar no dia seguinte.',
  functionalRequirements: [
    'Explicar a diferença entre IA, aprendizado de máquina, aprendizado profundo e IA generativa com um exemplo do dia a dia para cada.',
    'Explicar como um LLM gera texto (próximo token) sem usar fórmulas.',
    'Descrever as três fases de treinamento e o que cada uma acrescenta.',
    'Esclarecer que conversar não treina o modelo (treinamento × inferência).',
    'Listar pelo menos três situações em que a resposta da IA deve ser verificada, e como verificar.',
    'Incluir um aviso sobre o que nunca colar numa IA.',
  ],
  constraints: [
    'Escrever com suas palavras. Você pode usar uma IA para revisar o texto, mas não para escrevê-lo — e deve registrar isso nas decisões.',
    'Não usar dados reais de pessoas ou da empresa: use exemplos fictícios.',
    'Cada afirmação técnica deve poder ser conferida em uma referência do módulo.',
    'No máximo uma página; sem jargão sem explicação.',
  ],
  rubric: [
    { id: 'r1', criterion: 'Precisão conceitual', levels: [
      { score: 1, descriptor: 'Contém erros importantes (ex.: diz que o modelo aprende com cada conversa).' },
      { score: 2, descriptor: 'Conceitos majoritariamente corretos, com uma imprecisão relevante.' },
      { score: 3, descriptor: 'Todos os conceitos corretos, com pequenas simplificações aceitáveis.' },
      { score: 4, descriptor: 'Correto e preciso, inclusive nas nuances (modelo × aplicativo, conhecimento × comportamento).' },
    ] },
    { id: 'r2', criterion: 'Clareza para leigos', levels: [
      { score: 1, descriptor: 'Usa jargão sem explicar; difícil de seguir.' },
      { score: 2, descriptor: 'Compreensível, mas longo ou desorganizado.' },
      { score: 3, descriptor: 'Claro, organizado, com termos explicados.' },
      { score: 4, descriptor: 'Claro, curto e com analogias que ajudam de verdade.' },
    ] },
    { id: 'r3', criterion: 'Exemplos e verificação', levels: [
      { score: 1, descriptor: 'Sem exemplos ou sem orientação de verificação.' },
      { score: 2, descriptor: 'Exemplos genéricos; verificação mencionada sem dizer como.' },
      { score: 3, descriptor: 'Exemplos concretos e três situações de verificação com fonte indicada.' },
      { score: 4, descriptor: 'Exemplos testados por você e um caso real de erro que você pegou e corrigiu.' },
    ] },
    { id: 'r4', criterion: 'Uso responsável e privacidade', levels: [
      { score: 1, descriptor: 'Não aborda riscos.' },
      { score: 2, descriptor: 'Menciona riscos de forma vaga.' },
      { score: 3, descriptor: 'Lista o que não colar e por quê.' },
      { score: 4, descriptor: 'Explica riscos, o que não colar, e a diferença entre uso agora e treinamento futuro (configurações de privacidade).' },
    ] },
  ],
  steps: [
    'Releia os resumos das quatro lições e anote as cinco ideias principais.',
    'Liste os equívocos do cenário e escreva, para cada um, a explicação correta.',
    'Escolha uma analogia para o mecanismo de próximo token.',
    'Escreva o rascunho com suas palavras.',
    'Confira cada afirmação técnica numa referência do módulo.',
    'Peça a uma pessoa leiga (ou leia em voz alta) e simplifique o que travar.',
    'Avalie o resultado com a rubrica e registre as decisões e melhorias.',
  ],
  supportMaterials: [
    'Os resumos e diagramas das lições 1.1.1 a 1.1.4.',
    'O registro da sua prática com as três IAs (Nível 2).',
  ],
  supportReferenceIds: ['google-intro-llm', '3b1b-llm-briefly', 'instructgpt-paper'],
  deliveryChecklist: [
    { id: 'd1', text: 'O guia cobre os seis requisitos funcionais.' },
    { id: 'd2', text: 'Escrevi com minhas palavras e registrei como (e se) usei IA para revisar.' },
    { id: 'd3', text: 'Conferi cada afirmação técnica numa referência.' },
    { id: 'd4', text: 'Não incluí dados pessoais ou sigilosos.' },
    { id: 'd5', text: 'Avaliei o guia com a rubrica.' },
    { id: 'd6', text: 'Salvei o guia como primeira entrada do Glossário vivo.' },
  ],
  improvementIdeas: [
    'Transformar o guia num cartaz de uma página com diagrama.',
    'Acrescentar uma seção "perguntas frequentes" com dúvidas reais dos colegas.',
    'Atualizar o guia ao final do Mundo 1 com tokens, contexto e alucinação.',
  ],
};
