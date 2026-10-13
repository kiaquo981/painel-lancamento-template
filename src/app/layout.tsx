import type { Metadata } from "next";
import { CONFIG } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${CONFIG.nome} · painel do lançamento`,
  robots: { index: false, follow: false },
};

const { cores, fontes } = CONFIG.tema;
const familia = (f: string) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500`;
const variaveis = Object.fromEntries([...Object.entries(cores).map(([k, v]) => [`--c-${k}`, v]), ["--f-titulo", `"${fontes.titulo}"`], ["--f-texto", `"${fontes.texto}"`]]);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" style={variaveis as React.CSSProperties}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${familia(fontes.titulo)}&${familia(fontes.texto)}&display=swap`} />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
