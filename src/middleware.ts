import { NextResponse, type NextRequest } from "next/server";
import { assinatura, COOKIE } from "@/lib/acesso";

export async function middleware(req: NextRequest) {
  const caminho = req.nextUrl.pathname;
  // workers e webhooks conferem o próprio segredo (CRON_SECRET, INGEST_SECRET)
  if (caminho.startsWith("/login") || caminho.startsWith("/api/entrar") || caminho.startsWith("/api/cron/") || caminho.startsWith("/api/ingest/")) return NextResponse.next();
  const esperado = await assinatura();
  if (esperado && req.cookies.get(COOKIE)?.value === esperado) return NextResponse.next();
  if (caminho.startsWith("/api/")) return NextResponse.json({ erro: "sem acesso" }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
