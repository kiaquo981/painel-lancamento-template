import { AvisosDeFonte } from "@/components/fontes";
import { Aviso, Cartao, Grade, Painel, Tabela, td, th } from "@/components/ui";
import { CONFIG } from "@/lib/config";
import { carregarTudo, SEM_ORIGEM } from "@/lib/dados";
import { diaCurto, inteiro, pct } from "@/lib/format";
import { cobertura, porOrigem } from "@/lib/metricas";

export default async function Origens() {
  const { midia, inscritos } = await carregarTudo();
  const origens = porOrigem(inscritos.dados);
  const cob = cobertura(midia.dados, inscritos.dados);
  const t = cob.total;

  const grupos = new Map<string, { s: string; m: string; c: string; ct: string; n: number }>();
  for (const i of inscritos.dados) {
    const k = [i.utmSource, i.utmMedium, i.utmCampaign, i.utmContent].join("|");
    const g = grupos.get(k) ?? { s: i.utmSource ?? "", m: i.utmMedium ?? "", c: i.utmCampaign ?? "", ct: i.utmContent ?? "", n: 0 };
    g.n += 1;
    grupos.set(k, g);
  }
  const linhas = [...grupos.values()].sort((a, b) => b.n - a.n);

  return (
    <>
      <AvisosDeFonte fontes={[{ nome: "Inscritos", fonte: inscritos }]} />
      <Painel titulo="De onde vieram os inscritos" descricao={`Desde ${diaCurto(CONFIG.inicioCaptacao)}, pela origem gravada na inscrição. Inscrições de teste ficam de fora.`}>
        {origens.length === 0 ? (
          <Aviso tom="info">Nenhum inscrito recebido ainda.</Aviso>
        ) : (
          <Grade colunas={4}>
            {origens.map((o) => (
              <Cartao key={o.origem} rotulo={o.origem} valor={inteiro(o.n)} apoio={`${pct(o.n / t, 0)} dos inscritos`} cor={o.origem === SEM_ORIGEM && o.n / t > 0.2 ? "vermelho" : "neutro"} />
            ))}
          </Grade>
        )}
      </Painel>

      <Painel titulo="Cobertura da origem" descricao="Quanto dos inscritos o painel consegue atribuir.">
        <div className="space-y-2">
          <Aviso tom={t && cob.semOrigem / t > 0.2 ? "atencao" : "info"}>
            <strong>{cob.comOrigem} de {cob.total} inscritos têm a origem identificada ({pct(t ? cob.comOrigem / t : null, 0)}).</strong> Os {cob.semOrigem} sem origem podem ser de anúncio e ficam fora do custo por inscrito.
          </Aviso>
          <Aviso tom={cob.pagosSemAnuncio ? "atencao" : "info"}>
            <strong>{cob.pagosComAnuncio} de {cob.pagos} inscritos de anúncio têm o anúncio identificado.</strong> O custo por inscrito de cada anúncio conta só esses.
          </Aviso>
        </div>
      </Painel>

      <Painel titulo="Origem por origem" descricao="Como a inscrição chegou marcada.">
        <Tabela>
          <thead>
            <tr className="border-b border-zinc-200">
              {["Fonte", "Meio", "Campanha", "Anúncio", "Inscritos", "% do total"].map((c) => (
                <th key={c} className={th}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={[l.s, l.m, l.c, l.ct].join("|")} className="border-b border-zinc-100 last:border-0">
                <td className={td}>{l.s || "sem origem"}</td>
                <td className={`${td} !text-left`}>{l.m || "—"}</td>
                <td className={`${td} !text-left max-w-[24rem] truncate`} title={l.c}>{l.c || "—"}</td>
                <td className={`${td} !text-left max-w-[22rem] truncate`} title={l.ct}>{l.ct || "—"}</td>
                <td className={td}><strong>{inteiro(l.n)}</strong></td>
                <td className={td}>{pct(t ? l.n / t : null, 0)}</td>
              </tr>
            ))}
          </tbody>
        </Tabela>
      </Painel>
    </>
  );
}
