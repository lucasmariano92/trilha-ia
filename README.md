# Trilha IA — Do Zero à Produção

Plataforma de estudo de Inteligência Artificial em português, organizada pelos 5 mundos e 46 módulos do PDF "Trilha de Aprendizagem em IA — do zero ao código (100% gratuita)". Cada módulo segue três níveis: **Entender**, **Praticar** e **Aplicar**.

> **Estado: 2.0.0-alpha.4 (Etapas A–D concluídas; questões do Mundo 1 revisadas por uma pessoa).** O **Mundo 1 inteiro (módulos 1.1 a 1.9)** está desenvolvido nos três níveis, com o projeto Glossário vivo e o checkpoint com avaliação prática. Os Mundos 2 a 5 (37 módulos) mostram apenas o texto do PDF e estão marcados como pendentes. Na revisão humana de 19/11/2026, 60 questões foram aprovadas (o simulado completo foi liberado, por enquanto só com o Mundo 1), 37 foram reescritas e aguardam validação final e 3 foram descartadas e substituídas. Veja `docs/RELATORIO-ETAPAS-A-C.md`, `docs/RELATORIO-ETAPA-D.md` e `docs/REVISAO-MUNDO1-2026-11-19.md`.

## Como rodar

Requisitos: Node.js 22.12 ou superior e npm.

```bash
npm ci            # instala exatamente as versões do package-lock.json
npm run dev       # servidor de desenvolvimento (http://localhost:5173)
npm test          # 223 testes automatizados
npm run typecheck # TypeScript estrito
npm run build     # gera dist/ para hospedagem estática
npm run preview   # serve o build localmente
npm audit         # auditoria de dependências
```

## Publicação

O build é um site estático com caminhos relativos e rotas por hash (`#/modulo/1.1`). Funciona em qualquer hospedagem estática, inclusive numa subpasta do GitHub Pages, sem configuração extra.

- **GitHub Pages:** publique a pasta `dist/`. A política de segurança de conteúdo (CSP) vai numa meta tag injetada no build.
- **Netlify / Cloudflare Pages:** o arquivo `public/_headers` acrescenta CSP, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` e HSTS.
- Use sempre HTTPS. Não há segredos: o aplicativo não chama nenhuma API.

## Arquitetura

```
src/
  types/        curriculum.ts (dados públicos) · progress.ts (dados pessoais)
  content/      currículo: pdf-modules.json (texto do PDF), worlds.ts, glossary.ts,
                references.ts, modules/m1-1.ts … m1-9.ts, legacy-questions.json
  services/     lógica pura e testada: mastery, srs, exam, plan, progress, aiMath,
                livingGlossary, recommendations, activeTime, schema, storage, backup, actions, validate
  store/        estado global com salvamento automático
  hooks/        useActiveTime
  components/   ui, Diagrams, QuestionCard, ChallengeView, Notes, activities/*
  pages/        uma página por área
tests/          content, logic, exam-storage, ui (inclui axe-core)
docs/           auditoria, relatório, resultados das verificações
legacy/         currículo da v1 (só para rastreabilidade)
```

Princípios:
- O **currículo** (código) fica separado dos **dados do aluno** (`localStorage`, chave `trilha-ia:v2:dados`, esquema versionado).
- Os serviços são funções puras: recebem dados e devolvem uma nova versão, o que facilita testar e, no futuro, trocar o armazenamento por uma API com autenticação (`KeyValueStore`).
- Os dados da v1 (`trilha-ia-v1`) são migrados automaticamente na primeira abertura.

## Regras de avaliação

- **Nível 1:** pelo menos 80% na verificação de cada lição. Modo assistido (texto visível) ou independente (texto oculto).
- **Nível 2:** atividades essenciais com correção automática acima do mínimo, mais a prática externa do PDF (autodeclarada).
- **Nível 3:** desafio com rubrica e checklist, registrado como "autodeclarado — pendente de avaliação".
- **Domínio demonstrado:** os três níveis e, para cada objetivo, pelo menos 3 respostas independentes com 80% ou mais nas últimas 5. Abaixo disso, o objetivo aparece como "dados insuficientes".
- **Revisão necessária:** objetivo abaixo de 60% (com dados suficientes) ou 3 ou mais flashcards atrasados há mais de 7 dias.
- **Checkpoint:** itens do PDF (autoavaliação), módulos com teoria concluída, projeto entregue e avaliação prática de 10 questões sem consulta (mínimo de 80%).
- **Simulado completo:** 60 questões distintas, só revisadas, em 1h50. Enquanto o banco não tiver 60 revisadas, a plataforma bloqueia e informa quantas faltam.
- **Revisão espaçada:** variante do SM-2 com quatro botões (detalhes em `src/services/srs.ts`).

## Privacidade e segurança

- Sem conta, servidor, cookies de rastreamento, análise de uso ou recursos de terceiros (as fontes são do sistema).
- Os dados ficam só no navegador, sem criptografia, e podem ser perdidos se o navegador apagar os dados do site. Exporte backups.
- A importação de backup valida formato, versão, tipos, tamanho (até 5 MB) e chaves perigosas. Há prévia e opção de desfazer.
- Os campos de texto avisam quando o conteúdo parece ter chave de API, senha, CPF ou cartão.
- Não há `eval`, `new Function` nem HTML injetado. O laboratório **não executa código**.
- Exclusão de dados por categoria ou total na página Privacidade.

Riscos residuais e limitações: `docs/RELATORIO-ETAPAS-A-C.md`, seções 4 e 5.

## Conteúdo

- **Fundamentado no PDF:** textos dos módulos, projetos, checkpoints e glossário rápido.
- **Complementar com referência:** teoria ampliada dos módulos 1.1 a 1.9, com fontes verificadas na data indicada.
- As questões são autorais e não oficiais. As 100 do Mundo 1 aguardam revisão humana; as 37 herdadas da v1 (Mundos 2 a 5) são provisórias.
- Os simulados são didáticos e não equivalem a exame de certificação.
