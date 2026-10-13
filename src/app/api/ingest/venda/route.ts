import { NextResponse, type NextRequest } from "next/server";
import { gravar } from "@/lib/banco";
import { recusar } from "@/lib/coleta/comum";
import { normalizarVenda, STATUS } from "@/lib/coleta/venda";

export const dynamic = "force-dynamic";

/** POST JSON { id_transacao, status, valor, email, produto, utm_*, criado_em? } com Authorization: Bearer INGEST_SECRET. */
export async function POST(req: NextRequest) {
  const nao = recusar(req, "INGEST_SECRET");
  if (nao) return nao;
  const c = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const venda = c && normalizarVenda(c);
  if (!venda) return NextResponse.json({ erro: `corpo inválido: preciso de id_transacao, status (${STATUS.join(", ")}) e valor` }, { status: 400 });
  await gravar("vendas", [venda], "id_transacao");
  return NextResponse.json({ ok: true });
}
