import { AvisosDeFonte } from "@/components/fontes";
import { Cartao, Grade, Painel, SemFonte, Tabela, td, th } from "@/components/ui";
import { carregarTudo } from "@/lib/dados";
import { brl, diaCurto, div, inteiro, pct } from "@/lib/format";
import { total } from "@/lib/metricas";

export default async function Vendas() {
  const { midia, inscritos, vendas } = await carregarTudo();
  const v = vendas.dados;
  if (vendas.ok && v.length === 0) {
    return (
      <SemFonte
        titulo="Nenhuma venda recebida ainda"
        motivo="O painel recebe as vendas pelo aviso de venda (webhook) da plataforma. Até a primeira chegar, faturamento, custo por venda e retorno não aparecem."
        falta={[
          "Apontar o aviso de venda da plataforma para /api/ingest/venda, com o segredo de ingestão.",
          "Conferir, com um aviso real, o adaptador da plataforma em src/lib/coleta/venda.ts.",
          "Fazer uma compra de teste e ver a venda aparecer aqui.",
        ]}
      />
    );
  }
  const gasto = total(midia.dados, inscritos.dados).gasto;
  const faturamento = v.reduce((t, x) => t + x.valor, 0);
  const pagas = v.filter((x) => x.pago);
  const dias = new Map<string, { n: number; valor: number }>();
  for (const x of v) {
    const d = dias.get(x.dia) ?? { n: 0, valor: 0 };
    d.n += 1;
    d.valor += x.valor;
    dias.set(x.dia, d);
  }
  return (
    <>
      <AvisosDeFonte fontes={[{ nome: "Vendas", fonte: vendas }, { nome: "Mídia da Meta", fonte: midia }]} />
      <Painel titulo="Vendas" descricao="Vendas aprovadas recebidas da plataforma. A referência é a plataforma, não o pixel.">
        <Grade colunas={4}>
          <Cartao rotulo="Vendas aprovadas" valor={inteiro(vendas.ok ? v.length : null)} apoio={`${pagas.length} com origem de anúncio`} motivo="As vendas não responderam." />
          <Cartao rotulo="Faturamento" valor={brl(vendas.ok ? faturamento : null)} apoio={`ticket médio: ${brl(div(faturamento, v.length))}`} motivo="As vendas não responderam." />
          <Cartao rotulo="Custo por venda" valor={brl(div(gasto, v.length))} formula="investimento da captação ÷ vendas aprovadas" motivo="Sem venda para dividir." />
          <Cartao rotulo="Retorno sobre a mídia" valor={gasto > 0 ? `${(faturamento / gasto).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}x` : "—"} formula="faturamento ÷ investimento da captação" motivo="Sem investimento registrado." />
        </Grade>
      </Painel>
      <Painel titulo="Dia a dia">
        <Tabela>
          <thead>
            <tr className="border-b border-zinc-200">{["Dia", "Vendas", "Faturamento", "% das vendas"].map((c) => <th key={c} className={th}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {[...dias.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([d, x]) => (
              <tr key={d} className="border-b border-zinc-100 last:border-0">
                <td className={td}>{diaCurto(d)}</td>
                <td className={td}>{inteiro(x.n)}</td>
                <td className={td}>{brl(x.valor)}</td>
                <td className={td}>{pct(x.n / v.length, 0)}</td>
              </tr>
            ))}
          </tbody>
        </Tabela>
      </Painel>
    </>
  );
}
