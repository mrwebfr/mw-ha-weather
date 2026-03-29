#!/bin/bash
# ============================================================
# MWHA Weather — Build Script
# Concatène les fichiers src/ dans dist/mw-ha-weather.js
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC_DIR="$ROOT_DIR/src"
DIST_DIR="$ROOT_DIR/dist"

mkdir -p "$DIST_DIR"

# Ordre de concaténation (les dépendances d'abord)
FILES=(
  "constants.js"
  "utils.js"
  "icons.js"
  "styles.js"
  "api.js"
  "templates.js"
  "editor.js"
  "card.js"
)

OUTPUT="$DIST_DIR/mw-ha-weather.js"

# Début de l'IIFE
echo "(function() {" > "$OUTPUT"
echo "'use strict';" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Concaténation des fichiers
for file in "${FILES[@]}"; do
  filepath="$SRC_DIR/$file"
  if [ -f "$filepath" ]; then
    echo "// --- $file ---" >> "$OUTPUT"
    cat "$filepath" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  else
    echo "  [SKIP] $file (not found)"
  fi
done

# Fin de l'IIFE
echo "})();" >> "$OUTPUT"

echo "Build OK -> $OUTPUT"
