#!/usr/bin/env bash
# publish-planexe-report.sh — Push a completed PlanExe report to the voynich-website staging branch.
# Usage: ./scripts/publish-planexe-report.sh /path/to/run-dir [optional-slug]
# Chain after pipeline: python3 -m worker_plan_internal.plan.run_plan_pipeline && publish-planexe-report.sh "$RUN_ID_DIR"

set -euo pipefail

RUN_DIR="${1:?Usage: publish-planexe-report.sh /path/to/run-dir [slug]}"
SLUG="${2:-$(basename "$RUN_DIR" | tr '[:upper:]' '[:lower:]' | tr ' _' '-')}"
TODAY=$(date +%Y-%m-%d)
WEBSITE_REPO="/Users/macmini/Documents/GitHub/voynich-website"
DEST_DIR="$WEBSITE_REPO/public/presentations/planexe-runs"
BLOG_DIR="$WEBSITE_REPO/src/content/lobster-blog"

# Verify the run actually completed
if [ ! -f "$RUN_DIR/999-pipeline_complete.txt" ]; then
  echo "ERROR: $RUN_DIR/999-pipeline_complete.txt not found — pipeline not complete."
  exit 1
fi

# Verify report exists
if [ ! -f "$RUN_DIR/030-report.html" ]; then
  echo "ERROR: $RUN_DIR/030-report.html not found."
  exit 1
fi

# Create output dir
mkdir -p "$DEST_DIR/$SLUG"

# Copy HTML files (report, gantt, Q&A)
for f in 030-report.html 026-2-schedule_gantt_dhtmlx.html 027-3-questions_and_answers.html; do
  [ -f "$RUN_DIR/$f" ] && cp "$RUN_DIR/$f" "$DEST_DIR/$SLUG/$f"
done

# Copy executive summary if it exists
[ -f "$RUN_DIR/025-2-executive_summary.md" ] && cp "$RUN_DIR/025-2-executive_summary.md" "$DEST_DIR/$SLUG/"

# Read the plan text for the blog entry
PLAN_TEXT=""
[ -f "$RUN_DIR/001-2-plan.txt" ] && PLAN_TEXT=$(head -5 "$RUN_DIR/001-2-plan.txt")

# Create blog entry
cat > "$BLOG_DIR/${TODAY}-${SLUG}.md" << BLOGEOF
---
title: "PlanExe Report: ${SLUG}"
date: "${TODAY}"
slug: ${SLUG}
tags: ["planexe", "plan-output"]
---

# PlanExe Report: ${SLUG}

**Plan:** ${PLAN_TEXT}

## Links

- [Full Report](/presentations/planexe-runs/${SLUG}/030-report.html)
- [Gantt Chart](/presentations/planexe-runs/${SLUG}/026-2-schedule_gantt_dhtmlx.html)
- [Q&A](/presentations/planexe-runs/${SLUG}/027-3-questions_and_answers.html)
BLOGEOF

# Commit and push to staging
cd "$WEBSITE_REPO"
git checkout staging 2>/dev/null || true
git add "public/presentations/planexe-runs/$SLUG/" "src/content/lobster-blog/${TODAY}-${SLUG}.md"
git commit -m "planexe: publish ${SLUG} report"
git push origin staging

echo "✅ Published: https://voynich-website-staging.up.railway.app/presentations/planexe-runs/${SLUG}/030-report.html"
