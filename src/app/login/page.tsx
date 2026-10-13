import { CONFIG } from "@/lib/config";

export default async function Login({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form method="post" action="/api/entrar" className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-cartao p-8 shadow-sm">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-secundaria">{CONFIG.marca}</p>
        <h1 className="mt-2 font-serif text-3xl leading-tight text-texto">{CONFIG.nome}</h1>
        <p className="mt-1 text-sm text-texto-suave">Painel do lançamento.</p>
        <label className="mt-6 block text-xs font-medium text-texto-suave" htmlFor="senha">
          Senha do painel
        </label>
        <input id="senha" name="senha" type="password" required autoFocus className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-destaque-forte" />
        {erro ? <p className="mt-2 text-xs text-ruim">Senha incorreta.</p> : null}
        <button type="submit" className="mt-5 w-full rounded-lg bg-texto px-4 py-2.5 text-sm font-medium text-fundo hover:opacity-90">
          Entrar
        </button>
      </form>
    </main>
  );
}
