import { NextResponse, type NextRequest } from "next/server";
import { registrarColeta } from "@/lib/banco";
import { recusar } from "@/lib/coleta/comum";
import { coletarMeta } from "@/lib/coleta/meta";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Worker da mídia: Meta → midia_dia e midia_hora. Agendado em vercel.json (ou no GitHub Actions). */
export async function GET(req: NextRequest) {
  const nao = recusar(req, "CRON_SECRET");
  if (nao) return nao;
  const inicio = new Date();
  try {
    const r = await coletarMeta();
    await registrarColeta("meta", inicio, r.dias + r.horas, null);
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    const erro = e instanceof Error ? e.message : String(e);
    await registrarColeta("meta", inicio, 0, erro);
    return NextResponse.json({ ok: false, erro }, { status: 500 });
  }
}
