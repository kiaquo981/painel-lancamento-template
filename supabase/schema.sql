-- Tabelas do painel de lançamento, num schema por cliente.
-- Não rode este arquivo direto: `node scripts/gerar-schema.mjs` troca __SCHEMA__ pelo schema do
-- lancamento.config.json e grava supabase/schema.<schema>.sql, que você cola no SQL Editor do Supabase.
-- Depois: Project Settings → Data API → Exposed schemas → adicione o schema.

create schema if not exists __SCHEMA__;

-- Mídia por anúncio e dia (worker /api/cron/meta)
create table if not exists __SCHEMA__.midia_dia (
  dia date not null,
  ad_id text not null,
  adset_id text,
  campaign_id text,
  campanha text,
  conjunto text,
  anuncio text,
  status text,
  verba_dia numeric,
  gasto numeric not null default 0,
  alcance integer not null default 0,
  impressoes integer not null default 0,
  cliques integer not null default 0,        -- cliques no link
  visitas integer not null default 0,        -- landing page view
  videos15s integer not null default 0,      -- ThruPlay
  leads_pixel integer not null default 0,
  compras_pixel integer not null default 0,
  atualizado_em timestamptz not null default now(),
  primary key (dia, ad_id)
);

-- Mídia do dia, hora a hora
create table if not exists __SCHEMA__.midia_hora (
  dia date not null,
  hora smallint not null,
  ad_id text not null,
  gasto numeric not null default 0,
  impressoes integer not null default 0,
  cliques integer not null default 0,        -- todos os cliques (a Meta não quebra clique no link por hora)
  primary key (dia, hora, ad_id)
);

-- Inscritos SEM dado pessoal: e-mail e telefone entram só embaralhados (SHA-256 com segredo),
-- o suficiente para casar inscrito com venda sem guardar quem é a pessoa.
create table if not exists __SCHEMA__.inscritos (
  chave text primary key,
  criado_em timestamptz not null,
  fonte text not null,                        -- sheets | supabase | webhook
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  email_hash text,
  telefone_hash text
);
create index if not exists inscritos_criado_em on __SCHEMA__.inscritos (criado_em);
create index if not exists inscritos_email_hash on __SCHEMA__.inscritos (email_hash);

create table if not exists __SCHEMA__.vendas (
  id_transacao text primary key,
  criado_em timestamptz not null,
  status text not null,                       -- aprovada | reembolsada | pendente | cancelada
  valor numeric not null default 0,
  produto text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  email_hash text
);

-- Execuções dos workers: é daqui que o painel tira "atualizado às HH:MM"
create table if not exists __SCHEMA__.coletas (
  worker text not null,
  iniciou_em timestamptz not null,
  terminou_em timestamptz,
  ok boolean not null,
  linhas integer not null default 0,
  erro text,
  primary key (worker, iniciou_em)
);

-- Só o servidor (service_role) lê e grava. Nada é exposto para anon ou authenticated.
grant usage on schema __SCHEMA__ to service_role;
grant all on all tables in schema __SCHEMA__ to service_role;
alter default privileges in schema __SCHEMA__ grant all on tables to service_role;
alter table __SCHEMA__.midia_dia enable row level security;
alter table __SCHEMA__.midia_hora enable row level security;
alter table __SCHEMA__.inscritos enable row level security;
alter table __SCHEMA__.vendas enable row level security;
alter table __SCHEMA__.coletas enable row level security;
