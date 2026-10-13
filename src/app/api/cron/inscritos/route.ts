import { NextResponse, type NextRequest } from "next/server";
import { registrarColeta } from "@/lib/banco";
import { recusar } from "@/lib/coleta/comum";
import { coletarInscritos } from "@/lib/coleta/inscritos";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Worker dos inscritos: planilha do Google ou Supabase da página → inscritos (sem dado pessoal). */
export async function GET(req: NextRequest) {
  const nao = recusar(req, "CRON_SECRET");
  if (nao) return nao;
  const inicio = new Date();
  try {
    const r = await coletarInscritos();
    await registrarColeta("inscritos", inicio, r.linhas, null);
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    const erro = e instanceof Error ? e.message : String(e);
    await registrarColeta("inscritos", inicio, 0, erro);
    return NextResponse.json({ ok: false, erro }, { status: 500 });
  }
}
