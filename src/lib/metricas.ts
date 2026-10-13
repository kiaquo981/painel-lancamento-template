import { SEM_ORIGEM, type AdDia, type Inscrito } from "./dados";
import { div, type Num } from "./format";
import { CONFIG, diasEntre, METAS } from "./config";

export type Soma = { gasto: number; impressoes: number; cliques: number; visitas: number; videos15s: number; leadsPixel: number; inscritos: number };

export const somaVazia = (): Soma => ({ gasto: 0, impressoes: 0, cliques: 0, visitas: 0, videos15s: 0, leadsPixel: 0, inscritos: 0 });

export function acumular(s: Soma, a: AdDia) {
  s.gasto += a.gasto;
  s.impressoes += a.impressoes;
  s.cliques += a.cliques;
  s.visitas += a.visitas;
  s.videos15s += a.videos15s;
  s.leadsPixel += a.leadsPixel;
}

/** As taxas e custos do funil. Sem denominador = null (a tela mostra "—"). */
export function funil(s: Soma) {
  return {
    custoClique: div(s.gasto, s.cliques),
    custoVisita: div(s.gasto, s.visitas),
    custoVideo: div(s.gasto, s.videos15s),
    custoMil: s.impressoes > 0 ? (s.gasto / s.impressoes) * 1000 : null,
    connect: div(s.visitas, s.cliques),
    conversaoPagina: div(s.inscritos, s.visitas),
    custoInscrito: div(s.gasto, s.inscritos),
    custoLeadPixel: div(s.gasto, s.leadsPixel),
  };
}

export type Temperatura = "quente" | "frio" | "outro";

/** A temperatura vem do nome da campanha, pelas expressões definidas no briefing. */
export function temperatura(campanha: string): Temperatura {
  if (CONFIG.temperatura.quente && new RegExp(CONFIG.temperatura.quente).test(campanha)) return "quente";
  if (CONFIG.temperatura.frio && new RegExp(CONFIG.temperatura.frio).test(campanha)) return "frio";
  return "outro";
}

/** Inscritos de anúncio por nome de anúncio (utm_content). */
export function inscritosPorAnuncio(inscritos: Inscrito[]) {
  const m = new Map<string, number>();
  for (const i of inscritos) if (i.pago && i.utmContent) m.set(i.utmContent, (m.get(i.utmContent) ?? 0) + 1);
  return m;
}

export function total(ads: AdDia[], inscritos: Inscrito[]): Soma {
  const s = somaVazia();
  for (const a of ads) acumular(s, a);
  s.inscritos = inscritos.filter((i) => i.pago).length;
  return s;
}

export type LinhaArvore = Soma & {
  nivel: "campanha" | "conjunto" | "anuncio";
  chave: string;
  nome: string;
  campanha: string;
  temperatura: Temperatura;
  status: string | null;
  verbaDia: number | null;
  filhos: LinhaArvore[];
};

/** Campanha → conjunto → anúncio. O inscrito entra pelo nome do anúncio e sobe para os níveis de cima. */
export function arvore(ads: AdDia[], inscritos: Inscrito[]): LinhaArvore[] {
  const porAd = inscritosPorAnuncio(inscritos);
  const camps = new Map<string, LinhaArvore>();
  const nova = (nivel: LinhaArvore["nivel"], chave: string, nome: string, a: AdDia): LinhaArvore => ({
    ...somaVazia(), nivel, chave, nome, campanha: a.campanha, temperatura: temperatura(a.campanha), status: null, verbaDia: null, filhos: [],
  });
  const ordenados = [...ads].sort((a, b) => a.dia.localeCompare(b.dia));
  for (const a of ordenados) {
    let c = camps.get(a.campaign_id);
    if (!c) camps.set(a.campaign_id, (c = nova("campanha", a.campaign_id, a.campanha, a)));
    let cj = c.filhos.find((f) => f.chave === a.adset_id);
    if (!cj) c.filhos.push((cj = nova("conjunto", a.adset_id, a.conjunto, a)));
    let ad = cj.filhos.find((f) => f.chave === a.ad_id);
    if (!ad) cj.filhos.push((ad = nova("anuncio", a.ad_id, a.anuncio, a)));
    for (const l of [c, cj, ad]) acumular(l, a);
    ad.status = a.status; // fica o do dia mais recente
    cj.verbaDia = a.verbaDia;
  }
  for (const c of camps.values()) {
    for (const cj of c.filhos) {
      for (const ad of cj.filhos) ad.inscritos = porAd.get(ad.nome) ?? 0;
      cj.inscritos = cj.filhos.reduce((t, f) => t + f.inscritos, 0);
      cj.filhos.sort((a, b) => b.gasto - a.gasto);
    }
    c.inscritos = c.filhos.reduce((t, f) => t + f.inscritos, 0);
    c.verbaDia = c.filhos.reduce((t, f) => t + (f.verbaDia ?? 0), 0);
    c.filhos.sort((a, b) => b.gasto - a.gasto);
  }
  return [...camps.values()].sort((a, b) => b.gasto - a.gasto);
}

