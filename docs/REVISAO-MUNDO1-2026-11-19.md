# Revisão das questões do Mundo 1 — 19/11/2026

Origem: planilha `Mundo_1_37_questoes_corrigidas.xlsx`, preenchida por uma pessoa.
O registro das decisões está em `src/content/reviews/mundo1-2026-11-19.json`. A função `src/content/reviews/apply.ts` aplica esse registro ao banco.

## O que entrou na plataforma

| Decisão | Qtde | Efeito |
| --- | --- | --- |
| Aprovar | 60 | Passam a `revisada` e entram no simulado completo |
| Corrigir (reescritas) | 37 | Recebem o texto, as alternativas e o gabarito da planilha, na ordem exata das alternativas. Continuam `pendente-revisao` até a validação final |
| Descartar | 3 | Saem do banco (q1.3-05, q1.9-04, q1.9-07) |

- **Substitutas inéditas** (todas `pendente-revisao`):
  - q1.3-11: cálculo do espaço que sobra na janela;
  - q1.9-11: custo diário de um robô;
  - q1.9-12: por que o treinamento caro não impede um preço baixo por token.
  
  As três ocupam o lugar das descartadas nas verificações das lições.
- **Referências:** as citações escritas no texto das questões 37 e 43 viraram referências verificadas (`lost-in-the-middle` e `openai-why-hallucinate`). As duas foram conferidas por busca na web em 19/11/2026.
- **Simulado completo:** foi liberado com exatamente 60 questões revisadas. Por enquanto, todas são do Mundo 1.
- **Robustez:** um simulado em andamento que contenha uma questão retirada do banco não quebra mais a página. A questão retirada conta como não respondida.

## Conferência das 37 reescritas (feita pelo assistente; não substitui a validação humana)

**Gabaritos:** não encontrei gabarito errado. Em todas as questões há uma alternativa claramente defensável, e as explicações conferem com as alternativas.

**Contas conferidas:**
- q1.2-07: 8 × (500–800) = 4.000–6.400.
- q1.9-03: a tarifa de saída é 4 vezes a de entrada.

**Afirmações atribuídas ao PDF, conferidas no texto original:**
- 500–800 tokens por página em português;
- com 8 GB de RAM, usar modelos de 1–3 bilhões de parâmetros;
- usar dados fictícios ou públicos.

### Pontos para decidir antes de aprovar

1. **Pista de resposta (afeta o banco inteiro):**
   - A alternativa correta é a mais longa em 33 das 37 reescritas e em 53 das 60 aprovadas. Esse problema veio das questões originais.
   - As reescritas reforçaram outra pista: 67 dos 111 distratores usam palavras absolutas ("sempre", "necessariamente", "garante"…), contra 35 de 180 nas aprovadas.
   - Com isso, quem escolhe "a alternativa mais longa e cheia de ressalvas" acerta sem saber o conteúdo.
   - Correção sugerida: igualar o tamanho das alternativas e escrever distratores com ressalvas plausíveis.
2. **q1.9-05 contradiz o PDF.**
   - O PDF diz: "Nunca cadastre cartão de crédito… Sem cartão, não há cobrança surpresa." A versão reescrita trata essa regra como erro na alternativa D.
   - A ressalva é tecnicamente defensável, mas o aluno recebe duas mensagens opostas.
   - Escolher entre: trocar a alternativa D, ou acrescentar a ressalva na lição e no texto do PDF exibido.
3. **q1.1-14:** as alternativas B e C (custo de "uma única resposta" e de "avaliação manual de uma única resposta") continuam caricatas.
4. **q1.1-05:** as alternativas C e D não classificam o LLM do enunciado; são afirmações gerais.
5. **q1.6-10:** está marcada como "Avançada", mas é fácil. A alternativa D (top-p sem checar a API) destoa das outras.
6. **q1.8-09:** atribui ao PDF uma recomendação geral para "planos gratuitos de IA". O PDF fala especificamente do plano gratuito da API do Gemini.
7. **q1.9-10 (já aprovada):** a explicação ficou fraca ("É uma das regras de ouro do PDF.").

## Ajuste das alternativas das 40 pendentes (a pedido do revisor)

O ajuste foi feito pelo assistente e está registrado em `src/content/reviews/mundo1-2026-11-19-ajuste-alternativas.json`, marcado com `kind: "assistente"`. Uma revisão desse tipo **não pode aprovar** questões: o código recusa. As 40 questões continuam `pendente-revisao`.

- **O que mudou:** as alternativas foram reescritas para ter tamanho e tom parecidos, e as palavras absolutas saíram dos distratores. O assunto e a posição do gabarito ficaram iguais.
- **Pistas, antes e depois do ajuste:**
  - correta mais longa: de 33 de 37 (89%) para 10 de 40 (25%, o mesmo que o acaso);
  - distratores com palavras absolutas: de 67 de 111 para 10 de 120.
  
  Os testes em `tests/review.test.ts` impedem que essas pistas voltem.
- **Pontos da conferência resolvidos no mesmo ajuste:**
  - q1.9-05 deixou de contradizer o PDF: "não cadastrar cartão" agora é a resposta certa;
  - q1.1-14 e q1.1-05 ganharam alternativas plausíveis;
  - q1.6-10 passou a "Intermediária";
  - o enunciado da q1.8-09 agora atribui a recomendação ao plano gratuito da API do Gemini, como está no PDF.
- **As 60 aprovadas não foram alteradas.** Elas ainda têm a pista de resposta, que fica para uma próxima rodada.

## Verificação

- `vitest run`: 223 testes aprovados em 6 arquivos. O novo arquivo é `tests/review.test.ts`.
- `npm run build` concluído; `npm audit --omit=dev` não encontrou vulnerabilidades.
