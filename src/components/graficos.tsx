"use client";

import { Bar, CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { CONFIG } from "@/lib/config";

const c = CONFIG.tema.cores;
const TINTA = c.texto;
const SUAVE = c.textoSuave;
const GRADE = c.borda;
const PESSEGO = c.destaque;
const PESSEGO_ESCURO = c.destaqueForte;
const OLIVA = c.secundaria;
const SALVIA = c.secundaria;
const AZUL = c.textoSuave;

const eixo = { fontSize: 11, fill: SUAVE };
const dica = { contentStyle: { background: c.cartao, border: `1px solid ${GRADE}`, borderRadius: 8, fontSize: 12, color: TINTA } };
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export type PontoDia = { rotulo: string; gasto: number; inscritos: number; outros: number; custo: number | null };

/** Investimento (barra) e inscritos (linhas) por dia. */
export function GraficoDias({ dados }: { dados: PontoDia[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRADE} vertical={false} />
        <XAxis dataKey="rotulo" tick={eixo} tickLine={false} axisLine={{ stroke: GRADE }} />
        <YAxis yAxisId="r" tick={eixo} tickLine={false} axisLine={false} tickFormatter={(v) => `R$ ${v}`} width={64} />
        <YAxis yAxisId="n" orientation="right" tick={eixo} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
        <Tooltip {...dica} formatter={(v, nome) => (nome === "Investimento" ? brl(Number(v)) : String(v))} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar isAnimationActive={false} maxBarSize={48} yAxisId="r" dataKey="gasto" name="Investimento" fill={PESSEGO} radius={[4, 4, 0, 0]} />
        <Line isAnimationActive={false} yAxisId="n" dataKey="inscritos" name="Inscritos por anúncio" stroke={PESSEGO_ESCURO} strokeWidth={2} dot={{ r: 3 }} />
        <Line isAnimationActive={false} yAxisId="n" dataKey="outros" name="Inscritos de outras origens" stroke={OLIVA} strokeWidth={2} strokeDasharray="4 3" dot={{ r: 2 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export type PontoMeta = { rotulo: string; planejado: number; realizado: number | null };

/** Inscritos por anúncio acumulados: planejado × realizado. */
export function GraficoMeta({ dados, hoje }: { dados: PontoMeta[]; hoje: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRADE} vertical={false} />
        <XAxis dataKey="rotulo" tick={eixo} tickLine={false} axisLine={{ stroke: GRADE }} />
        <YAxis tick={eixo} tickLine={false} axisLine={false} allowDecimals={false} width={40} />
        <Tooltip {...dica} formatter={(v) => Math.round(Number(v)).toLocaleString("pt-BR")} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <ReferenceLine x={hoje} stroke={OLIVA} strokeDasharray="3 3" label={{ value: "hoje", fontSize: 10, fill: SUAVE, position: "insideTopRight" }} />
        <Line isAnimationActive={false} dataKey="planejado" name="Planejado" stroke={SALVIA} strokeWidth={2} dot={false} />
        <Line isAnimationActive={false} dataKey="realizado" name="Realizado" stroke={PESSEGO_ESCURO} strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export type PontoHora = { hora: string; gasto: number; cliques: number; inscritos: number };

/** O dia de hoje, hora a hora. */
export function GraficoHoras({ dados }: { dados: PontoHora[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRADE} vertical={false} />
        <XAxis dataKey="hora" tick={eixo} tickLine={false} axisLine={{ stroke: GRADE }} />
        <YAxis yAxisId="r" tick={eixo} tickLine={false} axisLine={false} tickFormatter={(v) => `R$ ${v}`} width={56} />
        <YAxis yAxisId="n" orientation="right" tick={eixo} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
        <Tooltip {...dica} formatter={(v, nome) => (nome === "Investimento" ? brl(Number(v)) : String(v))} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar isAnimationActive={false} maxBarSize={48} yAxisId="r" dataKey="gasto" name="Investimento" fill={PESSEGO} radius={[3, 3, 0, 0]} />
        <Line isAnimationActive={false} yAxisId="n" dataKey="cliques" name="Cliques (todos os tipos)" stroke={AZUL} strokeWidth={2} dot={false} />
        <Line isAnimationActive={false} yAxisId="n" dataKey="inscritos" name="Inscritos (todas as origens)" stroke={PESSEGO_ESCURO} strokeWidth={2} dot={{ r: 3 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
