# Relatório de implementação — Etapa D (Mundo 1 completo)

Versão: 2.0.0-alpha.2 · Data: 18/11/2026

Resumo: os módulos 1.2 a 1.9 foram desenvolvidos no padrão do piloto 1.1, com teoria, prática e aplicação. O projeto Glossário vivo ganhou um editor com verificação automática, e o checkpoint do Mundo 1 passou a incluir uma avaliação prática corrigida automaticamente. Com isso, os 9 módulos do Mundo 1 estão estruturados; os Mundos 2 a 5 continuam só com o texto do PDF.

## 1. Conteúdo desenvolvido

| Item | Mundo 1 |
|---|---|
| Módulos estruturados | 9 de 9 |
| Objetivos de aprendizagem | 29 (todos mensuráveis; nenhum provisório) |
| Lições de 20–25 min | 20 (4 no 1.1 e 2 em cada um dos demais) |
| Questões com explicação de todas as alternativas | 100 (10 a 20 por módulo; gabarito equilibrado; todas pendentes de revisão humana) |
| Flashcards | 66 (60 dos módulos + 6 do glossário do PDF) |
| Atividades do Nível 2 | 36: 22 com correção automática, 5 demonstrações interativas e 9 práticas externas (todas as práticas do PDF preservadas, mais duas complementares identificadas) |
| Desafios do Nível 3 | 9, todos com rubrica de 4 níveis e checklist |
| Termos de glossário | 59 (22 do PDF + 37 complementares) |
| Referências | 22 verificadas na data (13 novas nesta etapa) e 6 herdadas ainda não verificadas |
| Carga estimada dos módulos | ≈ 21 h 44 min, mais 4 h do projeto (o PDF prevê ≈ 21 h para o mundo; a diferença vem da prática e dos desafios acrescentados) |

Temas por módulo: 1.2 tokens (tokenização por subpalavras, português × inglês, estimativa de 500–800 tokens por página); 1.3 janela de contexto (corte, resumo, "perdido no meio", estratégias); 1.4 alucinação (causas, tipos de risco, quatro técnicas do PDF, procedimento de verificação); 1.5 embeddings (vetores, similaridade de cosseno, busca semântica × palavra-chave); 1.6 temperatura, top-p, top-k, limite de tokens e sequências de parada; 1.7 tipos de modelo (texto, multimodal, raciocínio, local, pesos abertos); 1.8 data de corte, vieses, dependência, o que nunca colar, LGPD (art. 5º) e direitos autorais; 1.9 preço por milhão de tokens, cálculo de custo e quando um modelo pequeno basta.

Os 37 itens das questões herdadas da v1 para os módulos 2.1 a 5.7 continuam provisórios. As herdadas de 1.2 a 1.9 foram substituídas.

## 2. Funcionalidades novas

- **Exercício numérico**: aceita vírgula ou ponto decimal, tem tolerância por item e explicação. É usado para estimar tokens, calcular similaridade de cosseno e calcular custos.
- **Quatro demonstrações interativas**, além do simulador de próximo token:
  - temperatura, com barras e sorteio;
  - mapa de embeddings em 2D, com similaridade;
  - janela de contexto que "esquece" uma informação crítica;
  - calculadora de custo.

  Todas usam valores fictícios e dizem isso na tela. Os cálculos ficam em `src/services/aiMath.ts`, com testes.
- **Dois diagramas novos**: espaço de embeddings e efeito da temperatura (calculado com a mesma função da demonstração).
- **Editor do Glossário vivo**: nove conceitos, cada um com explicação e exemplo testado, e um diário de alucinações (ferramenta, afirmação, como descobriu, informação correta e fonte). Os três primeiros itens do checklist do projeto agora são **verificados automaticamente** pelo tamanho mínimo dos textos, e não mais autodeclarados. O glossário pode ser exportado em Markdown.
- **Avaliação prática do checkpoint**: 10 questões distintas sorteadas dos módulos estruturados do mundo, sem consulta, com mínimo de 80%. Ela complementa os itens do PDF (autoavaliação) e o projeto. Só tentativas independentes contam.
- **Critério do checkpoint atualizado**: módulos estruturados exigem teoria concluída; o estudo autodeclarado só vale para módulos ainda sem conteúdo.
- **Esquema de dados**: novo campo `livingGlossary`, validado na importação. Dados e backups anteriores sem o campo continuam válidos (testado).

