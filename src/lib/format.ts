/** Valor que pode faltar: null = sem dado (a tela mostra "—" com o motivo, nunca zero falso). */
export type Num = number | null;

export function brl(v: Num, casas = 2) {
  if (v == null || !Number.isFinite(v)) return "—";
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export function inteiro(v: Num) {
  if (v == null || !Number.isFinite(v)) return "—";
  return Math.round(v).toLocaleString("pt-BR");
}

export function pct(v: Num, casas = 1) {
  if (v == null || !Number.isFinite(v)) return "—";
  return `${(v * 100).toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })}%`;
}

/** Divisão que devolve null quando não há denominador. */
export function div(a: number, b: number): Num {
  return b > 0 ? a / b : null;
}

/** 2026-10-13 → 13/10 */
export function diaCurto(iso: string) {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

export function diaLongo(iso: string) {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
}
