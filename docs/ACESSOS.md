# Acessos

`npm run acessos` conduz a pessoa por todos eles e grava em `.env.local`. `npm run testar-acessos` testa cada conexão com uma leitura real.

| Variável | O que é | Quem usa |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Projeto do Supabase que hospeda os painéis (um schema por cliente) | telas e workers |
| `META_ACCESS_TOKEN` | Token de usuário do sistema com `ads_read` na conta do briefing | worker de mídia |
| `META_API_VERSION` | Opcional. Versão da API de Marketing (padrão `v22.0`) | worker de mídia |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Chave JSON da conta de serviço, em base64 (trilha `sheets`) | worker de inscritos |
| `LEADS_SUPABASE_URL`, `LEADS_SUPABASE_KEY` | Supabase da página de captura (trilha `supabase`) | worker de inscritos |
| `INGEST_SECRET` | Segredo dos webhooks de inscrição e de venda | webhooks |
| `CRON_SECRET` | Segredo dos workers. A Vercel envia sozinha no cron | workers |
| `PAINEL_SENHA`, `PAINEL_SEGREDO` | Senha única e o segredo que assina o cookie e embaralha e-mail e telefone | login e ingestão |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Opcional. Relatório de hora em hora | worker de relatório |

## Banco

`npm run schema` gera `supabase/schema.<schema>.sql`. A pessoa cola no SQL Editor e depois adiciona o schema em Project Settings → Data API → Exposed schemas.

## Workers e agendamento

| Rota | Faz | Frequência |
|---|---|---|
| `GET /api/cron/meta` | Meta → `midia_dia` e `midia_hora` (reprocessa 3 dias) | 15 min |
| `GET /api/cron/inscritos` | Planilha ou Supabase da página → `inscritos` | 5 min |
| `GET /api/cron/relatorio` | Resumo do dia no Telegram | 1 h |

Todas pedem `Authorization: Bearer <CRON_SECRET>`. O `vercel.json` agenda as três; frequências abaixo de um dia exigem o plano Pro da Vercel. No plano Hobby, apague `crons` do `vercel.json` e use `.github/workflows/coleta.yml` (variável `PAINEL_URL` e segredo `CRON_SECRET` no repositório).

## Webhooks

Os dois pedem `Authorization: Bearer <INGEST_SECRET>` (ou `?segredo=`) e corpo JSON.

```
POST /api/ingest/inscrito
{ "email": "...", "telefone": "...", "utm_source": "meta", "utm_medium": "...", "utm_campaign": "...", "utm_content": "nome do anúncio", "utm_term": "...", "criado_em": "2027-01-01T20:00:00-03:00" }

POST /api/ingest/venda
{ "id_transacao": "...", "status": "aprovada", "valor": 997, "email": "...", "produto": "...", "utm_source": "...", "utm_content": "...", "criado_em": "..." }
```

`status` aceita `aprovada`, `reembolsada`, `pendente`, `cancelada`. `criado_em` é opcional (padrão: agora). O corpo de cada plataforma de vendas é diferente: escreva o adaptador em `src/lib/coleta/venda.ts` a partir de um aviso real.

## Erros comuns

| Sintoma | Causa provável |
|---|---|
| `schema ... não está em Exposed schemas` | Faltou expor o schema no Data API |
| `tabela ...: 404` | O SQL do schema não foi rodado |
| Meta: `Unsupported get request` ou erro de permissão | O usuário do sistema não tem a conta atribuída, ou o token não tem `ads_read` |
| Meta: 0 campanhas com o código | `marcaCampanha` diferente do nome real das campanhas |
| Sheets: `The caller does not have permission` | A planilha não foi compartilhada com o e-mail da conta de serviço |
| Sheets: coluna de data não encontrada | O nome em `inscritos.sheets.colunas` difere do cabeçalho da aba |
| Supabase da página: `permission denied for table` | Rodar lá `grant select on public.<tabela> to service_role;` |
| Painel mostra a mídia "atrasada" | O cron não está rodando (plano Hobby) ou o worker está falhando: veja a tabela `coletas` |
