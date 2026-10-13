import { SemFonte } from "@/components/ui";

export default function Fechamento() {
  return (
    <SemFonte
      titulo="Fechamento disponível depois do carrinho"
      motivo="O resultado final (inscritos, presença, vendas, faturamento, custo por venda e retorno) é montado quando o carrinho fechar."
      falta={["Captação encerrada.", "Presença do evento e vendas ligadas ao painel."]}
    />
  );
}
