/** Senha única do painel. O cookie guarda só a assinatura (HMAC) da senha, nunca a senha. */
export const COOKIE = "pu_painel";

export async function assinatura() {
  const senha = process.env.PAINEL_SENHA;
  const segredo = process.env.PAINEL_SEGREDO;
  if (!senha || !segredo) return null; // sem configuração, o painel fica fechado
  const enc = new TextEncoder();
  const chave = await crypto.subtle.importKey("raw", enc.encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", chave, enc.encode(senha));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
