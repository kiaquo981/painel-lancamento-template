# Comece aqui

Tutorial para quem nunca usou repositório, terminal ou agente de código. Siga na ordem; cada parte termina com um "como saber que deu certo".

Tempo: cerca de 1 hora no primeiro projeto, a maior parte esperando páginas abrirem e copiando chaves.

## O que você vai construir

Um painel na internet, com senha, que mostra o lançamento de um cliente: quanto foi investido, quantos cliques, visitas e inscritos, o custo de cada um, por anúncio, contra as metas. Ele se atualiza sozinho e pode mandar um resumo no Telegram de hora em hora.

Você não vai programar. Um agente (o Claude Code, por exemplo) faz isso conversando com você. O seu papel é responder às perguntas dele e entregar os acessos.

## Palavras que vão aparecer

| Palavra | O que é |
|---|---|
| Repositório | Uma pasta de projeto. Só isso: arquivos numa pasta. |
| Modelo | Esta pasta. Cada cliente novo começa de uma cópia dela. |
| Terminal | O programa onde se digita comando. No Mac chama "Terminal". |
| Agente | O assistente que lê a pasta e faz o trabalho (Claude Code, Codex). |
| Briefing | As perguntas que o agente faz antes de montar qualquer coisa. |
| Chave ou token | Uma senha longa que deixa o painel ler um sistema (Meta, banco, planilha). |
| Deploy | Publicar o painel na internet. |

## Parte 1 · Instalar o que falta (uma vez só)

Abra o Terminal (no Mac: Cmd + Espaço, digite "Terminal", Enter).

1. **Node.** Entre em https://nodejs.org, baixe a versão **LTS** e instale como qualquer programa. Feche e abra o Terminal de novo.
2. **Claude Code** (o agente). No Terminal, cole e dê Enter:
   ```
   npm install -g @anthropic-ai/claude-code
   ```
3. **Vercel** (onde o painel fica publicado):
   ```
   npm install -g vercel
   vercel login
   ```
   O `vercel login` abre o navegador para você entrar na sua conta.

**Deu certo se:** `node -v` mostra um número (por exemplo `v22.15.0`) e `vercel whoami` mostra o seu usuário.

> **Windows:** o assistente de acessos precisa do WSL (Ubuntu dentro do Windows). Instale o WSL pela Microsoft Store e faça todo este tutorial dentro dele.

## Parte 2 · Contas que você precisa ter

| Conta | Para quê | Custo |
|---|---|---|
| **Supabase** (supabase.com) | Banco de dados dos painéis. Crie **um** projeto e use para todos os clientes. | Gratuito para começar |
| **Vercel** (vercel.com) | Hospedar o painel. | Gratuito publica; a atualização a cada 15 minutos pede o plano Pro (ver Parte 7) |
| **Google** | Só se os inscritos estiverem numa planilha do Google. | Gratuito |
| **Meta** | Acesso de administrador ao Gerenciador de Negócios do cliente, para gerar a chave de leitura dos anúncios. | — |
| **Telegram** | Opcional, para o resumo de hora em hora. | Gratuito |

## Parte 3 · Criar a pasta do projeto

Cada cliente tem a sua pasta. Nunca trabalhe direto no modelo.

1. Crie uma pasta chamada `paineis` nos seus Documentos.
2. Descompacte o arquivo `painel-lancamento-template.zip` dentro dela.
3. Renomeie a pasta descompactada com o nome do projeto, sem espaço nem acento. Exemplo: `painel-cliente-janeiro`.

Para o próximo cliente, descompacte o zip de novo e dê outro nome.

**Deu certo se:** dentro da pasta do projeto você vê arquivos como `AGENTS.md`, `COMECE-AQUI.md` e `lancamento.config.json`.

*(Se você já usa Git: `git clone <endereço do repositório> painel-cliente-janeiro` faz o mesmo.)*

## Parte 4 · Abrir a pasta no Terminal

1. No Terminal, digite `cd ` (com um espaço no fim), arraste a pasta do projeto para dentro da janela e dê Enter.
2. Instale as peças do projeto:
   ```
   npm install
   ```
   Demora um ou dois minutos.

**Deu certo se:** o comando termina sem a palavra `ERR` em vermelho.

## Parte 5 · O briefing com o agente

1. Ainda na pasta, digite:
   ```
   claude
   ```
   Na primeira vez ele pede para você entrar na sua conta.
2. Escreva para ele:
   ```
   monte o painel deste lançamento
   ```
