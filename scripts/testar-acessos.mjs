// Testa cada acesso com uma leitura de verdade. Uso: npm run testar-acessos
// Sai com código 1 se alguma conexão obrigatória falhar.
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync("lancamento.config.json", "utf8"));
const env = process.env;
let falhas = 0;
const ok = (nome, detalhe) => console.log(`  ✓ ${nome}: ${detalhe}`);
const ruim = (nome, detalhe) => { falhas += 1; console.log(`  ✗ ${nome}: ${detalhe}`); };
const pular = (nome, detalhe) => console.log(`  – ${nome}: ${detalhe}`);
async function teste(nome, f) { try { ok(nome, await f()); } catch (e) { ruim(nome, e.message); } }
const exigir = (...nomes) => { const f = nomes.filter((n) => !env[n]); if (f.length) throw new Error(`falta ${f.join(", ")} em .env.local`); };

await teste("Supabase do painel", async () => {
  exigir("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY");
  const h = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "Accept-Profile": cfg.banco.schema };
  for (const t of ["midia_dia", "midia_hora", "inscritos", "vendas", "coletas"]) {
    const r = await fetch(`${env.SUPABASE_URL}/rest/v1/${t}?limit=1`, { headers: h });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      if (j.code === "PGRST106") throw new Error(`o schema "${cfg.banco.schema}" não está em Exposed schemas (Project Settings → Data API)`);
      throw new Error(`tabela ${t}: ${r.status} ${j.message ?? ""} (o SQL de supabase/schema.${cfg.banco.schema}.sql foi rodado?)`);
    }
  }
  return `schema ${cfg.banco.schema}, 5 tabelas respondendo`;
});

await teste("Meta Ads", async () => {
  exigir("META_ACCESS_TOKEN");
  const v = env.META_API_VERSION || "v22.0";
  const g = async (caminho, p = {}) => {
    const j = await (await fetch(`https://graph.facebook.com/${v}/${caminho}?${new URLSearchParams({ ...p, access_token: env.META_ACCESS_TOKEN })}`)).json();
    if (j.error) throw new Error(j.error.message);
    return j;
  };
  const conta = await g(cfg.meta.contaAnuncios, { fields: "name,account_status,timezone_name,currency" });
  const camp = await g(`${cfg.meta.contaAnuncios}/campaigns`, { fields: "name", limit: "200", filtering: JSON.stringify([{ field: "name", operator: "CONTAIN", value: cfg.marcaCampanha }]) });
  const n = camp.data?.length ?? 0;
  return `conta "${conta.name}" (${conta.timezone_name}, ${conta.currency}); ${n} campanha(s) com "${cfg.marcaCampanha}" no nome${n ? "" : " — confira o código da campanha no briefing"}`;
});

if (cfg.inscritos.fonte === "sheets") {
  await teste("Google Sheets", async () => {
    exigir("GOOGLE_SERVICE_ACCOUNT_JSON");
    const b = env.GOOGLE_SERVICE_ACCOUNT_JSON.trim();
    const conta = JSON.parse(b.startsWith("{") ? b : Buffer.from(b, "base64").toString("utf8"));
    const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
    const agora = Math.floor(Date.now() / 1000);
    const corpo = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({ iss: conta.client_email, scope: "https://www.googleapis.com/auth/spreadsheets.readonly", aud: "https://oauth2.googleapis.com/token", iat: agora, exp: agora + 600 })}`;
    const jwt = `${corpo}.${createSign("RSA-SHA256").update(corpo).sign(conta.private_key, "base64url")}`;
    const tk = await (await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }) })).json();
    if (!tk.access_token) throw new Error(`o Google recusou a conta de serviço: ${tk.error_description ?? tk.error}`);
    const { planilhaId, aba, colunas } = cfg.inscritos.sheets;
    const j = await (await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${planilhaId}/values/${encodeURIComponent(aba)}!1:1`, { headers: { Authorization: `Bearer ${tk.access_token}` } })).json();
    if (j.error) throw new Error(`${j.error.message} — a planilha foi compartilhada com ${conta.client_email}?`);
    const cab = (j.values?.[0] ?? []).map((c) => c.trim().toLowerCase());
    const faltam = Object.values(colunas).filter((c) => c && !cab.includes(c.trim().toLowerCase()));
    if (!cab.includes(String(colunas.criadoEm).toLowerCase())) throw new Error(`a aba "${aba}" não tem a coluna de data "${colunas.criadoEm}". Cabeçalho: ${cab.join(", ")}`);
    return `aba "${aba}" lida por ${conta.client_email}${faltam.length ? `; colunas do briefing que não existem na planilha: ${faltam.join(", ")}` : "; todas as colunas do briefing encontradas"}`;
  });
} else if (cfg.inscritos.fonte === "supabase") {
  await teste("Supabase da página (inscritos)", async () => {
    exigir("LEADS_SUPABASE_URL", "LEADS_SUPABASE_KEY");
    const { tabela, colunas } = cfg.inscritos.supabase;
    const cols = Object.entries(colunas).filter(([k, v]) => v && !["email", "telefone"].includes(k)).map(([, v]) => v).join(",");
    const r = await fetch(`${env.LEADS_SUPABASE_URL}/rest/v1/${tabela}?select=${cols}&limit=1`, { headers: { apikey: env.LEADS_SUPABASE_KEY, Authorization: `Bearer ${env.LEADS_SUPABASE_KEY}` } });
    if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 200)}`);
    return `tabela ${tabela} respondeu com as colunas ${cols}`;
  });
} else {
  pular("Inscritos", "fonte webhook: teste enviando uma inscrição de verdade depois do deploy");
}

if (env.TELEGRAM_BOT_TOKEN) {
  await teste("Telegram", async () => {
    const j = await (await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getChat?chat_id=${env.TELEGRAM_CHAT_ID}`)).json();
    if (!j.ok) throw new Error(j.description);
    return `chat "${j.result.title ?? j.result.username ?? j.result.first_name}" alcançável`;
  });
} else pular("Telegram", "não configurado");

for (const n of ["PAINEL_SENHA", "PAINEL_SEGREDO", "CRON_SECRET", "INGEST_SECRET"]) if (!env[n]) ruim("Segredos", `falta ${n}`);
process.exit(falhas ? 1 : 0);