## 3. Testes executados e resultados

Saída completa em `docs/resultados-verificacao.txt`.

| Verificação | Resultado |
|---|---|
| `tsc -b` | sem erros |
| `vitest run` | **207 testes aprovados** em 5 arquivos (eram 110) |
| `vite build` | concluído; JS 750 KB (223 KB gzip) |
| `npm audit` | 0 vulnerabilidades |
| Acessibilidade no Chrome (axe, WCAG 2 A/AA, com contraste), 24 páginas × 2 temas | 0 violações, depois de uma correção |
| Responsividade no Chrome: 39 rotas × 320, 375, 768 e 1280 px | sem rolagem horizontal e sem erros de JavaScript |

Testes novos desta etapa:
- **Definição de pronto aplicada aos 9 módulos**: objetivos, lições de 15–30 min, termos, exemplos, erros comuns, resumo, referências, 5 questões por verificação, cobertura de cada objetivo por pelo menos 3 questões e 1 flashcard, desafio completo, gabarito equilibrado por módulo e prática do PDF preservada.
- **Conferência das respostas cadastradas** nos exercícios numéricos, recalculadas a partir das fórmulas.
- **Temperatura**: normalização, T = 0 escolhe o mais provável e mais temperatura dá mais entropia.
- **Similaridade de cosseno e janela de contexto**, incluindo a regra de cortar primeiro o mais antigo sem pular mensagens.
- **Custo e conversão de números** no formato brasileiro.
- **Glossário vivo**: verificação automática, casos incompletos que não contam, exportação, validação no backup e exclusão.
- **Checkpoint**: os quatro requisitos, avaliação abaixo do mínimo e avaliação assistida que não conta.
- **Interface**: exercício numérico com vírgula, avaliação do checkpoint e editor do glossário.

## 4. Problemas encontrados e corrigidos

1. Os testes de definição de pronto apontaram **três objetivos com só duas questões** (1.2-O2, 1.4-O2 e 1.9-O2) e **uma lição sem exemplos** (1.6.1). Os objetivos foram associados a questões existentes que de fato os avaliam, e a lição recebeu exemplos correto e incorreto.
2. Questões sem referência própria agora **herdam as referências da lição** em cuja verificação aparecem; o teste exige referência em todas.
3. **Contraste insuficiente** (4,34:1 no claro e 3,75:1 no escuro) nas mensagens cortadas da demonstração de janela de contexto. Corrigido e reverificado.
4. Uma dica da calculadora de custo dizia "metade do custo" quando o correto, com os valores padrão, é "mais da metade" (57%). Corrigida.

## 5. Limitações conhecidas

- **Nenhuma questão foi revisada por uma pessoa.** O banco tem 100 questões do Mundo 1 pendentes de revisão; ao revisar 60, o simulado completo é liberado automaticamente.
- O conteúdo complementar foi escrito com base nas referências listadas, **confirmadas por busca na web** (o ambiente não abre as páginas diretamente). Recomenda-se uma revisão humana do texto.
- A **verificação automática do Glossário vivo mede o tamanho** dos textos, não a qualidade. O resultado do projeto continua autodeclarado.
- Os **mínimos de 2 lições por módulo** (de 1.2 a 1.9) seguem a estimativa de 15–30 min por lição; temas como embeddings e custos podem merecer lições adicionais após uso real.
- O pacote JS cresceu para 750 KB, por causa do conteúdo embutido. A divisão do conteúdo por mundo, com carregamento sob demanda, fica para a Etapa F.
- As demais limitações do relatório anterior continuam válidas: sem backend, laboratório sem execução de Python e dados apenas no navegador.

## 6. Próximas etapas

1. **Revisão humana** das 100 questões e do texto do Mundo 1. Basta mudar `review` para `'revisada'` nas questões aprovadas.
2. **Etapa E — Mundo 2** (8 módulos, projeto Batalha de IAs e checkpoint), no mesmo padrão. É provável que exija novos tipos de atividade, como comparação de prompts com rubrica.
3. **Etapa F**: divisão do pacote por mundo, testes ponta a ponta automatizados e substituição das 37 questões herdadas restantes.
