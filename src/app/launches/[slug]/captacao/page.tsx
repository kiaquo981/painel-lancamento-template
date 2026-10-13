import { AvisosDeFonte } from "@/components/fontes";
import { GraficoDias, GraficoHoras, GraficoMeta } from "@/components/graficos";
import { Caixa, Cartao, Grade, Painel, Tabela, td, th } from "@/components/ui";
import { carregarHoras, carregarTudo } from "@/lib/dados";
import { brl, diaCurto, inteiro, pct } from "@/lib/format";
import { CONFIG, diasEntre, hojeLocal, horaLocal, METAS } from "@/lib/config";
import { funil, metaDiaria, porDia, type Semaforo } from "@/lib/metricas";

function corDaMeta(realizado: number, meta: number): Semaforo {
  if (meta <= 0) return "neutro";
  const r = realizado / meta;
  return r >= 1 ? "verde" : r >= 0.85 ? "amarelo" : "vermelho";
}

export default async function Captacao() {
  const hoje = hojeLocal();
  const [{ midia, inscritos }, horas] = await Promise.all([carregarTudo(), carregarHoras(hoje)]);
  const fim = hoje < CONFIG.diaEvento ? hoje : CONFIG.diaEvento;
  const dias = hoje >= CONFIG.inicioCaptacao ? diasEntre(CONFIG.inicioCaptacao, fim) : [];
  const linhas = porDia(midia.dados, inscritos.dados, dias);
  const meta = metaDiaria(linhas, hoje);
  const totalInscritos = linhas.reduce((t, l) => t + l.inscritosTodos, 0);

  const idsDoCiclo = new Set(midia.dados.map((a) => a.ad_id));
  const ate = horaLocal();
  const porHora = Array.from({ length: ate + 1 }, (_, h) => ({ hora: `${String(h).padStart(2, "0")}h`, gasto: 0, cliques: 0, inscritos: 0 }));
  for (const h of horas.dados) if (idsDoCiclo.has(h.ad_id) && porHora[h.hora]) { porHora[h.hora].gasto += h.gasto; porHora[h.hora].cliques += h.cliques; }
  for (const i of inscritos.dados) if (i.dia === hoje && porHora[i.hora]) porHora[i.hora].inscritos += 1;
  for (const p of porHora) p.gasto = Math.round(p.gasto * 100) / 100;

  const h = meta.hoje;
  const o = meta.ontem;

  return (
    <>
      <AvisosDeFonte fontes={[{ nome: "Mídia da Meta", fonte: midia }, { nome: "Inscritos da página", fonte: inscritos }, { nome: "Hora a hora da Meta", fonte: horas }]} />

      <Painel titulo="Meta do dia" descricao={`Meta de ${inteiro(meta.metaTotal)} inscritos por anúncio até ${diaCurto(CONFIG.diaEvento)} (verba de ${brl(METAS.verbaCaptacao, 0)} ÷ custo-alvo de ${brl(METAS.custoInscritoAlvo)}). O que falta num dia se espalha pelos dias seguintes.`}>
        <Grade colunas={4}>
          <Cartao rotulo="Meta de hoje" valor={h ? inteiro(Math.ceil(h.metaDoDia)) : "—"} apoio="inscritos por anúncio" motivo="Hoje está fora da janela da captação." />
          <Cartao rotulo="Feito hoje" valor={h ? inteiro(h.realizado) : "—"} apoio={h ? `${pct((h.realizado ?? 0) / Math.max(1, h.metaDoDia), 0)} da meta do dia, com o dia em andamento` : undefined} motivo="Hoje está fora da janela da captação." />
          <Cartao rotulo="Ontem" valor={o ? `${inteiro(o.realizado)} de ${inteiro(Math.ceil(o.metaDoDia))}` : "—"} cor={o ? corDaMeta(o.realizado ?? 0, o.metaDoDia) : "neutro"} apoio={o ? `${pct((o.realizado ?? 0) / Math.max(1, o.metaDoDia), 0)} da meta de ontem` : undefined} motivo="Ainda não existe um dia anterior dentro da captação." />
          <Cartao rotulo="Acumulado" valor={h ? `${inteiro(h.realizadoAcum)} de ${inteiro(meta.metaTotal)}` : "—"} apoio={h ? `planejado até hoje: ${inteiro(h.planejadoAcum)}` : undefined} motivo="Hoje está fora da janela da captação." />
        </Grade>
      </Painel>

      <Painel titulo="Planejado e realizado" descricao="Inscritos por anúncio acumulados, dia a dia.">
        <Caixa>
          <GraficoMeta hoje={diaCurto(hoje)} dados={meta.serie.map((s) => ({ rotulo: diaCurto(s.dia), planejado: Math.round(s.planejadoAcum), realizado: s.realizadoAcum }))} />
        </Caixa>
      </Painel>

      <Painel titulo="Hoje, hora a hora" descricao="Investimento e cliques da última coleta de mídia; inscritos conforme chegam.">
        <Caixa>
          <GraficoHoras dados={porHora} />
        </Caixa>
      </Painel>

      <Painel titulo="Dia a dia" descricao="Investimento e inscritos por dia.">
        <Caixa>
          <GraficoDias dados={linhas.map((l) => ({ rotulo: diaCurto(l.dia), gasto: Math.round(l.gasto * 100) / 100, inscritos: l.inscritos, outros: l.inscritosTodos - l.inscritos, custo: funil(l).custoInscrito }))} />
        </Caixa>
      </Painel>

      <Painel titulo="Conciliação diária" descricao="Uma linha por dia: o que a mídia entregou e o que a página registrou.">
        <Tabela>
          <thead>
            <tr className="border-b border-zinc-200">
              {["Dia", "Investimento", "Cliques", "Custo por clique", "Visitas", "Custo por visita", "Connect rate", "Inscritos por anúncio", "Custo por inscrito", "Conversão da página", "Inscrições no pixel", "Sem origem", "Outras origens", "Total do dia", "% do total"].map((c) => (
                <th key={c} className={th}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...linhas].reverse().map((l) => {
              const f = funil(l);
              return (
                <tr key={l.dia} className="border-b border-zinc-100 last:border-0">
                  <td className={td}>{diaCurto(l.dia)}{l.dia === hoje ? " (hoje)" : ""}</td>
                  <td className={td}>{brl(l.gasto)}</td>
                  <td className={td}>{inteiro(l.cliques)}</td>
                  <td className={td}>{brl(f.custoClique)}</td>
                  <td className={td}>{inteiro(l.visitas)}</td>
                  <td className={td}>{brl(f.custoVisita)}</td>
                  <td className={td}>{pct(f.connect)}</td>
                  <td className={td}><strong>{inteiro(l.inscritos)}</strong></td>
                  <td className={td}>{brl(f.custoInscrito)}</td>
                  <td className={td}>{pct(f.conversaoPagina)}</td>
                  <td className={td}>{inteiro(l.leadsPixel)}</td>
                  <td className={td}>{inteiro(l.semOrigem)}</td>
                  <td className={td}>{inteiro(l.inscritosTodos - l.inscritos - l.semOrigem)}</td>
                  <td className={td}>{inteiro(l.inscritosTodos)}</td>
                  <td className={td}>{pct(totalInscritos ? l.inscritosTodos / totalInscritos : null, 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </Tabela>
      </Painel>
    </>
  );
}
