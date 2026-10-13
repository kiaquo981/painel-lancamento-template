/** Funções puras da coleta (sem rede, sem banco), cobertas por testes/. */
type Acao = { action_type: string; value: string };
export type Insight = Record<string, unknown> & { actions?: Acao[]; video_thruplay_watched_actions?: Acao[] };

const num = (v: unknown) => Number(v) || 0;
const acao = (l: Acao[] | undefined, tipo: string) => num(l?.find((a) => a.action_type === tipo)?.value);

/** Uma linha de insights da Meta (anúncio × dia) no formato da tabela midia_dia. */
export function mapearInsight(r: Insight) {
  return {
    dia: String(r.date_start),
    ad_id: String(r.ad_id),
    adset_id: String(r.adset_id ?? ""),
    campaign_id: String(r.campaign_id ?? ""),
    campanha: String(r.campaign_name ?? ""),
    conjunto: String(r.adset_name ?? ""),
    anuncio: String(r.ad_name ?? ""),
    gasto: num(r.spend),
    alcance: num(r.reach),
    impressoes: num(r.impressions),
    cliques: num(r.inline_link_clicks),
    visitas: acao(r.actions, "landing_page_view"),
    videos15s: acao(r.video_thruplay_watched_actions, "video_view"),
    leads_pixel: acao(r.actions, "lead"),
    compras_pixel: acao(r.actions, "purchase"),
  };
}

/** Aceita ISO ou "dd/mm/aaaa hh:mm[:ss]" (comum em planilha), no fuso do lançamento. Devolve ISO em UTC ou null. */
export function instante(v: unknown, fuso: string): string | null {
  if (v == null || v === "") return null;
  const t = String(v).trim();
  const br = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  let iso: string;
  if (br) iso = `${br[3]}-${br[2].padStart(2, "0")}-${br[1].padStart(2, "0")}T${(br[4] ?? "00").padStart(2, "0")}:${br[5] ?? "00"}:${br[6] ?? "00"}${fuso}`;
  else if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(t)) iso = t;
  else if (/^\d{4}-\d{2}-\d{2}$/.test(t)) iso = `${t}T00:00:00${fuso}`;
  else iso = `${t.replace(" ", "T")}${fuso}`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
