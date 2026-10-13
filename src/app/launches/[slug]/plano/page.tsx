import { Painel, Tabela, td, th } from "@/components/ui";
import { FASES, fasesAtuais, METAS } from "@/lib/config";
import { brl, diaLongo, inteiro, pct } from "@/lib/format";

export default function Plano() {
  const atuais = fasesAtuais();
  const cenarios = [
    { nome: "No custo-alvo", custo: METAS.custoInscritoAlvo },
    { nome: "No teto", custo: METAS.custoInscritoTeto },
  ].map((c) => {
    const inscritos = METAS.verbaCaptacao / c.custo;
    const presentes = inscritos * METAS.comparecimento;
    return { ...c, inscritos, presentes, vMin: presentes * METAS.conversaoMin, vMax: presentes * METAS.conversaoMax };
  });
  return (
    <>
      <Painel titulo="Fases" descricao="A fase em andamento vem das datas.">
        <Tabela>
          <thead>
            <tr className="border-b border-zinc-200">{["Fase", "Início", "Fim", "Situação"].map((c) => <th key={c} className={th}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {FASES.map((f) => (
              <tr key={f.key} className="border-b border-zinc-100 last:border-0">
                <td className={td}>{f.nome}</td>
                <td className={td}>{diaLongo(f.de)}</td>
                <td className={td}>{f.ate ? diaLongo(f.ate) : "em aberto"}</td>
                <td className={td}>{atuais.includes(f.key) ? "Em andamento" : ""}</td>
              </tr>
            ))}
          </tbody>
        </Tabela>
      </Painel>

      <Painel titulo="Metas e limites" descricao="Definidos no briefing. É o que o painel usa para colorir os números.">
        <Tabela>
          <thead>
            <tr className="border-b border-zinc-200">{["Item", "Valor"].map((c) => <th key={c} className={th}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {[
              ["Verba da captação", brl(METAS.verbaCaptacao, 0)],
              ["Custo-alvo por inscrito", brl(METAS.custoInscritoAlvo)],
              ["Teto do custo por inscrito", brl(METAS.custoInscritoTeto)],
              ["Inscritos para o painel dar cor a um anúncio", inteiro(METAS.amostraMinima)],
              ["Comparecimento no evento (premissa)", pct(METAS.comparecimento, 0)],
              ["Conversão do evento (premissa)", `${pct(METAS.conversaoMin, 0)} a ${pct(METAS.conversaoMax, 0)}`],
              ["Preço da oferta", brl(METAS.ticket, 0)],
            ].map(([a, b]) => (
              <tr key={a} className="border-b border-zinc-100 last:border-0">
                <td className={td}>{a}</td>
                <td className={td}><strong>{b}</strong></td>
              </tr>
            ))}
          </tbody>
        </Tabela>
      </Painel>

      <Painel titulo="O que a verba compra" descricao="Conta de planejamento com as premissas acima. Não é resultado.">
        <Tabela>
          <thead>
            <tr className="border-b border-zinc-200">{["Cenário", "Custo por inscrito", "Inscritos", "Presentes", "Vendas", "Faturamento"].map((c) => <th key={c} className={th}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {cenarios.map((c) => (
              <tr key={c.nome} className="border-b border-zinc-100 last:border-0">
                <td className={td}>{c.nome}</td>
                <td className={td}>{brl(c.custo)}</td>
                <td className={td}>{inteiro(c.inscritos)}</td>
                <td className={td}>{inteiro(c.presentes)}</td>
                <td className={td}>{inteiro(c.vMin)} a {inteiro(c.vMax)}</td>
                <td className={td}>{brl(c.vMin * METAS.ticket, 0)} a {brl(c.vMax * METAS.ticket, 0)}</td>
              </tr>
            ))}
          </tbody>
        </Tabela>
      </Painel>
    </>
  );
}
