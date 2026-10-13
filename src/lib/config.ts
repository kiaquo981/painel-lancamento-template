/**
 * Tudo que muda de um lançamento para outro vive em `lancamento.config.json`, na raiz.
 * O arquivo é preenchido a partir do briefing (docs/BRIEFING.md). Nenhuma tela traz dado fixo de cliente.
 */
import bruto from "../../lancamento.config.json";

export type Fase = { key: string; nome: string; de: string; ate: string | null; aba: string };
export type RegraOrigem = { nome: string; campo: "utm_source" | "utm_medium" | "utm_campaign"; igual: string };
type Colunas = Record<string, string | null>;

export type Config = {
  slug: string;
  marca: string;
  nome: string;
  destaque: string;
  subtitulo: string;
  fuso: string;
  marcaCampanha: string;
  inicioCaptacao: string;
  diaEvento: string;
  fases: Fase[];
  metas: {
    custoInscritoAlvo: number;
    custoInscritoTeto: number;
    verbaCaptacao: number;
    comparecimento: number;
    conversaoMin: number;
    conversaoMax: number;
    ticket: number;
    amostraMinima: number;
  };
  origens: { pago: string[]; teste: string[]; regras: RegraOrigem[] };
  temperatura: { quente: string; frio: string };
  tema: { cores: Record<string, string>; fontes: { titulo: string; texto: string } };
  banco: { schema: string };
  meta: { contaAnuncios: string };
  inscritos: {
    fonte: "sheets" | "supabase" | "webhook";
    sheets: { planilhaId: string; aba: string; colunas: Colunas };
    supabase: { tabela: string; colunas: Colunas };
  };
};

export const CONFIG = bruto as Config;
export const SLUG = CONFIG.slug;
export const METAS = CONFIG.metas;
export const FASES = CONFIG.fases;

/** Deslocamento do fuso em horas ("-03:00" → -3). */
const HORAS_FUSO = Number(CONFIG.fuso.slice(0, 3)) + (Number(CONFIG.fuso.slice(4, 6)) / 60) * (CONFIG.fuso.startsWith("-") ? -1 : 1);
const noFuso = (d: Date) => new Date(d.getTime() + HORAS_FUSO * 3600_000);

/** Dia de hoje no fuso do lançamento (AAAA-MM-DD). */
export function hojeLocal(agora = new Date()) {
  return noFuso(agora).toISOString().slice(0, 10);
}
export function horaLocal(agora = new Date()) {
  return noFuso(agora).getUTCHours();
}
/** Quebra um instante em dia e hora no fuso do lançamento. */
export function diaHora(iso: string) {
  const d = noFuso(new Date(iso));
  return { dia: d.toISOString().slice(0, 10), hora: d.getUTCHours() };
}

export type AbaId = "geral" | "captacao" | "anuncios" | "origens" | "grupo" | "evento" | "vendas" | "plano" | "fechamento";

export const ABAS: { id: AbaId; rotulo: string; descricao: string }[] = [
  { id: "geral", rotulo: "Visão geral", descricao: "Funil do clique à venda, contra as metas." },
  { id: "captacao", rotulo: "Captação", descricao: "Meta do dia, planejado e realizado, dia a dia e hora a hora." },
  { id: "anuncios", rotulo: "Anúncios", descricao: "Campanha, conjunto e anúncio, com o custo por inscrito real." },
  { id: "origens", rotulo: "Origens", descricao: "De onde vieram os inscritos e quanto da origem está identificada." },
  { id: "grupo", rotulo: "Grupo", descricao: "Quem se inscreveu e entrou no grupo." },
  { id: "evento", rotulo: "Evento", descricao: "Presença no evento." },
  { id: "vendas", rotulo: "Vendas", descricao: "Vendas, faturamento e custo por venda." },
  { id: "plano", rotulo: "Plano", descricao: "Metas, verba, fases e cenários do lançamento." },
  { id: "fechamento", rotulo: "Fechamento", descricao: "Resultado final do ciclo." },
];

export function caminhoAba(id: AbaId | string) {
  return id === "geral" ? `/launches/${SLUG}` : `/launches/${SLUG}/${id}`;
}

/** A fase em andamento é derivada das datas, nunca digitada. */
export function fasesAtuais(hoje = hojeLocal()): string[] {
  return FASES.filter((f) => hoje >= f.de && (f.ate == null || hoje <= f.ate)).map((f) => f.key);
}

export function diasEntre(de: string, ate: string) {
  const out: string[] = [];
  for (let d = new Date(`${de}T12:00:00Z`); d.toISOString().slice(0, 10) <= ate; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}
