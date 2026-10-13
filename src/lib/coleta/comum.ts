import "server-only";
import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

/** Embaralha e-mail ou telefone: o painel casa inscrito com venda sem guardar o dado pessoal. */
export function embaralhar(tipo: "email" | "telefone", valor: unknown) {
  if (valor == null || valor === "") return null;
  const limpo = tipo === "email" ? String(valor).trim().toLowerCase() : String(valor).replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  if (!limpo) return null;
  return createHash("sha256").update(`${process.env.PAINEL_SEGREDO ?? ""}:${tipo}:${limpo}`).digest("hex");
}

/** Confere o segredo de um worker (cron) ou de um webhook. Devolve a resposta de recusa, ou null se passou. */
export function recusar(req: NextRequest, variavel: "CRON_SECRET" | "INGEST_SECRET") {
  const segredo = process.env[variavel];
  const veio = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? req.nextUrl.searchParams.get("segredo");
  if (!segredo) return NextResponse.json({ erro: `${variavel} não configurada` }, { status: 503 });
  if (veio !== segredo) return NextResponse.json({ erro: "sem acesso" }, { status: 401 });
  return null;
}

export { instante } from "./puro";
