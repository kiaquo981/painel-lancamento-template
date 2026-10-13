# Painel de lançamento · instruções para o agente

Este repositório é um modelo. Cada clone vira o painel de **um** lançamento: mídia da Meta cruzada com inscritos e vendas, contra as metas, com workers de coleta e senha única. Tudo que muda entre lançamentos vive em `lancamento.config.json`.

Siga os passos em ordem. Cada um tem um critério de pronto; só avance quando ele estiver cumprido.

## 1. Briefing (sempre o primeiro passo)

Conduza a entrevista de `docs/BRIEFING.md`, uma pergunta por vez, e preencha `lancamento.config.json` com as respostas. O que a pessoa não souber fica registrado como pendência, com o valor mais conservador.

**Pronto quando:** nenhum valor de exemplo resta no arquivo (`slug` e `banco.schema` diferentes de `exemplo`), e a pessoa confirmou o resumo do briefing que você mostrou.

## 2. Acessos

Os acessos são passos que só a pessoa faz (abrir painéis, copiar chaves, compartilhar a planilha). Peça para ela rodar `npm run acessos` no terminal dela: o assistente abre cada página, diz o que copiar, grava em `.env.local` e testa cada conexão. Você não roda o assistente: ele lê senha escondida e abre navegador.

O que cada acesso é e como diagnosticar uma falha: `docs/ACESSOS.md`.

**Pronto quando:** `npm run testar-acessos` termina com código 0.

## 3. Adaptar ao projeto

O painel já funciona só com a configuração. Escreva código apenas para o que o briefing pediu além disso:

- **Plataforma de vendas:** adaptador em `src/lib/coleta/venda.ts`, conferido com um aviso de venda real da plataforma.
- **Grupo e presença no evento:** se houver fonte, crie tabela, worker e tela seguindo `src/lib/coleta/` e as regras abaixo.

**Pronto quando:** `npm run typecheck`, `npm test` e `npm run build` passam.

## 4. Publicar

A pessoa roda `bash scripts/publicar.sh` (ou aceita o último passo do assistente de acessos). O script grava as variáveis na Vercel e publica. Publicar é decisão dela: confirme antes.

**Pronto quando:** o endereço publicado redireciona para `/login` sem a senha e abre o painel com ela.

## 5. Conferência

Percorra `docs/CONFERENCIA.md` inteiro contra o painel publicado, com dado real.

**Pronto quando:** todo item está marcado como conferido ou como pendência nomeada, e você entregou à pessoa o endereço, o que está funcionando e o que está "sem fonte".

## Regras do painel

- **Dado ausente aparece como "—" com o motivo.** Etapa sem fonte fica marcada "sem fonte"; nenhuma taxa é presumida e nenhum zero é inventado.
- **Todo custo e toda taxa mostram a conta por extenso** no cartão (`formula`). Definições em `CONTEXT.md`: use os mesmos nomes na tela e no código.
- **A fase em andamento vem das datas** do briefing.
- **Projeção fica separada do realizado.**
- **Dado pessoal não entra no banco do painel.** E-mail e telefone são embaralhados na entrada (`embaralhar`, em `src/lib/coleta/comum.ts`); as telas leem só UTM e data.
- **Chaves ficam em `.env.local` e nas variáveis da Vercel.** O navegador recebe só o que as telas mostram.
- **Texto da tela em português claro**, sem sigla: "custo por inscrito", "conversão da página".

## Onde está o quê

| Assunto | Arquivo |
|---|---|
| Perguntas do briefing e como cada resposta vira configuração | `docs/BRIEFING.md` |
| Cada acesso, formato dos webhooks, agendamento, erros comuns | `docs/ACESSOS.md` |
| Roteiro de conferência ponta a ponta | `docs/CONFERENCIA.md` |
| Glossário e fórmulas | `CONTEXT.md` |
| Tabelas do banco | `supabase/schema.sql` |
