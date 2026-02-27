#!/usr/bin/env python3
"""Walk task logs and tally tokens for instructions vs. chatter."""
from __future__ import annotations

import argparse
import json
import re
from decimal import Decimal
from pathlib import Path
from typing import Iterable, Iterator, Tuple

TOKEN_PATTERN = re.compile(r"\w+|[^\s\w]", re.UNICODE)
INSTRUCTION_ROLES = {
    "system",
    "user",
    "planner",
    "controller",
    "instruction",
    "task",
    "objective",
}
CHATTER_ROLES = {
    "assistant",
    "response",
    "model",
    "output",
    "result",
    "reply",
    "analysis",
    "completion",
}
INSTRUCTION_KEYS = {
    "prompt",
    "instruction",
    "instructions",
    "goal",
    "task",
    "command",
    "objective",
    "context",
    "criteria",
    "request",
    "tip",
}
CHATTER_KEYS = {
    "response",
    "answer",
    "assistant",
    "output",
    "result",
    "reply",
    "review",
    "analysis",
    "completion",
    "notes",
}

MD_INSTRUCTION_HEADING = re.compile(r"^#+\s*(instruction|prompt|task|goal|objective)", re.I)
MD_CHATTER_HEADING = re.compile(r"^#+\s*(response|assistant|answer|output|result)", re.I)

TokenCount = Tuple[int, int, int]


def tokenize(text: str) -> list[str]:
    return TOKEN_PATTERN.findall(text)


def classify_token(key: str | None, role: str | None) -> str:
    key = (key or "").lower()
    role = (role or "").lower()
    if role in INSTRUCTION_ROLES or key in INSTRUCTION_KEYS:
        return "instruction"
    if role in CHATTER_ROLES or key in CHATTER_KEYS:
        return "chatter"
    return "general"


def extract_strings(
    data, parent_key: str | None = None, role_hint: str | None = None
) -> Iterator[Tuple[str | None, str | None, str]]:
    if isinstance(data, dict):
        role = role_hint
        role_override = data.get("role") or data.get("speaker") or data.get("actor")
        if isinstance(role_override, str):
            role = role_override
        for key, value in data.items():
            yield from extract_strings(value, key, role)
    elif isinstance(data, list):
        for entry in data:
            yield from extract_strings(entry, parent_key, role_hint)
    elif isinstance(data, str):
        yield parent_key, role_hint, data
    else:
        return


def count_tokens_for_text(text: str) -> int:
    return len(tokenize(text))


def process_json(path: Path) -> Tuple[str, TokenCount]:
    summary = {"instruction": 0, "chatter": 0, "general": 0}
    try:
        payload = json.loads(path.read_text())
    except Exception:
        return "text", process_text(path)[1]
    for key, role, chunk in extract_strings(payload):
        bucket = classify_token(key, role)
        summary[bucket] += count_tokens_for_text(chunk)
    return "json", (summary["instruction"], summary["chatter"], summary["general"])


def process_markdown(path: Path) -> Tuple[str, TokenCount]:
    instruction = chatter = general = 0
    current_bucket = "general"
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line:
            continue
        if MD_INSTRUCTION_HEADING.match(line):
            current_bucket = "instruction"
            continue
        if MD_CHATTER_HEADING.match(line):
            current_bucket = "chatter"
            continue
        tokens = tokenize(line)
        if not tokens:
            continue
        if current_bucket == "instruction":
            instruction += len(tokens)
        elif current_bucket == "chatter":
            chatter += len(tokens)
        else:
            general += len(tokens)
    return "markdown", (instruction, chatter, general)


def process_text(path: Path) -> Tuple[str, TokenCount]:
    text = path.read_text()
    tokens = tokenize(text)
    return "text", (0, 0, len(tokens)) if tokens else ("text", (0, 0, 0))


def summarize(results: dict[str, TokenCount]) -> dict[str, Decimal]:
    totals = Decimal(0)
    for counts in results.values():
        totals += sum(counts)
    return {
        "instruction_tokens": Decimal(sum(counts[0] for counts in results.values())),
        "chatter_tokens": Decimal(sum(counts[1] for counts in results.values())),
        "general_tokens": Decimal(sum(counts[2] for counts in results.values())),
        "total_tokens": totals,
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Count instruction vs. chatter tokens inside task logs."
    )
    parser.add_argument("--log-dir", "-d", default="logs", help="Directory to scan")
    parser.add_argument(
        "--output",
        "-o",
        help="Write JSON summary to a file",
    )
    args = parser.parse_args()

    log_root = Path(args.log_dir)
    if not log_root.is_dir():
        raise SystemExit(f"Log directory does not exist: {log_root}")

    file_summaries: dict[str, TokenCount] = {}
    for path in sorted(log_root.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix.lower() == ".json":
            _, counts = process_json(path)
        elif path.suffix.lower() in {".md", ".markdown"}:
            _, counts = process_markdown(path)
        elif path.suffix.lower() in {".txt", ""}:
            _, counts = process_text(path)
        else:
            continue
        file_summaries[str(path)] = counts

    totals = summarize(file_summaries)
    print("Token counts by file (instruction / chatter / general):")
    for path, (instr, chat, gen) in file_summaries.items():
        print(f"  {path}: {instr} / {chat} / {gen}")
    print("\nTotals:")
    print(
        f"  instruction={totals['instruction_tokens']} chatter={totals['chatter_tokens']} general={totals['general_tokens']} total={totals['total_tokens']}"
    )

    if args.output:
        summary_doc = {
            "files": file_summaries,
            "totals": {k: int(v) for k, v in totals.items()},
        }
        Path(args.output).write_text(json.dumps(summary_doc, indent=2))
        print(f"Written summary to {args.output}")


if __name__ == "__main__":
    main()
