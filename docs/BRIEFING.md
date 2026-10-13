# Briefing do lançamento

Entrevista obrigatória antes de qualquer tela. Faça uma pergunta por vez, na ordem; se a pessoa já entregou um documento (plano, planilha, página), leia primeiro e pergunte só o que faltar. Ao final, mostre o resumo e peça confirmação.

Cada resposta preenche um campo de `lancamento.config.json`.

## 1. A campanha

| Pergunta | Campo |
|---|---|
| Quem é o cliente e como a marca assina (linha pequena do topo)? | `marca` |
| Qual o nome do lançamento ou do evento? Há um trecho para destacar em itálico? | `nome`, `destaque` |
| Uma linha que resume o evento (formato, data, hora) | `subtitulo` |
| O que é vendido, por quanto? | `metas.ticket` |
| Apelido curto do projeto, só minúsculas (vira endereço e nome do schema) | `slug`, `banco.schema` |

## 2. Datas e fases

| Pergunta | Campo |
|---|---|
| Quando a captação começa e em que dia é o evento? | `inicioCaptacao`, `diaEvento` |
| Quais as fases, com início e fim (captação, aquecimento, evento, carrinho, pós)? | `fases` |
| Fuso horário da operação e da conta de anúncios (devem ser o mesmo) | `fuso` |

Cada fase aponta para a aba que importa nela (`aba`: `captacao`, `grupo`, `evento`, `vendas`, `fechamento`, `plano`). Fase sem fim usa `ate: null`.

## 3. Metas

| Pergunta | Campo |
|---|---|
| Verba da captação | `metas.verbaCaptacao` |
| Custo por inscrito desejado e o máximo aceitável | `metas.custoInscritoAlvo`, `metas.custoInscritoTeto` |
| Quanto dos inscritos costuma comparecer? | `metas.comparecimento` |
| Quanto dos presentes costuma comprar (mínimo e máximo)? | `metas.conversaoMin`, `metas.conversaoMax` |
| Com quantos inscritos um anúncio já pode ser julgado? (padrão 25) | `metas.amostraMinima` |

Sem histórico, registre a premissa como pendência e diga isso no resumo.

## 4. Mídia

| Pergunta | Campo |
|---|---|
| Número da conta de anúncios da Meta (`act_...`) | `meta.contaAnuncios` |
| Que código todas as campanhas deste lançamento trazem no nome? | `marcaCampanha` |
| Como o nome da campanha diz se o público é quente ou frio? | `temperatura` (expressões regulares; vazio se não houver) |
| Quais valores de `utm_source` são de anúncio? | `origens.pago` |
| Há outras origens que merecem nome próprio (ManyChat, e-mail, bio)? | `origens.regras` |
| Que `utm_source` marca inscrição de teste? | `origens.teste` |

O painel liga o inscrito ao anúncio por `utm_content` = nome do anúncio. Confirme que os anúncios usam `utm_content={{ad.name}}`; se não usam, isso é a primeira pendência.

## 5. Inscritos

Pergunte onde os inscritos são gravados hoje e escolha uma trilha (`inscritos.fonte`):

| Trilha | Quando | O que perguntar |
|---|---|---|
| `sheets` | Os leads caem numa planilha do Google | Link da planilha (`planilhaId` é o trecho entre `/d/` e `/edit`), nome da aba, e o nome exato das colunas de data, e-mail, telefone e de cada UTM |
| `supabase` | A página grava num Supabase | Nome da tabela e das colunas (id, data, e-mail, telefone, UTMs) |
| `webhook` | A página consegue avisar um endereço a cada inscrição | Quem configura o envio na página |

Na trilha `sheets`, a pessoa compartilha a planilha, como leitor, com o e-mail da conta de serviço que o assistente de acessos mostra.

## 6. Vendas, grupo e presença

- Qual a plataforma de vendas? Ela envia aviso de venda (webhook)?
- O grupo tem ferramenta de administração? A presença no evento tem relatório?

O que não tiver fonte fica "sem fonte" no painel; registre no resumo.

## 7. Identidade visual

| Pergunta | Campo |
|---|---|
| Há manual de marca, página ou site de referência? | leia e extraia |
| Cores: fundo, cartão, borda, texto, texto suave, destaque (claro, suave e forte), secundária | `tema.cores` |
| Fontes de título e de texto (nomes do Google Fonts) | `tema.fontes` |

`destaqueForte` é usado em texto e linhas: precisa ter contraste sobre `fundo` e `cartao`.

## 8. Operação

- Quem vai acessar o painel? (a senha é única)
- Quer o relatório de hora em hora no Telegram?
- Em qual time da Vercel publicar, e em qual projeto do Supabase ficam os painéis?

## Resumo para confirmar

Mostre: campanha, datas e fases, metas, conta e código das campanhas, trilha dos inscritos, o que fica "sem fonte", identidade visual e as pendências. Só siga com o "ok" da pessoa.
