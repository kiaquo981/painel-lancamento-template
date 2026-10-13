import assert from "node:assert/strict";
import { test } from "node:test";
import { instante, mapearInsight } from "../src/lib/coleta/puro.ts";

test("linha de insights da Meta vira linha de midia_dia", () => {
  const l = mapearInsight({
    date_start: "2027-01-02",
    ad_id: "1",
    ad_name: "CODIGO_AD01",
    adset_id: "2",
    adset_name: "Conjunto",
    campaign_id: "3",
    campaign_name: "X | CODIGO | Q | captação",
    spend: "37.01",
    reach: "900",
    impressions: "1216",
    inline_link_clicks: "4",
    actions: [
      { action_type: "landing_page_view", value: "3" },
      { action_type: "lead", value: "2" },
      { action_type: "video_view", value: "400" },
    ],
    video_thruplay_watched_actions: [{ action_type: "video_view", value: "45" }],
  });
  assert.deepEqual(
    { gasto: l.gasto, cliques: l.cliques, visitas: l.visitas, videos15s: l.videos15s, leads: l.leads_pixel, compras: l.compras_pixel, dia: l.dia, anuncio: l.anuncio },
    { gasto: 37.01, cliques: 4, visitas: 3, videos15s: 45, leads: 2, compras: 0, dia: "2027-01-02", anuncio: "CODIGO_AD01" },
  );
});

test("anúncio sem ações fica com zero, não quebra", () => {
  const l = mapearInsight({ date_start: "2027-01-02", ad_id: "9", spend: "3.08", impressions: "18" });
  assert.equal(l.visitas, 0);
  assert.equal(l.cliques, 0);
  assert.equal(l.gasto, 3.08);
});

test("datas de planilha e ISO viram o mesmo instante no fuso do lançamento", () => {
  assert.equal(instante("13/10/2026 13:40", "-03:00"), "2026-10-13T16:40:00.000Z");
  assert.equal(instante("13/10/2026 13:40:42", "-03:00"), "2026-10-13T16:40:42.000Z");
  assert.equal(instante("2026-10-13 13:40:00", "-03:00"), "2026-10-13T16:40:00.000Z");
  assert.equal(instante("2026-10-13T16:40:00Z", "-03:00"), "2026-10-13T16:40:00.000Z");
  assert.equal(instante("2026-10-13T13:40:00-03:00", "-03:00"), "2026-10-13T16:40:00.000Z");
  assert.equal(instante("13/10/2026", "-03:00"), "2026-10-13T03:00:00.000Z");
  assert.equal(instante("", "-03:00"), null);
  assert.equal(instante("não é data", "-03:00"), null);
});
