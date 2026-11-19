# Relatório de implementação — Etapas A, B e C

Versão: 2.0.0-alpha.1 · Data: 18/11/2026

Resumo: a auditoria (A) está em `docs/AUDITORIA.md`. A estrutura pedagógica e o modelo de dados (B) estão implementados e testados. O módulo 1.1 (C) está desenvolvido nos três níveis. Os outros 45 módulos mostram apenas o texto do PDF e estão claramente marcados como pendentes.

## 1. Funcionalidades implementadas

### Estrutura pedagógica (Etapa B)

- **Três níveis com critérios objetivos.** O progresso não depende mais de botões.
  - Nível 1: verificação de compreensão por lição, com aprovação a partir de 80%. Há modo **assistido** (texto visível) e **independente** (texto oculto). Os dois concluem a teoria; só o independente conta como evidência de domínio.
  - Nível 2: atividades com correção automática que só contam ao atingir o mínimo. A prática externa do PDF fica registrada como **autodeclarada**.
  - Nível 3: desafio com rubrica, checklist e requisitos mínimos de texto. O resultado fica "autodeclarado — pendente de avaliação".
- **Sete estados do módulo**: Não iniciado → Em estudo → Teoria concluída → Prática concluída → Aplicação entregue → Domínio demonstrado; e Revisão necessária.
- **Domínio por objetivo**, não pela porcentagem geral. Cada objetivo precisa de pelo menos 3 respostas independentes, avaliadas pelas últimas 5. Com menos que isso, aparece "dados insuficientes". A situação vira "dificuldade" abaixo de 60% e "dominado" a partir de 80%. Também são registrados os erros cometidos com confiança alta.
- **Revisão necessária**: dificuldade comprovada em algum objetivo, ou 3 ou mais flashcards atrasados há mais de 7 dias.
- **Recomendações de reforço** só com evidência: objetivo em dificuldade, possível concepção equivocada ou o mesmo item errado em 2 ou mais tentativas.
- **Pré-requisitos e checkpoints.** Um mundo só é liberado com o checkpoint anterior cumprido: itens autoavaliados, módulos prontos e projeto entregue. Antes disso, os módulos aparecem em modo prévia.
- **Plano adaptativo.** São 5 tipos de dia (padrão 25/20/10/5 min; introdução; programação; revisão; projeto), e a soma sempre fecha a duração da sessão. A previsão considera a carga restante, os projetos e 10% de revisões.
- **Tempo ativo.** Só conta com a aba visível e alguma interação nos últimos 90 s. O tempo estimado aparece separado do registrado.
- **Flashcards.** Variante documentada do SM-2 com Errei/Difícil/Bom/Fácil, até 10 cartões novos por dia, atalhos de teclado e distinção entre cartão "consolidado" e domínio.
- **Simulados.** Mecanismo completo: 60 questões distintas, 1h50, navegação, marcação para revisão, finalização antecipada ou automática, correção comentada, resultado por assunto e recomendações. O andamento persiste e o tempo é recalculado pelo horário de início. O simulado completo usa **só questões revisadas** e hoje mostra "faltam 60". Há um simulado de treino de 20 questões, identificado como sem valor certificador.
- **Persistência e backup.** Dados curriculares (código) separados dos dados pessoais (`localStorage`), com esquema versionado (v2). O backup tem envelope com versão e aviso de que não é criptografado; a importação valida estrutura, tipos, tamanho (5 MB) e chaves perigosas, mostra uma prévia comparativa e permite **desfazer**. A migração da v1 é automática.
- **Privacidade.** Página explicando o que é guardado, onde e por quê, com retenção e exclusão por categoria ou total. Campos de texto alertam quando o conteúdo parece ter chave de API, senha, CPF ou cartão.
- **Interface.** 15 áreas (Painel, Trilha, Mundos, Módulos, Leitor de aulas, Laboratório, Flashcards, Questões, Simulados, Projetos, Histórico, Dúvidas, Glossário e referências, Configurações, Backup) e mais a página de Privacidade. Rotas por hash, temas claro/escuro/sistema e layout responsivo.

### Conteúdo (Etapa C — módulo 1.1)

| Item | Quantidade |
|---|---|
| Objetivos mensuráveis | 5 |
| Lições de 20–25 min | 4 (IA × ML × DL × generativa; próximo token; fases de treinamento; treinamento × inferência) |
| Elementos por lição | objetivo, pré-requisitos, termos com tradução, analogias, exemplos corretos e incorretos, erros de interpretação, diagrama, resumo, glossário, fontes e verificação de 5 questões |
| Diagramas SVG acessíveis | 4 |
| Questões com explicação de todas as alternativas | 20 (gabarito equilibrado; todas "pendentes de revisão") |
| Flashcards | 12 do módulo + 22 do glossário do PDF |
| Atividades do Nível 2 | demonstração interativa (simulador de próximo token), classificação introdutória, ordenação, verdadeiro ou falso, transferência num cenário empresarial e prática externa do PDF |
| Desafio do Nível 3 | "Guia de bolso: o que é (e o que não é) um LLM", com os 13 elementos pedidos e rubrica de 4 critérios × 4 níveis |
| Referências verificadas | 9, com organização, endereço e data |

O conteúdo do PDF está marcado como "Fundamentado no PDF"; as explicações adicionais, como "Complementar com referência".

## 2. Testes executados e resultados

Saída completa em `docs/resultados-verificacao.txt`.

