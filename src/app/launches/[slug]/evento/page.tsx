import { SemFonte } from "@/components/ui";

export default function Evento() {
  return (
    <SemFonte
      titulo="Presença no evento ainda sem fonte"
      motivo="O painel ainda não tem de onde ler quem entrou no evento, então presença e comparecimento não aparecem; nenhuma taxa é presumida."
      falta={["Relatório de participantes da ferramenta de transmissão, depois do evento (ou a integração dela).", "E-mail do participante, para casar com o inscrito pelo e-mail embaralhado.", "Criar a tabela e o worker dessa fonte neste projeto."]}
    />
  );
}
