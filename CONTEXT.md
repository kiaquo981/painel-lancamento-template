# Glossário do lançamento

Um nome por conceito. Tela, código e relatório usam estes termos.

| Termo | Definição | Conta |
|---|---|---|
| Inscrito | Pessoa que preencheu o formulário da página de captura. Conta uma vez por e-mail (sem e-mail, por telefone) e vale a primeira inscrição. A base de inscritos é a referência; o pixel é só conferência. | — |
| Inscrito por anúncio | Inscrito cuja `utm_source` está em `origens.pago` | — |
| Sem origem | Inscrito sem nenhuma UTM gravada. Pode ser de anúncio; fica fora do custo por inscrito | — |
| Investimento | Gasto das campanhas que trazem `marcaCampanha` no nome | soma de `gasto` |
| Clique | Clique no link do anúncio | `inline_link_clicks` |
| Visita | Página de destino carregada | ação `landing_page_view` |
| Connect rate | Quanto dos cliques chega a carregar a página | visitas ÷ cliques |
| Conversão da página | Quanto das visitas vira inscrito | inscritos por anúncio ÷ visitas |
| Custo por clique / visita / inscrito | — | investimento ÷ cliques / visitas / inscritos por anúncio |
| Vídeo de 15 s | ThruPlay | `video_thruplay_watched_actions` |
| Inscrições no pixel | Evento `lead` que a Meta registrou | ação `lead` |
| Cobertura da origem | Quanto dos inscritos tem origem identificada, e quanto dos de anúncio casa com um anúncio da conta (`utm_content` = nome do anúncio) | — |
| Meta do dia | Meta total = verba ÷ custo-alvo, repartida pelos dias da captação. O que faltou num dia se espalha pelos dias restantes | — |
| Semáforo do custo por inscrito | Verde até o alvo, amarelo até o teto, vermelho acima. Só aparece a partir de `amostraMinima` inscritos | — |
| Temperatura | Quente ou frio, lida do nome da campanha pelas expressões do briefing | — |
| Venda | Compra aprovada avisada pela plataforma | — |
| Custo por venda | — | investimento ÷ vendas aprovadas |
| Retorno sobre a mídia | — | faturamento ÷ investimento |
| Sem fonte | Etapa do funil que existe, mas nenhum sistema entrega o dado. Aparece marcada; nunca estimada | — |
| Coleta | Uma execução de worker, registrada na tabela `coletas`. É de onde sai "atualizado às" | — |
