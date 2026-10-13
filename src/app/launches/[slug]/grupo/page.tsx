import { SemFonte } from "@/components/ui";

export default function Grupo() {
  return (
    <SemFonte
      titulo="Grupo ainda sem fonte"
      motivo="O painel não recebe quem entrou no grupo. Sem isso, não dá para saber quantos inscritos chegaram até os lembretes do evento."
      falta={["Definir a ferramenta que administra o grupo (ou a exportação dos participantes).", "Receber as entradas com o telefone, para casar com o inscrito pelo telefone embaralhado.", "Criar a tabela e o worker dessa fonte neste projeto."]}
    />
  );
}
