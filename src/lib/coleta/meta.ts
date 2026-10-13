import "server-only";
import { gravar } from "../banco";
import { CONFIG, hojeLocal } from "../config";
import { mapearInsight, type Insight } from "./puro";

/**
 * Coleta da Meta pela API de Marketing (token de usuário do sistema com ads_read).
 * Reprocessa os últimos 3 dias a cada execução, porque a Meta revisa a atribuição.
 */
const num = (v: unknown) => Number(v) || 0;

async function paginar<T>(url: string): Promise<T[]> {
  const tudo: T[] = [];
  for (let prox: string | undefined = url, i = 0; prox && i < 100; i++) {
    const r: Response = await fetch(prox, { cache: "no-store" });
    const j = (await r.json()) as { data?: T[]; paging?: { next?: string }; error?: { message: string } };
    if (j.error) throw new Error(`a Meta respondeu: ${j.error.message}`);
    tudo.push(...(j.data ?? []));
    prox = j.paging?.next;
  }
  return tudo;
}

export async function coletarMeta() {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error("META_ACCESS_TOKEN não configurado");
  const v = process.env.META_API_VERSION || "v22.0";
  const conta = CONFIG.meta.contaAnuncios;
  const hoje = hojeLocal();
  const tresDias = new Date(new Date(`${hoje}T12:00:00Z`).getTime() - 3 * 86400_000).toISOString().slice(0, 10);
  const desde = tresDias > CONFIG.inicioCaptacao ? tresDias : CONFIG.inicioCaptacao;
  if (hoje < desde) return { dias: 0, horas: 0 };
  const filtro = JSON.stringify([{ field: "campaign.name", operator: "CONTAIN", value: CONFIG.marcaCampanha }]);
  const url = (caminho: string, p: Record<string, string>) => `https://graph.facebook.com/${v}/${conta}/${caminho}?${new URLSearchParams({ ...p, access_token: token })}`;

  const insights = await paginar<Insight>(
    url("insights", {
      level: "ad",
      time_increment: "1",
      time_range: JSON.stringify({ since: desde, until: hoje }),
      filtering: filtro,
      limit: "500",
      fields: "ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,spend,reach,impressions,inline_link_clicks,actions,video_thruplay_watched_actions",
    }),
  );
  const anuncios = await paginar<{ id: string; effective_status?: string; adset?: { daily_budget?: string } }>(
    url("ads", { fields: "id,effective_status,adset{daily_budget}", filtering: filtro, limit: "500" }),
  );
  const porId = new Map(anuncios.map((a) => [a.id, a]));
  const linhas = insights.map((r) => {
    const a = porId.get(String(r.ad_id));
    return { ...mapearInsight(r), atualizado_em: new Date().toISOString(), status: a?.effective_status ?? null, verba_dia: a?.adset?.daily_budget ? num(a.adset.daily_budget) / 100 : null };
  });

  const porHora = await paginar<Record<string, string>>(
    url("insights", {
      level: "ad",
      time_range: JSON.stringify({ since: hoje, until: hoje }),
      breakdowns: "hourly_stats_aggregated_by_advertiser_time_zone",
      filtering: filtro,
      limit: "1000",
      fields: "ad_id,spend,impressions,clicks",
    }),
  );
  const horas = porHora.map((h) => ({ dia: hoje, hora: Number(String(h.hourly_stats_aggregated_by_advertiser_time_zone).slice(0, 2)), ad_id: h.ad_id, gasto: num(h.spend), impressoes: num(h.impressions), cliques: num(h.clicks) }));

  return { dias: await gravar("midia_dia", linhas, "dia,ad_id"), horas: await gravar("midia_hora", horas, "dia,hora,ad_id") };
}
