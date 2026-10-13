import "server-only";
import { ler } from "./banco";
import { CONFIG, diaHora } from "./config";

/** Toda fonte volta num envelope: ou os dados, ou o motivo de não ter vindo. */
export type Fonte<T> = { ok: true; dados: T } | { ok: false; dados: T; motivo: string };

export type AdDia = {
  dia: string;
  ad_id: string;
  adset_id: string;
  campaign_id: string;
  campanha: string;
  conjunto: string;
  anuncio: string;
  status: string | null;
  verbaDia: number | null;
  gasto: number;
  alcance: number;
  impressoes: number;
  cliques: number;
  visitas: number;
  videos15s: number;
  leadsPixel: number;
  comprasPixel: number;
};
export type AdHora = { ad_id: string; hora: number; gasto: number; impressoes: number; cliques: number };

/** Inscrito sem dado pessoal: origem, data e as marcas de UTM. */
export type Inscrito = {
  dia: string;
  hora: number;
  criadoEm: string;
  origem: string; // "Anúncios", o nome de uma regra, "Outras origens" ou "Sem origem"
  pago: boolean;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
};
export type Venda = { dia: string; criadoEm: string; valor: number; pago: boolean; utmContent: string | null };

export const ANUNCIOS = "Anúncios";
export const SEM_ORIGEM = "Sem origem";
export const OUTRAS = "Outras origens";

async function fonte<T>(vazio: T, f: () => Promise<T>): Promise<Fonte<T>> {
  try {
    return { ok: true, dados: await f() };
  } catch (e) {
    return { ok: false, dados: vazio, motivo: e instanceof Error ? e.message : "falha na leitura" };
  }
}

const n = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);
const s = (v: unknown) => (v == null || v === "" ? null : String(v).trim());
type Linha = Record<string, unknown>;

/** Classifica a origem pelas regras do briefing. Devolve null para inscrição de teste. */
export function classificar(l: { utm_source?: unknown; utm_medium?: unknown; utm_campaign?: unknown }) {
  const src = (s(l.utm_source) ?? "").toLowerCase();
  const o = CONFIG.origens;
  if (o.teste.includes(src)) return null;
  if (o.pago.includes(src)) return { origem: ANUNCIOS, pago: true };
  for (const r of o.regras) if ((s(l[r.campo]) ?? "").toLowerCase() === r.igual.toLowerCase()) return { origem: r.nome, pago: false };
  return { origem: src || s(l.utm_medium) || s(l.utm_campaign) ? OUTRAS : SEM_ORIGEM, pago: false };
}

export function carregarMidia() {
  return fonte<AdDia[]>([], async () => {
    const linhas = await ler<Linha>(`midia_dia?dia=gte.${CONFIG.inicioCaptacao}&order=dia`);
    return linhas.map((l) => ({
      dia: String(l.dia),
      ad_id: String(l.ad_id),
      adset_id: String(l.adset_id),
      campaign_id: String(l.campaign_id),
      campanha: String(l.campanha ?? ""),
      conjunto: String(l.conjunto ?? ""),
      anuncio: String(l.anuncio ?? ""),
      status: s(l.status),
      verbaDia: l.verba_dia == null ? null : n(l.verba_dia),
      gasto: n(l.gasto),
      alcance: n(l.alcance),
      impressoes: n(l.impressoes),
      cliques: n(l.cliques),
      visitas: n(l.visitas),
      videos15s: n(l.videos15s),
      leadsPixel: n(l.leads_pixel),
      comprasPixel: n(l.compras_pixel),
    }));
  });
}

export function carregarHoras(dia: string) {
  return fonte<AdHora[]>([], async () => {
    const linhas = await ler<Linha>(`midia_hora?dia=eq.${dia}`);
    return linhas.map((l) => ({ ad_id: String(l.ad_id), hora: n(l.hora), gasto: n(l.gasto), impressoes: n(l.impressoes), cliques: n(l.cliques) }));
  });
}

/** Só as colunas de UTM e a data saem do banco; os identificadores embaralhados ficam lá. */
export function carregarInscritos() {
  return fonte<Inscrito[]>([], async () => {
    const linhas = await ler<Linha>(`inscritos?select=criado_em,utm_source,utm_medium,utm_campaign,utm_content&criado_em=gte.${CONFIG.inicioCaptacao}T00:00:00${encodeURIComponent(CONFIG.fuso)}&order=criado_em`);
    const out: Inscrito[] = [];
    for (const l of linhas) {
      const c = classificar(l);
      if (!c) continue;
      out.push({ ...diaHora(String(l.criado_em)), criadoEm: String(l.criado_em), ...c, utmSource: s(l.utm_source), utmMedium: s(l.utm_medium), utmCampaign: s(l.utm_campaign), utmContent: s(l.utm_content) });
    }
    return out;
  });
}

export function carregarVendas() {
  return fonte<Venda[]>([], async () => {
    const linhas = await ler<Linha>("vendas?select=criado_em,valor,utm_source,utm_medium,utm_campaign,utm_content&status=eq.aprovada&order=criado_em");
    return linhas.map((l) => ({ dia: diaHora(String(l.criado_em)).dia, criadoEm: String(l.criado_em), valor: n(l.valor), pago: classificar(l)?.pago ?? false, utmContent: s(l.utm_content) }));
  });
}

/** Última coleta bem-sucedida de cada worker. */
export function carregarColetas() {
  return fonte<Record<string, string>>({}, async () => {
    const linhas = await ler<Linha>("coletas?ok=eq.true&select=worker,terminou_em&order=terminou_em.desc&limit=60");
    const out: Record<string, string> = {};
    for (const l of linhas) out[String(l.worker)] ??= String(l.terminou_em);
    return out;
  });
}

export async function carregarTudo() {
  const [midia, inscritos, vendas, coletas] = await Promise.all([carregarMidia(), carregarInscritos(), carregarVendas(), carregarColetas()]);
  return { midia, inscritos, vendas, coletas };
}
