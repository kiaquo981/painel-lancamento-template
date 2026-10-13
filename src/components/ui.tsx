import clsx from "clsx";
import type { Semaforo } from "@/lib/metricas";

const COR: Record<Semaforo, string> = { verde: "text-bom", amarelo: "text-atencao", vermelho: "text-ruim", neutro: "text-texto" };
const PONTO: Record<Semaforo, string> = { verde: "bg-bom", amarelo: "bg-atencao", vermelho: "bg-ruim", neutro: "bg-zinc-300" };

/**
 * Cartão de indicador. Quando o valor é "—", `motivo` explica por quê (aparece embaixo e na dica).
 * `formula` descreve a conta em português, para ninguém precisar adivinhar de onde saiu o número.
 */
export function Cartao({ rotulo, valor, apoio, formula, motivo, cor = "neutro" }: { rotulo: string; valor: string; apoio?: string; formula?: string; motivo?: string; cor?: Semaforo }) {
  const ausente = valor === "—";
  return (
    <div className="rounded-xl border border-zinc-200 bg-cartao px-4 py-3" title={ausente ? motivo : formula}>
      <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-texto-suave">
        {cor !== "neutro" ? <span className={clsx("h-1.5 w-1.5 rounded-full", PONTO[cor])} /> : null}
        {rotulo}
      </p>
      <p className={clsx("mt-1 font-serif text-[28px] font-semibold leading-none tabular-nums", ausente ? "text-zinc-400" : COR[cor])}>{valor}</p>
      {ausente && motivo ? <p className="mt-1.5 text-[11px] leading-snug text-texto-suave">{motivo}</p> : apoio ? <p className="mt-1.5 text-[11px] leading-snug text-texto-suave">{apoio}</p> : null}
      {formula && !ausente ? <p className="mt-1 text-[10px] leading-snug text-zinc-400">{formula}</p> : null}
    </div>
  );
}

export function Grade({ children, colunas = 4 }: { children: React.ReactNode; colunas?: 3 | 4 | 6 }) {
  return (
    <div className={clsx("grid grid-cols-2 gap-3", colunas === 3 && "md:grid-cols-3", colunas === 4 && "md:grid-cols-4", colunas === 6 && "md:grid-cols-3 xl:grid-cols-6")}>
      {children}
    </div>
  );
}

export function Painel({ titulo, descricao, children, id }: { titulo: string; descricao?: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="mt-6 scroll-mt-4">
      <h2 className="font-serif text-2xl font-semibold text-texto">{titulo}</h2>
      {descricao ? <p className="mt-0.5 text-sm text-texto-suave">{descricao}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function Caixa({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("rounded-xl border border-zinc-200 bg-cartao p-4", className)}>{children}</div>;
}

export function Aviso({ tom = "atencao", children }: { tom?: "atencao" | "ruim" | "info"; children: React.ReactNode }) {
  return (
    <div className={clsx("rounded-lg border px-3 py-2 text-sm", tom === "ruim" && "border-ruim/30 bg-ruim/5 text-ruim", tom === "atencao" && "border-destaque bg-destaque-suave text-destaque-forte", tom === "info" && "border-zinc-200 bg-cartao text-texto-suave")}>
      {children}
    </div>
  );
}

/** Etiqueta "ainda sem fonte": a etapa existe no funil, mas nenhum sistema entrega esse dado hoje. */
export function SemFonte({ titulo, motivo, falta }: { titulo: string; motivo: string; falta: string[] }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-cartao/70 p-6">
      <p className="font-serif text-xl font-semibold text-texto">{titulo}</p>
      <p className="mt-1 text-sm text-texto-suave">{motivo}</p>
      <p className="mt-4 text-[10px] font-medium uppercase tracking-wider text-secundaria">Para esta tela ligar</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-texto">
        {falta.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </div>
  );
}

export const th = "whitespace-nowrap px-2.5 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-texto-suave first:text-left";
export const td = "whitespace-nowrap px-2.5 py-1.5 text-right text-[13px] tabular-nums text-texto first:text-left";

export function Tabela({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-cartao">
      <table className="w-full border-collapse">{children}</table>
    </div>
  );
}