3. Ele vai fazer perguntas, uma por vez. Tenha em mãos:

   - Nome do cliente e do lançamento; o que é vendido e por quanto.
   - Datas: início da captação, dia do evento, abertura e fechamento do carrinho.
   - Metas: verba, custo por inscrito desejado e máximo.
   - Número da conta de anúncios (começa com `act_`) e o código que todas as campanhas do lançamento têm no nome.
   - Onde os inscritos ficam gravados: planilha do Google (link e nome das colunas), banco, ou a página avisa.
   - Plataforma de vendas.
   - Cores e fontes da marca (pode mandar o link do site ou da página).

   Se não souber alguma resposta, diga que não sabe. Ele registra como pendência e segue.
4. No final ele mostra um resumo. Leia e confirme.

**Deu certo se:** ele diz que o briefing está fechado e pede para você rodar o assistente de acessos.

## Parte 6 · Entregar os acessos

Esta parte é sua: o agente não consegue abrir os painéis nem copiar as chaves por você.

1. Abra **outra aba** do Terminal (Cmd + T). Ela já abre na mesma pasta.
2. Rode:
   ```
   npm run acessos
   ```
3. O assistente mostra uma etapa por vez. Em cada uma ele abre a página certa no navegador, diz onde clicar e o que copiar, e você cola de volta. As chaves não aparecem na tela enquanto você cola; é normal.

As etapas:

| Etapa | O que você faz |
|---|---|
| 1. Supabase | Copia o endereço e a chave do projeto; cola um texto no "SQL Editor" (já vem copiado) e clica em rodar; adiciona o nome do cliente em "Exposed schemas". |
| 2. Meta Ads | Cria um "usuário do sistema" no Gerenciador de Negócios, dá a ele a conta de anúncios e gera a chave de leitura. |
| 3. Inscritos | Depende da resposta do briefing. Na planilha do Google, veja o quadro abaixo. |
| 4. Senha | Escolhe a senha que o cliente vai usar para abrir o painel. |
| 5. Telegram | Opcional. Cria um bot e escolhe a conversa que recebe o resumo. |
| 6. Teste | O assistente testa cada acesso e mostra ✓ ou ✗. |
| 7. Publicar | Pergunta se pode publicar. Responda `y`. |

> **Planilha do Google.** O assistente ajuda a criar uma "conta de serviço" e mostra um e-mail estranho, parecido com `nome@projeto.iam.gserviceaccount.com`. Abra a planilha de leads, clique em **Compartilhar**, cole esse e-mail e escolha **Leitor**. É isso que deixa o painel ler a planilha. Compartilhe só com esse e-mail; a planilha não precisa ficar pública.

Pode parar no meio (Ctrl + C) e rodar de novo: ele lembra o que já foi preenchido.

**Deu certo se:** a etapa 6 mostra ✓ em todas as linhas e a etapa 7 termina com um endereço `https://...vercel.app`.

Se aparecer ✗, copie a mensagem, volte à aba do agente e cole. Ele sabe diagnosticar.

## Parte 7 · Conferir e entregar

1. Volte à aba do agente e diga: `publiquei, faça a conferência`.
2. Ele confere o painel publicado item por item e diz o que está funcionando e o que ficou "sem fonte".
3. Abra o endereço, digite a senha e olhe com os seus olhos. O investimento de hoje deve bater com o Gerenciador de Anúncios.
4. Mande ao cliente o endereço e a senha.

**Atualização automática.** No plano gratuito da Vercel, a atualização só roda uma vez por dia. Para o painel se atualizar a cada 15 minutos, use o plano Pro da Vercel, ou peça ao agente: `configure a coleta pelo GitHub Actions`.

## Depois que está no ar

| Quero | Como |
|---|---|
| Mudar uma meta, data ou cor | Abra o agente na pasta e peça. Depois rode `bash scripts/publicar.sh`. |
| Trocar a senha | Rode `npm run acessos` e refaça só a etapa da senha (Enter mantém as outras), depois publique. |
| Ligar as vendas | Peça ao agente: `ligue as vendas da <plataforma>`. Ele vai pedir um aviso de venda de exemplo. |
| Começar outro cliente | Parte 3 de novo, com outra pasta. As Partes 1 e 2 não se repetem. |

## Cuidados

- O arquivo `.env.local` guarda as chaves do projeto. Não envie esse arquivo a ninguém nem cole o conteúdo dele em conversa.
- Depois da etapa da planilha, apague o arquivo `.json` que o Google baixou.
- A senha do painel é única: quem tem a senha vê tudo.
- O painel não guarda nome, e-mail nem telefone dos inscritos, só a origem e a data.

## Se travar

1. Copie a mensagem de erro inteira.
2. Cole para o agente e diga em que parte deste tutorial você estava.
3. A tabela "Erros comuns" em `docs/ACESSOS.md` cobre os casos mais frequentes.
