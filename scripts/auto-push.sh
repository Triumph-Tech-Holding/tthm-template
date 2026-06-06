#!/usr/bin/env bash
# auto-push.sh — Push automático para o branch atual
# Uso: bash scripts/auto-push.sh "mensagem do commit" (opcional)
set -euo pipefail

MSG="${1:-chore: auto-push $(date '+%Y-%m-%d %H:%M')}"

git add -A
if git diff --cached --quiet; then
  echo "[auto-push] Nada para commitar."
  exit 0
fi

git commit -m "$MSG"
git push

echo "[auto-push] ✅ Push concluído: $MSG"
