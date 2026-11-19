# Etapa A — Auditoria do projeto existente (v1, "ia-academy")

Data: 18/11/2026. Objeto: `trilha-ia-plataforma-v2.zip` (pasta `ia-academy`, 17 arquivos) e o PDF "Trilha de Aprendizagem em IA — do zero ao código (100% gratuita)", 19 páginas, de 31/10/2026.

Método: leitura integral do código e do conteúdo; instalação das dependências; execução de `npm test`, `npm run build` e `npm audit` numa cópia isolada; comparação do conteúdo com o PDF.

## 1. O que funcionava

| Item | Evidência |
|---|---|
| Build de produção | `npm run build` concluiu sem erros (o README da v1 dizia que o build nunca tinha sido executado). |
| Testes | 7 testes passavam (percentual, cronômetro 1h50, SM-2, previsão, seleção de 60 itens, validação mínima de backup). |
| Estrutura curricular | 5 mundos e 46 módulos com os títulos e o texto do PDF. |
| Honestidade do laboratório | O editor não executava Python e dizia isso, sem simular resultados. Não havia `eval`. |
| Sem segredos no código | Nenhuma chave, token ou `.env` no pacote. |
| Rótulos de transparência | Questões e variantes já eram marcadas como provisórias. |

## 2. Inventário priorizado de problemas

Prioridade: **P0** compromete a confiabilidade ou a segurança; **P1** impede o objetivo pedagógico; **P2** qualidade e manutenção.

### Técnicos

| P | Problema | Detalhe |
|---|---|---|
| P0 | Dependências vulneráveis | `npm audit`: 6 vulnerabilidades (2 críticas em `tinypool`/`vitest` 2.x, 1 alta em `vite` ≤ 6.4.3, 3 moderadas). São ferramentas de desenvolvimento, mas expõem quem roda `npm run dev`. Faixas `^` sem arquivo de lock no pacote; ferramentas de build listadas como dependências de produção. |
| P0 | Datas em UTC | `toISOString().slice(0,10)` como "hoje": no Brasil, depois das 21h a data vira o dia seguinte, o que quebra revisões, sequência e históricos. |
| P0 | Progresso sem evidência | "Marcar como concluída" era um botão que alternava o estado. Os níveis Entender/Praticar/Aplicar também eram botões. Isso contraria o prompt: "não considerar concluído porque clicou". |
| P1 | Simulado em `sessionStorage` | O andamento se perdia ao fechar a aba. O simulado de 60 era completado com variantes provisórias. |
| P1 | Métrica de tempo inexistente | O painel mostrava "Horas registradas", mas `studyMinutes` nunca era incrementado: sempre 0 h. |
| P1 | Flashcards fictícios | Um cartão por aula ("Explique: título"), com o verso igual aos primeiros 450 caracteres do texto. Os 46 cartões já nasciam vencidos. |
| P1 | Backup frágil | Validação mínima, sem limite de tamanho, sem versão de esquema, sem proteção contra chaves `__proto__`, sem prévia do que seria restaurado e sem como desfazer. Usava `confirm()`. |
| P2 | Monólito ilegível | `App.tsx` com 27 linhas minificadas (38 KB), 21 `useState` e todas as telas num componente. Sem rotas, serviços, hooks ou tipos do domínio. Referências escolhidas por índice de array. |
| P2 | Modo escuro improvisado | Sobrescrevia classes do Tailwind no CSS (`.dark .text-slate-500`…); vários componentes ficavam sem contraste adequado. |
| P2 | Fontes externas | Carregava Google Fonts: o IP do aluno ia para um terceiro sem aviso, e isso impede uma CSP restritiva. |
| P2 | Acessibilidade | Sem link "pular para o conteúdo", sem `aria-current`, alternativas sem agrupamento semântico, barras de progresso sem `role`, ícones lidos por leitores de tela, diálogos nativos `confirm()`. |

### Pedagógicos

| P | Problema | Detalhe |
|---|---|---|
| P0 | Banco inflado artificialmente | 134 questões = 46 originais + 88 "variantes" que só acrescentavam "Em uma situação prática," ao enunciado, com as mesmas alternativas. O prompt proíbe isso. |
| P0 | Alternativas absurdas e gabarito enviesado | Ex.: "Docker facilita: Aumentar memória física"; "Uma métrica: Cor do botão". Nas 46 originais, a resposta certa era A em 31, B em 14, C em 1 e D em nenhuma. Não havia explicação por alternativa nem vínculo com objetivos. |
| P1 | Conteúdo raso | 46/46 objetivos seguiam o mesmo molde ("Compreender X e aplicar o conceito…") e 37/46 práticas também ("Explique X com suas próprias palavras…"). A teoria era o próprio parágrafo do PDF. |
| P1 | Piloto 1.1 incompleto | Cinco parágrafos e três questões. Sem divisão em lições, objetivo mensurável, glossário, referências específicas, exercícios corrigidos ou desafio estruturado. |
| P1 | Checkpoints e pré-requisitos ausentes | Os itens de checkpoint do PDF não apareciam; não havia liberação de mundos. |
| P1 | Projetos genéricos | Três passos por projeto; faltavam checklist, critérios, entregáveis, versões e reflexão. |

### Segurança e privacidade

| P | Problema |
|---|---|
| P0 | Dependências vulneráveis (ver acima). |
| P1 | Sem política de segurança de conteúdo (CSP) e com recurso de terceiro (fontes). |
| P1 | Importação de backup sem validação adequada. |
| P1 | Campos de texto livres sem alerta sobre dados sensíveis; só um aviso genérico. |
| P2 | Sem exclusão por categoria, sem política de retenção e sem página de privacidade. |

## 3. Decisão de arquitetura

O `App.tsx` minificado não era revisável nem testável. A decisão foi **reorganizar o código e preservar a interface, as funcionalidades e as regras que já funcionavam**: identidade visual, mundos, simulado de 1h50, SM-2, backup e honestidade do laboratório. Os dados da v1 guardados no navegador são migrados automaticamente (ver relatório).
