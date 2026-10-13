import clsx from "clsx";
import { AvisosDeFonte } from "@/components/fontes";
import { Aviso, Painel, Tabela, td, th } from "@/components/ui";
import { carregarTudo } from "@/lib/dados";
import { brl, inteiro, pct } from "@/lib/format";
import { CONFIG, METAS } from "@/lib/config";
import { diaCurto } from "@/lib/format";
import { arvore, funil, semaforoCusto, type LinhaArvore } from "@/lib/metricas";

const COR = { verde: "text-bom", amarelo: "text-atencao", vermelho: "text-ruim", neutro: "text-texto" } as const;
const TEMP = { quente: "Quente", frio: "Frio", outro: "—" } as const;
const STATUS: Record<string, string> = { ACTIVE: "Ativo", PAUSED: "Pausado", CAMPAIGN_PAUSED: "Campanha pausada", ADSET_PAUSED: "Conjunto pausado", PENDING_REVIEW: "Em análise", DISAPPROVED: "Reprovado", WITH_ISSUES: "Com problema" };

function Linha({ l, teto }: { l: LinhaArvore; teto: number }) {
  const f = funil(l);
  const s = semaforoCusto(f.custoInscrito, l.inscritos, teto);
  return (
    <tr className={clsx("border-b border-zinc-100 last:border-0", l.nivel === "campanha" && "bg-zinc-100/70", l.nivel === "conjunto" && "bg-zinc-100/30")}>
      <td className={clsx(td, "max-w-[26rem] truncate", l.nivel === "campanha" && "font-semibold", l.nivel === "conjunto" && "pl-6 font-medium", l.nivel === "anuncio" && "pl-10")} title={l.nome}>
        {l.nome}
      </td>
      <td className={td}>{l.nivel === "campanha" ? TEMP[l.temperatura] : ""}</td>
      <td className={td}>{l.nivel === "anuncio" ? (STATUS[l.status ?? ""] ?? l.status ?? "—") : ""}</td>
      <td className={td}>{l.nivel === "anuncio" ? "" : brl(l.verbaDia, 0)}</td>
      <td className={td}>{brl(l.gasto)}</td>
      <td className={td}>{inteiro(l.impressoes)}</td>
      <td className={td}>{brl(f.custoMil)}</td>
      <td className={td}>{inteiro(l.cliques)}</td>
      <td className={td}>{brl(f.custoClique)}</td>
      <td className={td}>{inteiro(l.visitas)}</td>
      <td className={td}>{brl(f.custoVisita)}</td>
      <td className={td}>{pct(f.connect)}</td>
      <td className={td}><strong>{inteiro(l.inscritos)}</strong></td>
      <td className={clsx(td, COR[s.cor], "font-semibold")} title={s.leitura}>{brl(f.custoInscrito)}</td>
      <td className={td}>{pct(f.conversaoPagina)}</td>
      <td className={td}>{inteiro(l.leadsPixel)}</td>
      <td className={td}>{inteiro(l.videos15s)}</td>
      <td className={td}>{brl(f.custoVideo)}</td>
    </tr>
  );
}

export default async function Anuncios() {
  const { midia, inscritos } = await carregarTudo();
  const teto = METAS.custoInscritoTeto;
  const camps = arvore(midia.dados, inscritos.dados);
  return (
    <>
      <AvisosDeFonte fontes={[{ nome: "Mídia da Meta", fonte: midia }, { nome: "Inscritos da página", fonte: inscritos }]} />
      <Painel titulo="Campanhas, conjuntos e anúncios" descricao={`Acumulado desde ${diaCurto(CONFIG.inicioCaptacao)}. O custo por inscrito usa a base de inscritos, não o pixel. Verde até ${brl(METAS.custoInscritoAlvo)}, amarelo até ${brl(teto)}, vermelho acima; a cor só aparece a partir de ${METAS.amostraMinima} inscritos.`}>
        {camps.length === 0 ? (
          <Aviso tom="info">Nenhum anúncio da captação com entrega registrada ainda.</Aviso>
        ) : (
          <Tabela>
            <thead>
              <tr className="border-b border-zinc-200">
                {["Campanha · conjunto · anúncio", "Público", "Situação", "Verba por dia", "Investimento", "Exibições", "Custo por mil", "Cliques", "Custo por clique", "Visitas", "Custo por visita", "Connect rate", "Inscritos", "Custo por inscrito", "Conversão da página", "Inscrições no pixel", "Vídeos de 15 s", "Custo por vídeo"].map((c) => (
                  <th key={c} className={th}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {camps.flatMap((c) => [
                <Linha key={c.chave} l={c} teto={teto} />,
                ...c.filhos.flatMap((cj) => [<Linha key={cj.chave} l={cj} teto={teto} />, ...cj.filhos.map((ad) => <Linha key={ad.chave} l={ad} teto={teto} />)]),
              ])}
            </tbody>
          </Tabela>
        )}
      </Painel>
    </>
  );
}
