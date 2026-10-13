import { NextResponse } from "next/server";
import { carregarColetas, carregarInscritos } from "@/lib/dados";
import { hojeLocal } from "@/lib/config";
import { porOrigem } from "@/lib/metricas";

export const dynamic = "force-dynamic";

/** Retrato leve para a faixa "ao vivo": contagem de inscritos e hora da última coleta de mídia. */
export async function GET() {
  const [inscritos, coleta] = await Promise.all([carregarInscritos(), carregarColetas()]);
  const hoje = hojeLocal();
  const doDia = inscritos.dados.filter((i) => i.dia === hoje);
  return NextResponse.json({
    ok: inscritos.ok,
    motivo: inscritos.ok ? null : inscritos.motivo,
    hoje: { total: doDia.length, origens: porOrigem(doDia) },
    acumulado: inscritos.dados.length,
    ultimoInscrito: inscritos.dados.at(-1)?.criadoEm ?? null,
    coletaMidia: coleta.dados.meta ?? null,
    agora: new Date().toISOString(),
  });
}
