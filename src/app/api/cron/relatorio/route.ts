import { NextResponse, type NextRequest } from "next/server";
import { recusar } from "@/lib/coleta/comum";
import { montarRelatorio } from "@/lib/relatorio";

export const dynamic = "force-dynamic";

/** Worker do relatório: manda o resumo do dia no Telegram. Sem as variáveis do Telegram, só devolve o texto. */
export async function GET(req: NextRequest) {
  const nao = recusar(req, "CRON_SECRET");
  if (nao) return nao;
  const texto = await montarRelatorio();
  const { TELEGRAM_BOT_TOKEN: bot, TELEGRAM_CHAT_ID: chat } = process.env;
  if (!bot || !chat) return NextResponse.json({ ok: true, enviado: false, texto });
  const r = await fetch(`https://api.telegram.org/bot${bot}/sendMessage`, { method: "POST", body: new URLSearchParams({ chat_id: chat, text: texto, disable_web_page_preview: "true" }), cache: "no-store" });
  return NextResponse.json({ ok: r.ok, enviado: r.ok }, { status: r.ok ? 200 : 502 });
}
