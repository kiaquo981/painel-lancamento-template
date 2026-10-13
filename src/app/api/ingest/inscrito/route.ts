import { NextResponse, type NextRequest } from "next/server";
import { recusar } from "@/lib/coleta/comum";
import { gravarInscritos, linhaInscrito } from "@/lib/coleta/inscritos";

export const dynamic = "force-dynamic";

/**
 * Webhook de inscrição: a página de captura avisa o painel na hora.
 * POST JSON { email, telefone, utm_source, utm_medium, utm_campaign, utm_content, utm_term, criado_em? }
 * com Authorization: Bearer INGEST_SECRET (ou ?segredo=).
 */
export async function POST(req: NextRequest) {
  const nao = recusar(req, "INGEST_SECRET");
  if (nao) return nao;
  const c = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!c) return NextResponse.json({ erro: "corpo JSON inválido" }, { status: 400 });
  const linha = linhaInscrito("webhook", { ...c, criadoEm: c.criado_em ?? new Date().toISOString() });
  if (!linha) return NextResponse.json({ erro: "criado_em inválido" }, { status: 400 });
  await gravarInscritos([linha]);
  return NextResponse.json({ ok: true });
}
