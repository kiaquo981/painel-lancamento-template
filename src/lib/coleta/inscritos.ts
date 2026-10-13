import "server-only";
import { createSign } from "node:crypto";
import { gravar } from "../banco";
import { CONFIG } from "../config";
import { embaralhar, instante } from "./comum";

/**
 * Linha de inscrito já no formato da tabela. A chave é a pessoa (e-mail; sem e-mail, telefone):
 * quem se inscreve duas vezes conta uma vez, e vale a primeira inscrição (ver gravarInscritos).
 */
export function linhaInscrito(fonte: string, l: Record<string, unknown>) {
  const criado = instante(l.criadoEm, CONFIG.fuso);
  if (!criado) return null;
  const t = (v: unknown) => (v == null || v === "" ? null : String(v).trim());
  const email = embaralhar("email", l.email);
  const telefone = embaralhar("telefone", l.telefone);
  return {
    chave: email ?? telefone ?? `sem-contato:${criado}:${t(l.utm_content) ?? ""}`,
    criado_em: criado,
    fonte,
    utm_source: t(l.utm_source),
    utm_medium: t(l.utm_medium),
    utm_campaign: t(l.utm_campaign),
    utm_content: t(l.utm_content),
    utm_term: t(l.utm_term),
    email_hash: email,
    telefone_hash: telefone,
  };
}

/** A primeira inscrição de cada pessoa fica; as repetidas são ignoradas. */
export function gravarInscritos(linhas: NonNullable<ReturnType<typeof linhaInscrito>>[]) {
  return gravar("inscritos", linhas, "chave", "manter");
}

/** Token do Google para a conta de serviço (a planilha é compartilhada com o e-mail dela, como leitor). */
async function tokenGoogle() {
  const bruto = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!bruto) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON não configurado");
  const conta = JSON.parse(bruto.trim().startsWith("{") ? bruto : Buffer.from(bruto, "base64").toString("utf8")) as { client_email: string; private_key: string };
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const agora = Math.floor(Date.now() / 1000);
  const corpo = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({ iss: conta.client_email, scope: "https://www.googleapis.com/auth/spreadsheets.readonly", aud: "https://oauth2.googleapis.com/token", iat: agora, exp: agora + 3000 })}`;
  const assinatura = createSign("RSA-SHA256").update(corpo).sign(conta.private_key, "base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", cache: "no-store", body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${corpo}.${assinatura}` }) });
  const j = (await r.json()) as { access_token?: string; error_description?: string };
  if (!j.access_token) throw new Error(`o Google recusou a conta de serviço: ${j.error_description ?? r.status}`);
  return j.access_token;
}

/** Lê a aba da planilha. A primeira linha é o cabeçalho; as colunas são achadas pelo nome do briefing. */
async function daPlanilha() {
  const { planilhaId, aba, colunas } = CONFIG.inscritos.sheets;
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${planilhaId}/values/${encodeURIComponent(aba)}`, { headers: { Authorization: `Bearer ${await tokenGoogle()}` }, cache: "no-store" });
  const j = (await r.json()) as { values?: string[][]; error?: { message: string } };
  if (j.error) throw new Error(`o Google Sheets respondeu: ${j.error.message} (a planilha foi compartilhada com o e-mail da conta de serviço?)`);
  const [cab = [], ...linhas] = j.values ?? [];
  const pos = (nome: string | null) => (nome ? cab.findIndex((c) => c.trim().toLowerCase() === nome.trim().toLowerCase()) : -1);
  const idx = Object.fromEntries(Object.entries(colunas).map(([campo, nome]) => [campo, pos(nome)]));
  if (idx.criadoEm < 0) throw new Error(`a aba "${aba}" não tem a coluna de data "${colunas.criadoEm}"`);
  return linhas.flatMap((l) => {
    const o = Object.fromEntries(Object.entries(idx).map(([campo, i]) => [campo, i >= 0 ? l[i] : null]));
    const linha = linhaInscrito("sheets", o);
    return linha ? [linha] : [];
  });
}

/** Lê a tabela de leads de outro Supabase (o da página de captura), pedindo só as colunas mapeadas. */
async function deOutroSupabase() {
  const base = process.env.LEADS_SUPABASE_URL;
  const chave = process.env.LEADS_SUPABASE_KEY;
  if (!base || !chave) throw new Error("LEADS_SUPABASE_URL ou LEADS_SUPABASE_KEY não configurada");
  const { tabela, colunas } = CONFIG.inscritos.supabase;
  const usadas = Object.values(colunas).filter(Boolean).join(",");
  const tudo: Record<string, unknown>[] = [];
  for (let i = 0; i < 100; i++) {
    const r = await fetch(`${base}/rest/v1/${tabela}?select=${usadas}&${colunas.criadoEm}=gte.${CONFIG.inicioCaptacao}T00:00:00${encodeURIComponent(CONFIG.fuso)}&order=${colunas.criadoEm}`, {
      headers: { apikey: chave, Authorization: `Bearer ${chave}`, Range: `${i * 1000}-${i * 1000 + 999}`, "Range-Unit": "items" },
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`o Supabase dos leads respondeu ${r.status}: ${(await r.text()).slice(0, 160)}`);
    const lote = (await r.json()) as Record<string, unknown>[];
    tudo.push(...lote);
    if (lote.length < 1000) break;
  }
  return tudo.flatMap((l) => {
    const o = Object.fromEntries(Object.entries(colunas).map(([campo, col]) => [campo, col ? l[col] : null]));
    const linha = linhaInscrito("supabase", o);
    return linha ? [linha] : [];
  });
}

export async function coletarInscritos() {
  const fonte = CONFIG.inscritos.fonte;
  if (fonte === "webhook") return { fonte, linhas: 0 }; // chegam sozinhos em /api/ingest/inscrito
  const linhas = fonte === "sheets" ? await daPlanilha() : await deOutroSupabase();
  // em ordem de data, para a primeira inscrição de cada pessoa ser a que fica
  linhas.sort((a, b) => a.criado_em.localeCompare(b.criado_em));
  return { fonte, linhas: await gravarInscritos(linhas) };
}
