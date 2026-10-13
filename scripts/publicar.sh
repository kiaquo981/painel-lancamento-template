#!/usr/bin/env bash
# Publica na Vercel: grava cada variável de .env.local em produção e faz o deploy.
# Uso: bash scripts/publicar.sh   (VERCEL_SCOPE=time para escolher o time)
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env.local ] || { echo "falta .env.local: rode npm run acessos"; exit 1; }
ESCOPO=${VERCEL_SCOPE:+--scope $VERCEL_SCOPE}
NOME="painel-$(node -e 'console.log(require("./lancamento.config.json").slug)')"
# shellcheck disable=SC2086
[ -d .vercel ] || vercel link --yes --project "$NOME" $ESCOPO
while IFS= read -r linha; do
  [[ "$linha" =~ ^[A-Z0-9_]+= ]] || continue
  chave="${linha%%=*}"; valor="${linha#*=}"
  [[ "$chave" == VERCEL_* || -z "$valor" ]] && continue
  # shellcheck disable=SC2086
  vercel env rm "$chave" production --yes $ESCOPO >/dev/null 2>&1 || true
  # shellcheck disable=SC2086
  printf '%s' "$valor" | vercel env add "$chave" production $ESCOPO >/dev/null
  echo "variável gravada: $chave"
done < .env.local
# shellcheck disable=SC2086
vercel deploy --prod --yes $ESCOPO
echo
echo "Agendamento: o vercel.json roda os workers a cada 5 e 15 minutos (plano Pro)."
echo "No plano Hobby, use .github/workflows/coleta.yml (variável PAINEL_URL e segredo CRON_SECRET)."
