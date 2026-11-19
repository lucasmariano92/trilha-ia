import type { Reference } from '../types/curriculum';

/**
 * Registro de referências externas.
 * Regra: não inventar endereços. Toda referência tem organização, endereço e data da última
 * verificação. Referências herdadas da versão 1 que ainda não foram conferidas ficam como
 * "nao-verificado" até a etapa do mundo correspondente.
 */
const V = '2026-11-18';

export const references: Reference[] = [
  /* ---------- Mundo 1 (verificadas nesta etapa) ---------- */
  {
    id: 'elements-of-ai',
    title: 'Elements of AI',
    organization: 'Universidade de Helsinque e MinnaLearn',
    url: 'https://www.elementsofai.com/',
    language: 'Vários idiomas; há versão em português de Portugal',
    format: 'Curso on-line com certificado',
    free: true,
    lastVerified: V,
    verification: 'busca-web',
    citedInPdf: true,
    note: 'O PDF indica "português disponível". A versão localizada encontrada é a de Portugal (parceria com a Nova SBE).',
  },
  {
    id: 'google-intro-genai',
    title: 'Introduction to Generative AI',
    organization: 'Google Cloud Skills Boost',
    url: 'https://www.cloudskillsboost.google/course_templates/536',
    language: 'Inglês, com outros idiomas disponíveis',
    format: 'Microcurso em vídeo (cerca de 45 min)',
    free: true,
    lastVerified: V,
    verification: 'busca-web',
    citedInPdf: true,
  },
  {
    id: 'google-intro-llm',
    title: 'Introduction to Large Language Models',
    organization: 'Google Cloud Skills Boost',
    url: 'https://www.cloudskillsboost.google/course_templates/539',
    language: 'Inglês; a página lista português (Brasil) entre os idiomas',
    format: 'Microcurso em vídeo',
    free: true,
    lastVerified: V,
    verification: 'busca-web',
    citedInPdf: false,
    note: 'Complementar: faz parte da mesma trilha gratuita do curso citado no PDF.',
  },
  {
    id: 'google-mlcc-intro-llms',
    title: 'Introduction to Large Language Models (Machine Learning Resources)',
    organization: 'Google for Developers',
    url: 'https://developers.google.com/machine-learning/resources/intro-llms',
    language: 'Inglês',
    format: 'Texto',
    free: true,
    lastVerified: V,
    verification: 'busca-web',
    citedInPdf: false,
  },
  {
    id: 'karpathy-intro-llms',
    title: 'Intro to Large Language Models (palestra de 1 hora)',
    organization: 'Andrej Karpathy (YouTube)',
    url: 'https://www.youtube.com/watch?v=zjkBMFhNj_g',
    language: 'Inglês, com legendas automáticas',
    format: 'Vídeo (~1 h)',
    free: true,
    lastVerified: V,
    verification: 'busca-web',
    citedInPdf: true,
  },
  {
    id: 'karpathy-deep-dive',
    title: 'Deep Dive into LLMs like ChatGPT',
    organization: 'Andrej Karpathy (YouTube)',
    url: 'https://www.youtube.com/watch?v=7xTGNNLPyMI',
    language: 'Inglês, com legendas automáticas',
    format: 'Vídeo (~3 h 30 min)',
    free: true,
    lastVerified: V,
    verification: 'busca-web',
    citedInPdf: true,
  },
  {
    id: '3b1b-llm-briefly',
    title: 'Large Language Models explained briefly',
    organization: '3Blue1Brown (Grant Sanderson)',
    url: 'https://www.3blue1brown.com/lessons/mini-llm/',
    language: 'Inglês (vídeo com legendas e versão em texto)',
    format: 'Vídeo curto (~8 min) e texto',
    free: true,
    lastVerified: V,
    verification: 'busca-web',
    citedInPdf: false,
    note: 'Complementar: o PDF cita a série "Neural networks" do mesmo autor; esta lição faz parte dela.',
  },
  {
    id: 'hf-llm-course-ch1',
    title: 'LLM Course — Capítulo 1: Transformer models',
    organization: 'Hugging Face',
    url: 'https://huggingface.co/learn/llm-course/chapter1/1',
    language: 'Inglês (há traduções parciais)',
    format: 'Texto e notebooks',
    free: true,
    lastVerified: V,
    verification: 'busca-web',
    citedInPdf: true,
  },
  {
    id: 'instructgpt-paper',
    title: 'Training language models to follow instructions with human feedback (Ouyang et al., 2022)',
    organization: 'OpenAI — artigo científico no arXiv',
    url: 'https://arxiv.org/abs/2203.02155',
    language: 'Inglês',
    format: 'Artigo científico (fonte primária)',
    free: true,
    lastVerified: V,
    verification: 'busca-web',
    citedInPdf: false,
    note: 'Fonte primária do processo em três etapas: exemplos escritos por pessoas, comparação de respostas e aprendizado por reforço com feedback humano (RLHF).',
  },

  /* ---------- Mundo 1, módulos 1.2 a 1.9 (verificadas na Etapa D) ---------- */
  { id: 'openai-tokenizer', title: 'Tokenizer (ferramenta interativa)', organization: 'OpenAI', url: 'https://platform.openai.com/tokenizer', language: 'Inglês (aceita texto em qualquer idioma)', format: 'Ferramenta web', free: true, lastVerified: V, verification: 'busca-web', citedInPdf: true },
  { id: 'openai-tokens-help', title: 'What are tokens and how to count them?', organization: 'OpenAI (Central de ajuda)', url: 'https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them', language: 'Inglês', format: 'Artigo de ajuda', free: true, lastVerified: V, verification: 'busca-web', citedInPdf: false, note: 'As regras práticas do artigo (≈ 4 caracteres por token) valem para inglês; em português a contagem tende a ser maior.' },
  { id: 'hf-tokenizers', title: 'LLM Course — Capítulo 2: Tokenizers', organization: 'Hugging Face', url: 'https://huggingface.co/learn/llm-course/chapter2/4', language: 'Inglês', format: 'Texto e notebooks', free: true, lastVerified: V, verification: 'busca-web', citedInPdf: true },
  { id: 'petrov-tokenizers', title: 'Language Model Tokenizers Introduce Unfairness Between Languages (Petrov et al., NeurIPS 2023)', organization: 'Universidade de Oxford — artigo científico no arXiv', url: 'https://arxiv.org/abs/2305.15425', language: 'Inglês', format: 'Artigo científico (fonte primária)', free: true, lastVerified: V, verification: 'busca-web', citedInPdf: false, note: 'Mostra que o mesmo texto traduzido pode gerar números de tokens muito diferentes conforme o idioma.' },
  { id: 'lost-in-the-middle', title: 'Lost in the Middle: How Language Models Use Long Contexts (Liu et al., 2023)', organization: 'Stanford University e outros — artigo científico no arXiv', url: 'https://arxiv.org/abs/2307.03172', language: 'Inglês', format: 'Artigo científico (fonte primária)', free: true, lastVerified: V, verification: 'busca-web', citedInPdf: false, note: 'Base da afirmação do PDF de que modelos prestam menos atenção ao meio de textos longos.' },
  { id: 'openai-why-hallucinate', title: 'Why language models hallucinate (2025)', organization: 'OpenAI', url: 'https://openai.com/index/why-language-models-hallucinate/', language: 'Inglês', format: 'Artigo de pesquisa (resumo do paper)', free: true, lastVerified: V, verification: 'busca-web', citedInPdf: false },
  { id: 'embedding-projector', title: 'Embedding Projector', organization: 'Google / TensorFlow', url: 'https://projector.tensorflow.org/', language: 'Inglês', format: 'Ferramenta web', free: true, lastVerified: V, verification: 'busca-web', citedInPdf: true },
  { id: 'google-mlcc-embeddings', title: 'Machine Learning Crash Course — Embeddings', organization: 'Google for Developers', url: 'https://developers.google.com/machine-learning/crash-course/embeddings', language: 'Inglês', format: 'Texto e exercícios', free: true, lastVerified: V, verification: 'busca-web', citedInPdf: false },
  { id: 'vertex-gen-params', title: 'Content generation parameters (temperatura, top-p, top-k, máximo de tokens)', organization: 'Google Cloud', url: 'https://docs.cloud.google.com/vertex-ai/generative-ai/docs/multimodal/content-generation-parameters', language: 'Inglês (há outras línguas)', format: 'Documentação oficial', free: true, lastVerified: V, verification: 'busca-web', citedInPdf: false },
  { id: 'gemini-pricing', title: 'Gemini Developer API — Pricing', organization: 'Google AI for Developers', url: 'https://ai.google.dev/gemini-api/docs/pricing', language: 'Inglês', format: 'Página oficial de preços', free: true, lastVerified: V, verification: 'busca-web', citedInPdf: false, note: 'Preços mudam com frequência (a página mostrava reajustes programados). A página também informa que, no nível gratuito, o conteúdo pode ser usado para melhorar os produtos.' },
  { id: 'ollama-library', title: 'Biblioteca de modelos do Ollama', organization: 'Ollama', url: 'https://ollama.com/library', language: 'Inglês', format: 'Catálogo de modelos', free: true, lastVerified: V, verification: 'busca-web', citedInPdf: true },
  { id: 'anthropic-ai-fluency', title: 'AI Fluency: Framework & Foundations', organization: 'Anthropic Academy', url: 'https://anthropic.skilljar.com/ai-fluency-framework-foundations', language: 'Inglês', format: 'Curso on-line com certificado', free: true, lastVerified: V, verification: 'busca-web', citedInPdf: true },
  { id: 'lgpd-lei', title: 'Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais (texto compilado)', organization: 'Presidência da República (Planalto)', url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm', language: 'Português', format: 'Texto legal oficial', free: true, lastVerified: V, verification: 'busca-web', citedInPdf: false },

  /* ---------- Herdadas da v1: verificar na etapa de cada mundo ---------- */
  { id: 'python-tutorial-ptbr', title: 'Tutorial do Python', organization: 'Python Software Foundation', url: 'https://docs.python.org/pt-br/3/tutorial/', language: 'Português', format: 'Texto', free: true, lastVerified: null, verification: 'nao-verificado', citedInPdf: true },
  { id: 'n8n-docs', title: 'Documentação do n8n', organization: 'n8n', url: 'https://docs.n8n.io/', language: 'Inglês', format: 'Texto e cursos', free: true, lastVerified: null, verification: 'nao-verificado', citedInPdf: true },
  { id: 'fastapi-docs-pt', title: 'Documentação do FastAPI', organization: 'FastAPI', url: 'https://fastapi.tiangolo.com/pt/', language: 'Português', format: 'Tutorial web', free: true, lastVerified: null, verification: 'nao-verificado', citedInPdf: true },
  { id: 'owasp-genai', title: 'OWASP GenAI Security Project (Top 10 for LLM Applications)', organization: 'OWASP', url: 'https://genai.owasp.org/', language: 'Inglês', format: 'Guia', free: true, lastVerified: null, verification: 'nao-verificado', citedInPdf: true },
  { id: 'langgraph-docs', title: 'Documentação do LangGraph', organization: 'LangChain', url: 'https://docs.langchain.com/oss/python/langgraph/overview', language: 'Inglês', format: 'Guia web', free: true, lastVerified: null, verification: 'nao-verificado', citedInPdf: false },
  { id: 'anpd', title: 'Autoridade Nacional de Proteção de Dados (ANPD)', organization: 'Governo Federal do Brasil', url: 'https://www.gov.br/anpd/pt-br', language: 'Português', format: 'Documentos oficiais', free: true, lastVerified: null, verification: 'nao-verificado', citedInPdf: true },
];

const byId = new Map(references.map((r) => [r.id, r]));
export function getReference(id: string): Reference | undefined {
  return byId.get(id);
}
