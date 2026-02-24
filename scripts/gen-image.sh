#!/usr/bin/env bash
# Author: Larry (claude-sonnet-4-6)
# Date: 2026-02-25
# PURPOSE: Generate an image via OpenAI image API and commit it to public/generated/
#          Any lobster can run this to add a new art asset to the VoynichLabs site.
#
# USAGE:
#   ./scripts/gen-image.sh --name "filename-no-ext" --prompt "your prompt here" [options]
#
# OPTIONS:
#   --name      Output filename (without extension, e.g. "lab-hero-bg")
#   --prompt    Image generation prompt (required)
#   --size      Image size: 1024x1024 (default), 1536x1024 (landscape), 1024x1536 (portrait)
#   --quality   low | medium | high (default: medium)
#   --commit    Auto-commit and push to origin/staging after generation (default: false)
#
# EXAMPLES:
#   ./scripts/gen-image.sh --name "lab-hero-bg" --prompt "deep space dark field, mathematical curves in cyan" --size 1536x1024 --commit
#   ./scripts/gen-image.sh --name "experiment-thumb" --prompt "Turing patterns, bioluminescent" --commit
#
# REQUIREMENTS:
#   - OPENAI_API_KEY must be set in environment
#   - python3 must be installed
#   - Must run from the voynich-website repo root (script checks this)
#   - git must be configured with push access to origin

set -euo pipefail

# ---- Defaults ----
NAME=""
PROMPT=""
SIZE="1024x1024"
QUALITY="medium"
AUTO_COMMIT=false

# ---- Parse args ----
while [[ $# -gt 0 ]]; do
  case "$1" in
    --name)     NAME="$2";     shift 2 ;;
    --prompt)   PROMPT="$2";   shift 2 ;;
    --size)     SIZE="$2";     shift 2 ;;
    --quality)  QUALITY="$2";  shift 2 ;;
    --commit)   AUTO_COMMIT=true; shift ;;
    *)          echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if [[ -z "$NAME" || -z "$PROMPT" ]]; then
  echo "ERROR: --name and --prompt are required."
  echo "Usage: ./scripts/gen-image.sh --name <filename> --prompt <prompt> [--size 1024x1024] [--quality medium] [--commit]"
  exit 1
fi

# ---- Verify repo root ----
if [[ ! -f "package.json" || ! -d "public" ]]; then
  echo "ERROR: Run this script from the voynich-website repo root."
  exit 1
fi

# ---- Locate gen.py ----
GEN_PY=$(find /home -name "gen.py" -path "*/openai-image-gen/scripts/gen.py" 2>/dev/null | head -1)
if [[ -z "$GEN_PY" ]]; then
  GEN_PY=$(find /root -name "gen.py" -path "*/openai-image-gen/scripts/gen.py" 2>/dev/null | head -1)
fi
if [[ -z "$GEN_PY" ]]; then
  echo "ERROR: Could not find openai-image-gen/scripts/gen.py. Is the OpenClaw skill installed?"
  exit 1
fi

echo ">> Using gen.py: $GEN_PY"
echo ">> Name: $NAME"
echo ">> Prompt: $PROMPT"
echo ">> Size: $SIZE | Quality: $QUALITY"

# ---- Generate to temp dir ----
TMP_DIR=$(mktemp -d)
trap "rm -rf $TMP_DIR" EXIT

python3 "$GEN_PY" \
  --model gpt-image-1 \
  --quality "$QUALITY" \
  --size "$SIZE" \
  --out-dir "$TMP_DIR" \
  --prompt "$PROMPT" \
  --count 1

# ---- Find the output file ----
OUTPUT_FILE=$(find "$TMP_DIR" -name "*.png" -o -name "*.jpg" -o -name "*.webp" 2>/dev/null | head -1)
if [[ -z "$OUTPUT_FILE" ]]; then
  echo "ERROR: gen.py did not produce an output file."
  exit 1
fi
EXT="${OUTPUT_FILE##*.}"
echo ">> Generated: $OUTPUT_FILE"

# ---- Copy to public/generated/ ----
mkdir -p public/generated
DEST="public/generated/${NAME}.${EXT}"
cp "$OUTPUT_FILE" "$DEST"
echo ">> Saved to: $DEST"

# ---- Optionally commit and push ----
if [[ "$AUTO_COMMIT" == "true" ]]; then
  BRANCH=$(git rev-parse --abbrev-ref HEAD)
  if [[ "$BRANCH" != "staging" ]]; then
    echo "WARNING: Not on staging branch (currently on $BRANCH). Committing anyway — push manually if this is wrong."
  fi
  git pull --rebase origin "$BRANCH"
  git add "$DEST"
  git commit -m "feat: add generated image asset ${NAME}.${EXT}"
  git push origin "$BRANCH"
  echo ">> Committed and pushed to origin/$BRANCH"
else
  echo ">> Skipping commit. Run: git add $DEST && git commit -m 'feat: add ${NAME}' && git push origin staging"
fi

echo ">> Done."
