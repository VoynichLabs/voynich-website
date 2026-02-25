#!/usr/bin/env bash
# Author: Larry (claude-sonnet-4-6)
# Date: 2026-02-25
# PURPOSE: Generate an image via Gemini 2.5 Flash (OpenRouter API) and commit it to public/generated/
#          Uses the openrouter-image-gen skill from the Larry workspace.
#          Any lobster can run this to add a new art asset to the VoynichLabs site.
#
# USAGE:
#   ./scripts/gen-image.sh --name "filename-no-ext" --prompt "your prompt here" [--commit]
#
# OPTIONS:
#   --name      Output filename (without extension, e.g. "lab-hero-bg")
#   --prompt    Image generation prompt (required)
#   --commit    Auto-commit and push to origin/staging after generation (default: false)
#
# EXAMPLES:
#   ./scripts/gen-image.sh --name "lab-hero-bg" --prompt "deep space dark field, mathematical curves in cyan, 16:9 wide format" --commit
#   ./scripts/gen-image.sh --name "experiment-thumb" --prompt "Turing patterns, bioluminescent, dark background" --commit
#
# REQUIREMENTS:
#   - secrets.json must contain other.openrouter_image_key (see skills/openrouter-image-gen/SKILL.md)
#   - python3 + requests library must be installed
#   - Must run from the voynich-website repo root
#   - git must be configured with push access to origin (for --commit)

set -euo pipefail

NAME=""
PROMPT=""
AUTO_COMMIT=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name)    NAME="$2";   shift 2 ;;
    --prompt)  PROMPT="$2"; shift 2 ;;
    --commit)  AUTO_COMMIT=true; shift ;;
    *)         echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if [[ -z "$NAME" || -z "$PROMPT" ]]; then
  echo "ERROR: --name and --prompt are required."
  echo "Usage: ./scripts/gen-image.sh --name <filename> --prompt <prompt> [--commit]"
  exit 1
fi

if [[ ! -f "package.json" || ! -d "public" ]]; then
  echo "ERROR: Run this script from the voynich-website repo root."
  exit 1
fi

SECRETS_PATH="/mnt/c/Users/User/.openclaw/workspace/secrets.json"

echo ">> Name: $NAME"
echo ">> Prompt: $PROMPT"

DEST="public/generated/${NAME}.png"
mkdir -p public/generated

# Generate using Gemini 2.5 Flash via OpenRouter
python3 - <<PYEOF
import requests, json, base64, sys

import os
api_key = os.environ.get('OPENROUTER_IMAGE_KEY', '')
if not api_key:
    try:
        secrets = json.load(open('$SECRETS_PATH'))
        api_key = secrets.get('other', {}).get('openrouter_image_key', '')
    except Exception:
        pass
if not api_key:
    print("ERROR: Set OPENROUTER_IMAGE_KEY env var or add openrouter_image_key to secrets.json")
    sys.exit(1)

prompt = """$PROMPT"""
print(f">> Calling Gemini 2.5 Flash via OpenRouter...")

response = requests.post(
    url="https://openrouter.ai/api/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://voynich-website-production.up.railway.app",
        "X-Title": "VoynichLabs",
    },
    data=json.dumps({
        "model": "google/gemini-2.5-flash-image",
        "messages": [{"role": "user", "content": prompt}]
    }),
    timeout=120
)

r = response.json()
images = r.get('choices', [{}])[0].get('message', {}).get('images', [])

if not images:
    print(f"ERROR: No image returned. Response: {str(r)[:500]}")
    sys.exit(1)

img_data = images[0]['image_url']['url']
b64 = img_data.split(',', 1)[1]

with open('$DEST', 'wb') as f:
    f.write(base64.b64decode(b64))

print(f">> Saved to: $DEST")
PYEOF

echo ">> Image written: $DEST"

if [[ "$AUTO_COMMIT" == "true" ]]; then
  BRANCH=$(git rev-parse --abbrev-ref HEAD)
  git pull --rebase origin "$BRANCH"
  git add "$DEST"
  git commit -m "feat: add generated image asset ${NAME}.png"
  git push origin "$BRANCH"
  echo ">> Committed and pushed to origin/$BRANCH"
else
  echo ">> Skipping commit. Run: git add $DEST && git commit -m 'feat: add ${NAME}' && git push origin staging"
fi

echo ">> Done."