export type LinhaDia = Soma & { dia: string; inscritosTodos: number; semOrigem: number };

export function porDia(ads: AdDia[], inscritos: Inscrito[], dias: string[]): LinhaDia[] {
  const m = new Map<string, LinhaDia>(dias.map((d) => [d, { ...somaVazia(), dia: d, inscritosTodos: 0, semOrigem: 0 }]));
  for (const a of ads) {
    const l = m.get(a.dia);
    if (l) acumular(l, a);
  }
  for (const i of inscritos) {
    const l = m.get(i.dia);
    if (!l) continue;
    l.inscritosTodos += 1;
    if (i.pago) l.inscritos += 1;
    else if (i.origem === SEM_ORIGEM) l.semOrigem += 1;
  }
  return dias.map((d) => m.get(d)!);
}

/** Contagem por origem, da maior para a menor. */
export function porOrigem(inscritos: Inscrito[]): { origem: string; n: number }[] {
  const m = new Map<string, number>();
  for (const i of inscritos) m.set(i.origem, (m.get(i.origem) ?? 0) + 1);
  return [...m.entries()].map(([origem, n]) => ({ origem, n })).sort((a, b) => b.n - a.n);
}

/** Quanto da origem dos inscritos está identificada, e quanto dos de anúncio casa com um anúncio da conta. */
export function cobertura(ads: AdDia[], inscritos: Inscrito[]) {
  const nomes = new Set(ads.map((a) => a.anuncio));
  const pagos = inscritos.filter((i) => i.pago);
  const casados = pagos.filter((i) => i.utmContent && nomes.has(i.utmContent)).length;
  const semOrigem = inscritos.filter((i) => i.origem === SEM_ORIGEM).length;
  return {
    total: inscritos.length,
    comOrigem: inscritos.length - semOrigem,
    semOrigem,
    pagos: pagos.length,
    pagosComAnuncio: casados,
    pagosSemAnuncio: pagos.length - casados,
  };
}

export type Semaforo = "verde" | "amarelo" | "vermelho" | "neutro";

/** Custo por inscrito contra o alvo e o teto. Abaixo da amostra mínima o painel ainda não dá cor. */
export function semaforoCusto(custo: Num, inscritos: number, teto = METAS.custoInscritoTeto): { cor: Semaforo; leitura: string } {
  if (custo == null) return { cor: "neutro", leitura: "Sem inscritos de anúncio ainda." };
  const cor: Semaforo = custo <= METAS.custoInscritoAlvo ? "verde" : custo <= teto ? "amarelo" : "vermelho";
  if (inscritos < METAS.amostraMinima) return { cor: "neutro", leitura: `Amostra pequena (${inscritos} de ${METAS.amostraMinima} inscritos para decidir).` };
  return {
    cor,
    leitura: cor === "verde" ? "Dentro do alvo." : cor === "amarelo" ? "Acima do alvo, dentro do teto." : "Acima do teto.",
  };
}

/**
 * Meta de inscritos por anúncio: verba ÷ custo-alvo, repartida igual pelos dias da captação.
 * O que faltou num dia se espalha pelos dias que restam (inclusive hoje).
 */
export function metaDiaria(linhas: LinhaDia[], hoje: string) {
  const dias = diasEntre(CONFIG.inicioCaptacao, CONFIG.diaEvento);
  const metaTotal = Math.round(METAS.verbaCaptacao / METAS.custoInscritoAlvo);
  const feito = new Map(linhas.map((l) => [l.dia, l.inscritos]));
  let acumulado = 0;
  const serie = dias.map((d, i) => {
    const restantes = dias.length - i;
    const metaDoDia = Math.max(0, (metaTotal - acumulado) / restantes);
    const realizado = d <= hoje ? (feito.get(d) ?? 0) : null;
    const planejadoAcum = (metaTotal / dias.length) * (i + 1);
    if (realizado != null) acumulado += realizado;
    return { dia: d, metaDoDia, realizado, planejadoAcum, realizadoAcum: d <= hoje ? acumulado : null };
  });
  return { metaTotal, dias, serie, hoje: serie.find((s) => s.dia === hoje) ?? null, ontem: serie.filter((s) => s.dia < hoje).at(-1) ?? null };
}
