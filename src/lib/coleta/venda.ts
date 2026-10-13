import "server-only";
import { CONFIG } from "../config";
import { embaralhar, instante } from "./comum";

export const STATUS = ["aprovada", "reembolsada", "pendente", "cancelada"];

/**
 * Formato neutro de venda. Cada plataforma (Hotmart, Eduzz, Kiwify...) manda um corpo diferente:
 * escreva aqui o adaptador da plataforma do projeto, conferindo com um aviso real dela.
 * O formato neutro abaixo já funciona para n8n, Make ou teste manual.
 */
export function normalizarVenda(c: Record<string, unknown>) {
  const t = (v: unknown) => (v == null || v === "" ? null : String(v).trim());
  const status = String(c.status ?? "").toLowerCase();
  const criado = instante(c.criado_em ?? new Date().toISOString(), CONFIG.fuso);
  if (!t(c.id_transacao) || !STATUS.includes(status) || !criado) return null;
  return {
    id_transacao: String(c.id_transacao),
    criado_em: criado,
    status,
    valor: Number(c.valor) || 0,
    produto: t(c.produto),
    utm_source: t(c.utm_source),
    utm_medium: t(c.utm_medium),
    utm_campaign: t(c.utm_campaign),
    utm_content: t(c.utm_content),
    email_hash: embaralhar("email", c.email),
  };
}
