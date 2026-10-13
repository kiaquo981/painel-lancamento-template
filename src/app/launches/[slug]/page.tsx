import { AvisosDeFonte } from "@/components/fontes";
import { Aviso, Caixa, Cartao, Grade, Painel } from "@/components/ui";
import { carregarTudo } from "@/lib/dados";
import { brl, diaCurto, inteiro, pct } from "@/lib/format";
import { CONFIG, hojeLocal, METAS } from "@/lib/config";
import { cobertura, funil, semaforoCusto, total } from "@/lib/metricas";

const SEM_MIDIA = "A mídia da Meta não respondeu.";
const SEM_INSCRITOS = "O banco de inscritos não respondeu.";

export default async function VisaoGeral() {
  const { midia, inscritos, vendas } = await carregarTudo();
  const hoje = hojeLocal();
  const adsHoje = midia.dados.filter((a) => a.dia === hoje);
  const inscHoje = inscritos.dados.filter((i) => i.dia === hoje);
  const sHoje = total(adsHoje, inscHoje);
  const sTudo = total(midia.dados, inscritos.dados);
  const fHoje = funil(sHoje);
  const fTudo = funil(sTudo);
  const cob = cobertura(midia.dados, inscritos.dados);
  const teto = METAS.custoInscritoTeto;
  const semaforo = semaforoCusto(fTudo.custoInscrito, sTudo.inscritos);
  const nVendas = vendas.dados.length;
  const metaInscritos = Math.round(METAS.verbaCaptacao / METAS.custoInscritoAlvo);
  const verbaRestante = Math.max(0, METAS.verbaCaptacao - sTudo.gasto);
  const m = (ok: boolean, motivo: string) => (ok ? undefined : motivo);
  const v = <T,>(ok: boolean, valor: T) => (ok ? valor : null);

  // Projeção: separada do realizado. Só existe quando já há custo por inscrito medido.
  const projInscritos = fTudo.custoInscrito ? sTudo.inscritos + verbaRestante / fTudo.custoInscrito : null;
  const projPresentes = projInscritos != null ? projInscritos * METAS.comparecimento : null;

  const etapas: { nome: string; valor: number | null; custo: number | null; motivo?: string }[] = [
    { nome: "Exibições do anúncio", valor: v(midia.ok, sTudo.impressoes), custo: null },
    { nome: "Cliques no link", valor: v(midia.ok, sTudo.cliques), custo: fTudo.custoClique },
    { nome: "Visitas à página", valor: v(midia.ok, sTudo.visitas), custo: fTudo.custoVisita },
    { nome: "Inscritos por anúncio", valor: v(inscritos.ok, sTudo.inscritos), custo: fTudo.custoInscrito },
    { nome: "Entraram no grupo", valor: null, custo: null, motivo: "Sem fonte: o grupo ainda não está ligado ao painel." },
    { nome: "Presentes no evento", valor: null, custo: null, motivo: "Sem fonte: a presença no evento ainda não tem coleta." },
    { nome: "Vendas", valor: vendas.ok && nVendas > 0 ? nVendas : null, custo: nVendas > 0 ? sTudo.gasto / nVendas : null, motivo: vendas.ok ? "Nenhuma venda recebida ainda pelo aviso de venda da plataforma." : "As vendas não responderam." },
  ];
  const maior = Math.max(1, ...etapas.map((e) => e.valor ?? 0));

  return (
    <>
      <AvisosDeFonte fontes={[{ nome: "Mídia da Meta", fonte: midia }, { nome: "Inscritos da página", fonte: inscritos }, { nome: "Vendas", fonte: vendas }]} />

      <Painel titulo="Hoje até agora" descricao="Anúncios da captação cruzados com os inscritos da página.">
        <Grade colunas={6}>
          <Cartao rotulo="Investimento" valor={brl(v(midia.ok, sHoje.gasto))} motivo={m(midia.ok, SEM_MIDIA)} />
          <Cartao rotulo="Inscritos por anúncio" valor={inteiro(v(inscritos.ok, sHoje.inscritos))} apoio={`${inscHoje.length} inscritos somando todas as origens`} motivo={m(inscritos.ok, SEM_INSCRITOS)} />
          <Cartao rotulo="Custo por inscrito" valor={brl(fHoje.custoInscrito)} formula="investimento ÷ inscritos por anúncio" motivo="Ainda sem inscrito de anúncio hoje." />
          <Cartao rotulo="Visitas à página" valor={inteiro(v(midia.ok, sHoje.visitas))} apoio={`custo por visita: ${brl(fHoje.custoVisita)}`} motivo={m(midia.ok, SEM_MIDIA)} />
          <Cartao rotulo="Conversão da página" valor={pct(fHoje.conversaoPagina)} formula="inscritos por anúncio ÷ visitas" motivo="Ainda sem visita registrada hoje." />
          <Cartao rotulo="Connect rate" valor={pct(fHoje.connect)} formula="visitas ÷ cliques no link" apoio={`${inteiro(sHoje.cliques)} cliques · ${brl(fHoje.custoClique)} por clique`} motivo="Ainda sem clique hoje." />
        </Grade>
      </Painel>

      <Painel titulo="Captação até aqui" descricao={`Desde ${diaCurto(CONFIG.inicioCaptacao)}, contra a verba e as metas. Alvo de ${brl(METAS.custoInscritoAlvo)} e teto de ${brl(teto)} por inscrito.`}>
        <Grade colunas={4}>
          <Cartao rotulo="Investimento" valor={brl(v(midia.ok, sTudo.gasto))} apoio={`${pct(sTudo.gasto / METAS.verbaCaptacao)} da verba de ${brl(METAS.verbaCaptacao, 0)} · restam ${brl(verbaRestante, 0)}`} motivo={m(midia.ok, SEM_MIDIA)} />
          <Cartao rotulo="Inscritos por anúncio" valor={inteiro(v(inscritos.ok, sTudo.inscritos))} apoio={`${pct(sTudo.inscritos / metaInscritos)} da meta de ${inteiro(metaInscritos)}`} formula="meta = verba ÷ custo-alvo por inscrito" motivo={m(inscritos.ok, SEM_INSCRITOS)} />
          <Cartao rotulo="Custo por inscrito" valor={brl(fTudo.custoInscrito)} cor={semaforo.cor} apoio={semaforo.leitura} formula="investimento ÷ inscritos por anúncio" motivo="Ainda sem inscrito de anúncio." />
          <Cartao rotulo="Todos os inscritos" valor={inteiro(v(inscritos.ok, cob.total))} apoio={`${cob.pagos} por anúncio · ${cob.total - cob.pagos - cob.semOrigem} de outras origens · ${cob.semOrigem} sem origem`} motivo={m(inscritos.ok, SEM_INSCRITOS)} />
        </Grade>
      </Painel>

      <Painel titulo="Funil do lançamento" descricao="Do anúncio à venda. As etapas sem fonte ficam marcadas até o dado existir; nenhuma é estimada.">
        <Caixa>
          <div className="space-y-2.5">
            {etapas.map((e, i) => {
              const anterior = i > 0 ? etapas[i - 1].valor : null;
              const passagem = e.valor != null && anterior ? e.valor / anterior : null;
              return (
                <div key={e.nome} className="grid grid-cols-[11rem_1fr_auto] items-center gap-3" title={e.motivo}>
                  <span className="text-[13px] text-texto">{e.nome}</span>
                  <div className="h-7 overflow-hidden rounded-md bg-zinc-100">
                    {e.valor != null ? (
                      <div className="h-full rounded-md bg-destaque" style={{ width: `${Math.max(1.5, (e.valor / maior) * 100)}%` }} />
                    ) : (
                      <div className="flex h-full items-center px-2 text-[11px] text-texto-suave">{e.motivo}</div>
                    )}
                  </div>
                  <span className="w-56 text-right text-[13px] tabular-nums text-texto">
                    <strong>{inteiro(e.valor)}</strong>
                    {i > 0 && passagem != null ? <span className="text-texto-suave"> · {pct(passagem)} da etapa anterior</span> : null}
                    {e.custo != null ? <span className="block text-[11px] text-texto-suave">{brl(e.custo)} cada</span> : null}
                  </span>
                </div>
              );
            })}
          </div>
        </Caixa>
      </Painel>

      <Painel titulo="Projeção" descricao="Conta sobre o que já foi medido, separada do realizado. Muda a cada inscrito novo.">
        <Grade colunas={3}>
          <Cartao rotulo={`Inscritos por anúncio até ${diaCurto(CONFIG.diaEvento)}`} valor={inteiro(projInscritos)} formula="inscritos atuais + verba restante ÷ custo por inscrito atual" motivo="Precisa de pelo menos um inscrito de anúncio para projetar." />
          <Cartao rotulo="Presentes no evento" valor={inteiro(projPresentes)} formula={`inscritos projetados × ${pct(METAS.comparecimento, 0)} de comparecimento (premissa do plano)`} motivo="Depende da projeção de inscritos." />
          <Cartao
            rotulo="Vendas"
            valor={projPresentes != null ? `${inteiro(projPresentes * METAS.conversaoMin)} a ${inteiro(projPresentes * METAS.conversaoMax)}` : "—"}
            formula={`presentes × ${pct(METAS.conversaoMin, 0)} a ${pct(METAS.conversaoMax, 0)} de conversão do evento (premissa do plano)`}
            motivo="Depende da projeção de presentes."
          />
        </Grade>
      </Painel>

      <Painel titulo="Qualidade do dado" descricao="O que pode distorcer os números acima.">
        <div className="space-y-2">
          {cob.semOrigem > 0 ? (
            <Aviso>
              <strong>{cob.semOrigem} de {cob.total} inscritos chegaram sem origem gravada.</strong> Podem ser de anúncio e não entram no custo por inscrito, que por isso pode estar mais alto do que o real.
            </Aviso>
          ) : null}
          {cob.pagosSemAnuncio > 0 ? (
            <Aviso>
              <strong>{cob.pagosSemAnuncio} inscritos de anúncio vieram com nome de anúncio que não existe na conta.</strong> Contam no total, mas não em nenhum anúncio.
            </Aviso>
          ) : null}
          <Aviso tom="info">
            O inscrito é ligado ao anúncio pelo nome do anúncio gravado na inscrição (utm_content). A referência do custo por inscrito é a base de inscritos; as inscrições do pixel da Meta aparecem só para conferência: {inteiro(sTudo.leadsPixel)} pelo pixel contra {inteiro(sTudo.inscritos)} na base.
          </Aviso>
        </div>
      </Painel>
    </>
  );
}