| Verificação | Resultado |
|---|---|
| `tsc -b` (TypeScript estrito) | sem erros |
| `vitest run` | **110 testes aprovados** em 4 arquivos |
| `vite build` | concluído; JS 529 KB (160 KB gzip) |
| `npm audit` | **0 vulnerabilidades** (eram 6) |
| Teste de mutação manual | dois defeitos introduzidos de propósito (respostas assistidas contando como independentes; questões não revisadas no simulado) fizeram 4 testes falharem; o código foi restaurado |
| Acessibilidade (axe-core no Chrome, WCAG 2 A/AA, com contraste) | 16 páginas × temas claro e escuro: **0 violações** |
| Responsividade (Chrome) | 28 rotas × larguras 320, 375, 768 e 1280 px: sem rolagem horizontal e sem erros de JavaScript |
| Persistência real (Chrome) | simulado de treino iniciado e página recarregada: tempo continuou (36:39 → 36:36) e a resposta foi mantida |
| CSP | a meta tag do build bloqueou injeção de script inline durante os testes (comportamento esperado) |

Cobertura dos testes pedidos no prompt: progresso, critérios de domínio, revisão espaçada, seleção de questões, correção de simulados, cronômetro, persistência, importação e exportação (inclusive arquivos malformados, versão futura, mais de 5 MB e poluição de protótipo), recomendações, pré-requisitos, checkpoints, tempo ativo, integridade do conteúdo, segurança estática (sem `eval`/`new Function`/`dangerouslySetInnerHTML`/chamadas de rede; links externos com `noopener noreferrer`), fluxos de interface e acessibilidade.

## 3. Problemas encontrados durante a etapa (e corrigidos)

1. Gabarito das novas questões concentrado em "B" (15 de 20). Criei um reposicionador equilibrado e um teste que limita cada posição a 40%.
2. Atalho de teclado dos flashcards quebrava quando o evento vinha da janela; foi encontrado pelos testes de interface.
3. Efeito do simulador de tokens devolvia `false` como função de limpeza, o que derrubava a página de prática; também encontrado pelos testes.
4. Salto de nível de título (h1 → h3) na página de prática e bloco de código não focável, apontados pelo axe.
5. Rolagem horizontal na página de projetos em 375 px.
6. Numa das execuções dos testes no Chrome, uma captura de tela saiu em branco e o botão de menu não foi encontrado. Nas execuções seguintes, com o mesmo roteiro, tudo funcionou e não houve erro de JavaScript; a causa não foi identificada.

## 4. Limitações conhecidas

- **45 de 46 módulos** têm só o texto do PDF e um objetivo provisório. Neles, o estudo só pode ser autodeclarado e não entra no progresso verificado.
- **Nenhuma questão está revisada por uma pessoa**: o simulado completo fica bloqueado por desenho. As 45 questões herdadas da v1 continuam provisórias, com alternativas fracas.
- As referências foram confirmadas **por resultados de busca**, não pela abertura da página (o ambiente bloqueia o acesso direto). Seis referências herdadas da v1 estão marcadas como "não verificado".
- O **laboratório Python não executa código.** A opção planejada (WebAssembly num Web Worker, no navegador) ainda não foi avaliada nem testada.
- Prática externa, desafio, projetos e checkpoints são **autodeclarados**; não há avaliador automático.
- **Sem backend, contas ou sincronização.** Os dados ficam no `localStorage`, sem criptografia, e se perdem se o navegador limpar os dados do site.
- O tempo ativo é uma estimativa por interação; ele não sabe se o aluno está de fato lendo.
- O pacote JS tem 529 KB (o build avisa acima de 500 KB). A divisão de código por página fica para a etapa de qualidade.
- O alerta de dados sensíveis usa padrões simples e não detecta todos os casos.
- No GitHub Pages não é possível definir cabeçalhos HTTP: a CSP vem por meta tag, que não suporta `frame-ancestors`. O arquivo `public/_headers` cobre Netlify e Cloudflare Pages.

## 5. Riscos residuais de segurança

| Risco | Situação |
|---|---|
| Acesso local aos dados | Quem usa o mesmo perfil de navegador vê tudo. Está documentado; não há mitigação técnica sem conta e criptografia. |
| Backup exportado vazado | O arquivo é texto legível. Há aviso na exportação e no próprio arquivo. |
| Dependências futuras | Versões estão fixadas e há lock; é preciso rodar `npm audit` a cada atualização. |
| Conteúdo de links externos | Fora do controle da plataforma. Links abrem com `noopener noreferrer`. |
| Seções 18.2 a 18.4 e 18.9 do prompt (autenticação, API, isolamento de Python no servidor, monitoramento) | Não se aplicam: não há backend. Devem ser implementadas e testadas antes de qualquer servidor existir. |

A plataforma **não deve ser declarada segura**: os controles acima cobrem a arquitetura atual (estática e local) e foram testados como descrito.

## 6. Próximas etapas

1. **Etapa D — Mundo 1:** aprofundar os módulos 1.2 a 1.9 no padrão do 1.1, mais o projeto Glossário vivo e o checkpoint. Para cada módulo: objetivos, lições, 15 a 20 questões, flashcards, atividades e desafio; e verificar as referências.
2. **Revisão humana das questões**: alguém revisa e marca `review: 'revisada'`. O simulado completo é liberado automaticamente ao chegar a 60.
3. **Etapa E — Mundos 2 a 5**, um por vez. No Mundo 4, avaliar a execução de Python com Pyodide num Web Worker e só habilitar depois de testes de isolamento.
4. **Etapa F — qualidade:** divisão de código por página, testes ponta a ponta automatizados (Playwright) no CI e substituição das 45 questões herdadas.
5. **Etapa G — publicação:** GitHub Actions (testes, auditoria e build) e deploy no GitHub Pages.

Critério para considerar cada módulo pronto: a "Definição de pronto" da seção 17 do prompt, verificada pelos testes de `tests/content.test.ts` (hoje aplicados ao 1.1).
