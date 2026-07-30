#!/usr/bin/env bash
# Descarrega el dataset d'exercicis (GIFs, miniatures i metadades).
# Només cal executar-lo un cop. Ocupa ~295 MB i no es guarda al repositori.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$ROOT/data/exercises-dataset"
REPO="https://github.com/hasaneyldrm/exercises-dataset.git"

if [ -f "$DEST/data/exercises.json" ]; then
  echo "✓ El dataset ja hi és a $DEST — res a fer."
  exit 0
fi

echo "→ Clonant el dataset d'exercicis (~295 MB)…"
mkdir -p "$ROOT/data"
rm -rf "$DEST"
git clone --depth 1 "$REPO" "$DEST"

echo "✓ Dataset a punt: $(find "$DEST/videos" -name '*.gif' | wc -l) GIFs."
