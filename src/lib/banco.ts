import "server-only";
import { CONFIG } from "./config";

/** Acesso ao Supabase do painel (schema do cliente) pela API REST, sempre no servidor. */
const base = () => process.env.SUPABASE_URL;
const chave = () => process.env.SUPABASE_SERVICE_ROLE_KEY;

function cabecalhos(extra: Record<string, string> = {}) {
  const k = chave();
  if (!base() || !k) throw new Error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurada no servidor");
  return { apikey: k, Authorization: `Bearer ${k}`, "Accept-Profile": CONFIG.banco.schema, "Content-Profile": CONFIG.banco.schema, ...extra };
}

export async function ler<T>(caminho: string): Promise<T[]> {
  const tudo: T[] = [];
  for (let i = 0; i < 50; i++) {
    // o Supabase devolve no máximo 1.000 linhas por pedido
    const r = await fetch(`${base()}/rest/v1/${caminho}`, { headers: cabecalhos({ Range: `${i * 1000}-${i * 1000 + 999}`, "Range-Unit": "items" }), cache: "no-store" });
    if (!r.ok) throw new Error(`o banco respondeu ${r.status} em ${caminho.split("?")[0]}`);
    const lote = (await r.json()) as T[];
    tudo.push(...lote);
    if (lote.length < 1000) break;
  }
  return tudo;
}

/**
 * Grava linhas (chave de conflito = colunas de `conflito`). Por padrão a linha nova substitui a antiga;
 * com "manter", a primeira gravada fica. Devolve quantas linhas mandou.
 */
export async function gravar(tabela: string, linhas: Record<string, unknown>[], conflito: string, seExistir: "atualizar" | "manter" = "atualizar") {
  for (let i = 0; i < linhas.length; i += 500) {
    const r = await fetch(`${base()}/rest/v1/${tabela}?on_conflict=${conflito}`, {
      method: "POST",
      headers: cabecalhos({ "Content-Type": "application/json", Prefer: `resolution=${seExistir === "manter" ? "ignore" : "merge"}-duplicates,return=minimal` }),
      body: JSON.stringify(linhas.slice(i, i + 500)),
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`o banco respondeu ${r.status} ao gravar ${tabela}: ${(await r.text()).slice(0, 200)}`);
  }
  return linhas.length;
}

/** Registra cada execução de coleta, para o painel dizer quando o dado foi atualizado. */
export async function registrarColeta(worker: string, inicio: Date, linhas: number, erro: string | null) {
  await gravar("coletas", [{ worker, iniciou_em: inicio.toISOString(), terminou_em: new Date().toISOString(), ok: !erro, linhas, erro }], "worker,iniciou_em").catch(() => {});
}
