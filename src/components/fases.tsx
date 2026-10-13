"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ABAS, caminhoAba, FASES } from "@/lib/config";
import { diaCurto } from "@/lib/format";

/** Trilho de fases: cada fase abre a aba que importa nela. A fase corrente vem das datas. */
export function TrilhoFases({ atuais }: { atuais: string[] }) {
  return (
    <div className="mb-3">
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-texto-suave">Fases do lançamento</p>
      <div className="flex flex-wrap gap-1.5">
        {FASES.map((f) => {
          const atual = atuais.includes(f.key);
          return (
            <Link
              key={f.key}
              href={caminhoAba(f.aba)}
              className={clsx(
                "inline-flex min-h-[44px] min-w-[8.5rem] flex-col justify-center rounded-lg border px-3 py-2 text-left text-xs transition hover:border-destaque-forte",
                atual ? "border-destaque bg-destaque-suave font-semibold text-destaque-forte" : "border-zinc-200 bg-cartao text-texto-suave",
              )}
            >
              <span className="leading-tight">{f.nome}</span>
              <span className="mt-0.5 text-[10px] font-normal text-texto-suave">
                {diaCurto(f.de)}
                {f.ate && f.ate !== f.de ? ` a ${diaCurto(f.ate)}` : f.ate ? "" : " em diante"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Abas({ atuais }: { atuais: string[] }) {
  const caminho = usePathname() || "";
  const ativa = ABAS.find((a) => a.id !== "geral" && caminho.startsWith(caminhoAba(a.id)))?.id ?? "geral";
  return (
    <nav aria-label="Telas do lançamento" className="mb-4 border-b border-zinc-200">
      <div className="-mb-px flex gap-0.5 overflow-x-auto">
        {ABAS.map((a) => {
          const quente = a.id === "geral" || FASES.some((f) => f.aba === a.id && atuais.includes(f.key)); // a aba da fase em andamento ganha o ponto
          return (
            <Link
              key={a.id}
              href={caminhoAba(a.id)}
              title={a.descricao}
              className={clsx(
                "inline-flex min-h-[40px] shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-medium transition",
                ativa === a.id ? "border-destaque-forte text-destaque-forte" : "border-transparent text-texto-suave hover:border-zinc-300 hover:text-texto",
              )}
            >
              {quente ? <span className={clsx("h-1.5 w-1.5 rounded-full", ativa === a.id ? "bg-destaque-forte" : "bg-bom")} /> : null}
              {a.rotulo}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
