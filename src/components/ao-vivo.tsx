"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Retrato = {
  ok: boolean;
  motivo: string | null;
  hoje: { total: number; origens: { origem: string; n: number }[] };
  acumulado: number;
  ultimoInscrito: string | null;
  coletaMidia: string | null;
  agora: string;
};

const hora = (iso: string | null) => (iso ? new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }) : "—");

/**
 * Faixa ao vivo. Pergunta ao servidor a cada 20 segundos; quando entra inscrito novo ou chega
 * coleta nova de mídia, recarrega os números da tela.
 */
export function AoVivo() {
  const router = useRouter();
  const [r, setR] = useState<Retrato | null>(null);
  const [falha, setFalha] = useState(false);
  const anterior = useRef<string>("");

  useEffect(() => {
    let vivo = true;
    async function buscar() {
      try {
        const res = await fetch("/api/ao-vivo", { cache: "no-store" });
        if (!res.ok) throw new Error();
        const j = (await res.json()) as Retrato;
        if (!vivo) return;
        setR(j);
        setFalha(false);
        const marca = `${j.acumulado}|${j.coletaMidia}`;
        if (anterior.current && anterior.current !== marca) router.refresh();
        anterior.current = marca;
      } catch {
        if (vivo) setFalha(true);
      }
    }
    buscar();
    const t = setInterval(buscar, 20_000);
    return () => {
      vivo = false;
      clearInterval(t);
    };
  }, [router]);

  const atraso = r?.coletaMidia ? (new Date(r.agora).getTime() - new Date(r.coletaMidia).getTime()) / 60_000 : null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl border border-zinc-200 bg-cartao px-4 py-2.5 text-[13px] text-texto">
      <span className="inline-flex items-center gap-2 font-medium">
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${falha ? "bg-ruim" : "animate-ping bg-bom"}`} />
          <span className={`relative inline-flex h-2 w-2 rounded-full ${falha ? "bg-ruim" : "bg-bom"}`} />
        </span>
        {falha ? "Sem conexão com o servidor" : "Ao vivo"}
      </span>
      {r ? (
        r.ok ? (
          <>
            <span>
              Inscritos hoje: <strong className="tabular-nums">{r.hoje.total}</strong>{" "}
              <span className="text-texto-suave">{r.hoje.origens.length ? `(${r.hoje.origens.map((o) => `${o.n} ${o.origem.toLowerCase()}`).join(" · ")})` : ""}</span>
            </span>
            <span>
              Último inscrito: <strong className="tabular-nums">{hora(r.ultimoInscrito)}</strong>
            </span>
          </>
        ) : (
          <span className="text-ruim">Inscritos indisponíveis: {r.motivo}</span>
        )
      ) : (
        <span className="text-texto-suave">Carregando…</span>
      )}
      {r ? (
        <span className={atraso != null && atraso > 45 ? "text-ruim" : "text-texto-suave"}>
          Mídia atualizada às <strong className="tabular-nums">{hora(r.coletaMidia)}</strong>
          {atraso != null && atraso > 45 ? " (atrasada: a coleta roda a cada 15 minutos)" : " (coleta a cada 15 minutos)"}
        </span>
      ) : null}
    </div>
  );
}
