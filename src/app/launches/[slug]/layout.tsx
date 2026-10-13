import { notFound } from "next/navigation";
import { AoVivo } from "@/components/ao-vivo";
import { Abas, TrilhoFases } from "@/components/fases";
import { diaLongo } from "@/lib/format";
import { CONFIG, fasesAtuais, SLUG } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function Moldura({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== SLUG) notFound();
  const atuais = fasesAtuais();
  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 md:px-8">
      <header className="mb-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-secundaria">{CONFIG.marca}</p>
        <h1 className="mt-1 font-serif text-4xl font-semibold leading-tight text-texto">
          {CONFIG.nome}
          {CONFIG.destaque ? <em className="font-medium text-secundaria"> {CONFIG.destaque}</em> : null}
        </h1>
        <p className="mt-1 text-sm text-texto-suave">
          {CONFIG.subtitulo} · captação de {diaLongo(CONFIG.inicioCaptacao)} a {diaLongo(CONFIG.diaEvento)}
        </p>
      </header>
      <AoVivo />
      <TrilhoFases atuais={atuais} />
      <Abas atuais={atuais} />
      {children}
    </div>
  );
}
