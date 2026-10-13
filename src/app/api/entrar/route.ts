import { NextResponse, type NextRequest } from "next/server";
import { assinatura, COOKIE } from "@/lib/acesso";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const senha = String(form.get("senha") ?? "");
  const esperado = await assinatura();
  const url = req.nextUrl.clone();
  url.search = "";
  if (!esperado || senha !== process.env.PAINEL_SENHA) {
    url.pathname = "/login";
    url.searchParams.set("erro", "1");
    return NextResponse.redirect(url, 303);
  }
  url.pathname = "/";
  const res = NextResponse.redirect(url, 303);
  res.cookies.set(COOKIE, esperado, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
