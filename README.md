# Painel de lançamento · modelo

Modelo para montar, por projeto, o painel de acompanhamento de um lançamento: mídia da Meta cruzada com inscritos e vendas, contra as metas, com coleta automática, relatório no Telegram e senha única.

Cada clone é o painel de **um** lançamento. O que muda entre projetos fica em `lancamento.config.json`; as chaves ficam em `.env.local` e na Vercel.

## Como usar (com um agente)

1. Clone este repositório numa pasta nova e abra nela o Claude Code, o Codex ou outro agente.
2. Peça: **"monte o painel deste lançamento"**. O agente lê `AGENTS.md` e começa pelo briefing: campanha, datas, metas, conta de anúncios, onde ficam os inscritos e identidade visual.
3. Quando ele pedir, rode no seu terminal `npm run acessos`. O assistente abre cada página, diz o que copiar, guarda as chaves e testa cada conexão.
4. Publique (último passo do assistente, ou `bash scripts/publicar.sh`) e deixe o agente fazer a conferência final.

No Claude Code há também a skill `skill/painel-lancamento/`: copie a pasta para `~/.claude/skills/` e chame `/painel-lancamento`.

## O que você precisa ter

- Node 22 e a CLI da Vercel (`npm i -g vercel`), com login feito.
- Um projeto no Supabase para hospedar os painéis (cada cliente ganha um schema).
- Acesso de administrador ao Gerenciador de Negócios da Meta do cliente, para gerar o token de leitura.
- Os inscritos em **uma** destas formas: planilha do Google, tabela num Supabase, ou página que consiga avisar um endereço a cada inscrição.

## Trilha do Google Sheets

O assistente cria com você uma conta de serviço no Google Cloud e mostra o e-mail dela. Você compartilha a planilha de leads com esse e-mail, como **Leitor**. O painel lê a aba a cada 5 minutos; e-mail e telefone são embaralhados antes de gravar.

## Telas

Visão geral · Captação · Anúncios · Origens · Vendas · Plano têm dado real. Grupo, Evento e Fechamento ficam marcadas "sem fonte" até o projeto ligar uma fonte para elas.

## Comandos

| Comando | Faz |
|---|---|
| `npm run acessos` | Assistente de acessos (interativo) |
| `npm run testar-acessos` | Testa cada conexão com uma leitura real |
| `npm run schema` | Gera o SQL do schema do cliente |
| `npm run dev` | Painel local em http://localhost:3311 (lê o `.env.local`) |
| `npm test` · `npm run typecheck` · `npm run build` | Verificações |
| `bash scripts/publicar.sh` | Grava as variáveis na Vercel e publica |

## Limites conhecidos

- O worker da Meta e a leitura do Google Sheets foram escritos pela documentação das APIs e cobertos por teste de formato; a primeira execução real de cada projeto é a conferência (`docs/CONFERENCIA.md`).
- O webhook de venda aceita um formato neutro. O adaptador da plataforma (Hotmart, Eduzz, Kiwify...) é escrito por projeto.
- O agendamento a cada 5 e 15 minutos pede o plano Pro da Vercel; no Hobby, use o fluxo do GitHub Actions incluído.
- A senha é única: quem tem a senha vê tudo.
