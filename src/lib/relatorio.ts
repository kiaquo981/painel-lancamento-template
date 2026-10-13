import "server-only";
import { carregarTudo } from "./dados";
import { CONFIG, hojeLocal } from "./config";
import { brl, inteiro, pct } from "./format";
import { arvore, cobertura, funil, total } from "./metricas";

/** Texto do relatório horário: o dia até agora, no total e por anúncio. */
export async function montarRelatorio() {
  const { midia, inscritos } = await carregarTudo();
  const hoje = hojeLocal();
  const ads = midia.dados.filter((a) => a.dia === hoje);
  const insc = inscritos.dados.filter((i) => i.dia === hoje);
  const s = total(ads, insc);
  const f = funil(s);
  const cob = cobertura(midia.dados, insc);
  const hora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
  const l = [
    `${CONFIG.nome} · captação`,
    `Atualizado às ${hora}`,
    "",
    "HOJE até agora (anúncios)",
    `Investimento: ${brl(s.gasto)}`,
    `Cliques no link: ${inteiro(s.cliques)} (custo por clique: ${brl(f.custoClique)})`,
    `Visitas à página: ${inteiro(s.visitas)} (custo por visita: ${brl(f.custoVisita)})`,
    `Connect rate (visitas ÷ cliques): ${pct(f.connect)}`,
    `Inscritos por anúncio: ${inteiro(s.inscritos)} (custo por inscrito: ${brl(f.custoInscrito)})`,
    `Conversão da página (inscritos ÷ visitas): ${pct(f.conversaoPagina)}`,
    `Inscrições pelo pixel: ${inteiro(s.leadsPixel)}`,
    "",
  ];
  for (const c of arvore(ads, insc)) {
    l.push(`▸ ${c.nome}`);
    for (const cj of c.filhos)
      for (const ad of cj.filhos) {
        const g = funil(ad);
        l.push(`   • ${ad.nome}`, `     ${brl(ad.gasto)} · ${inteiro(ad.cliques)} cliques · ${inteiro(ad.visitas)} visitas · ${inteiro(ad.inscritos)} ${ad.inscritos === 1 ? "inscrito" : "inscritos"} (${brl(g.custoInscrito)})`);
      }
  }
  l.push("", `Todos os inscritos de hoje: ${cob.total} (${cob.pagos} por anúncio, ${cob.semOrigem} sem origem gravada).`);
  if (!midia.ok) l.push(`⚠ Mídia indisponível: ${midia.motivo}`);
  if (!inscritos.ok) l.push(`⚠ Inscritos indisponíveis: ${inscritos.motivo}`);
  return l.join("\n");
}
