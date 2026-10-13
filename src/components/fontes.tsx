import type { Fonte } from "@/lib/dados";
import { Aviso } from "./ui";

/** Faixa que diz quando uma fonte não respondeu. Sem ela, um zero na tela poderia ser só falta de dado. */
export function AvisosDeFonte({ fontes }: { fontes: { nome: string; fonte: Fonte<unknown> }[] }) {
  const fora = fontes.filter((f) => !f.fonte.ok);
  if (!fora.length) return null;
  return (
    <div className="mb-4 space-y-2">
      {fora.map((f) => (
        <Aviso key={f.nome} tom="ruim">
          <strong>{f.nome} indisponível:</strong> {f.fonte.ok ? "" : f.fonte.motivo}. Os números que dependem dessa fonte aparecem como “—”.
        </Aviso>
      ))}
    </div>
  );
}
