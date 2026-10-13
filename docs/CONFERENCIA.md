# Conferência ponta a ponta

Feita no painel publicado, com dado real. Marque cada item como conferido ou como pendência nomeada.

## Acesso
- [ ] Sem a senha, qualquer tela redireciona para `/login` e `/api/ao-vivo` responde 401.
- [ ] Senha errada volta ao login com erro; a certa abre o painel.
- [ ] `/api/cron/meta` sem o segredo responde 401.

## Coleta
- [ ] `GET /api/cron/meta` com o segredo responde `ok: true` e a tabela `coletas` ganha uma linha `meta`.
- [ ] O investimento de hoje no painel bate com o Gerenciador de Anúncios (mesmo filtro de campanhas, mesmo dia).
- [ ] `GET /api/cron/inscritos` responde `ok: true` (trilhas `sheets` e `supabase`), ou uma inscrição de teste pelo webhook aparece (trilha `webhook`).
- [ ] O total de inscritos no painel bate com a planilha ou a tabela de origem, descontadas as inscrições de teste.
- [ ] A faixa "ao vivo" mostra a hora da última coleta e muda sozinha depois de uma inscrição nova.

## Cruzamento
- [ ] Uma inscrição feita a partir de um anúncio real aparece no anúncio certo, na aba Anúncios.
- [ ] A aba Origens mostra a cobertura; se houver muitos "sem origem", a causa está registrada como pendência.
- [ ] Inscrições no pixel e inscritos da base aparecem lado a lado e a diferença é explicável.

## Telas
- [ ] Visão geral, Captação, Anúncios, Origens e Plano abrem com dado real e sem "indisponível".
- [ ] A fase em andamento no trilho corresponde à data de hoje.
- [ ] Etapas sem fonte aparecem como "sem fonte", sem número.
- [ ] Vendas: uma compra de teste aparece (ou a tela diz o que falta).
- [ ] Cores e fontes correspondem à identidade do briefing; o texto de destaque é legível.

## Operação
- [ ] O agendamento está rodando: duas linhas `meta` na tabela `coletas` com cerca de 15 minutos entre elas.
- [ ] O relatório chegou no Telegram (se configurado).
- [ ] A pessoa recebeu: endereço, senha, o que funciona, o que está "sem fonte" e as pendências.
