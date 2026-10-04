# Author: Claude Opus 5.5
# Date: 2026-10-04
# PURPOSE: Timing analysis for a music video. Produces word/line timestamps (faster-whisper
#          transcription aligned onto the canonical lyrics file, which stays ground truth)
#          and a beat grid (librosa). Output feeds the Remotion composition.
# SRP/DRY check: Pass - single analysis entry point; song-agnostic (slug + paths as args).
#
# Usage (from video/):
#   .venv/Scripts/python scripts/analyze.py system-prompt \
#       ../public/audio/latent-space/system-prompt.mp3 \
#       ../public/audio/latent-space/system-prompt_lyrics.txt
#
# Screamed vocals defeat Whisper. Optional data/{slug}/timing-overrides.json pins lines by hand
# ({"lines": {"19": [72.1, 82.2], ...}}, line index -> [start, end]); words in a pinned line are
# respread evenly. Overrides survive re-runs, so hand fixes are never lost. An optional "drop"
# list ({"drop": [16, 85]}) removes lyric lines the take never sings; pins use the original
# line indices, and the surviving lines are renumbered in words.json.
#
# 2026-10-04 (Bubba, CVE Carnival Bubba cut): optional flags, defaults unchanged so existing songs
# re-run identically. --model picks the Whisper model (large-v3-turbo for fast rap), --no-prompt
# skips the lyrics prompt (on fast rap it made medium.en hallucinate whole verses), --bpm seeds the
# beat tracker when librosa locks onto a dotted multiple.

import argparse
import difflib
import json
import re
from pathlib import Path

import librosa
import numpy as np
from faster_whisper import WhisperModel


def norm(word: str) -> str:
    return re.sub(r"[^a-z0-9']", "", word.lower()).strip("'")


def parse_lyrics(path: Path):
    """Return (lines, words). Section headers like [Chorus] tag the lines below them."""
    lines, words = [], []
    section = "Intro"
    for raw in path.read_text(encoding="utf-8").splitlines():
        raw = raw.strip()
        if not raw:
            continue
        m = re.match(r"^\[(.+?)\]$", raw)
        if m:
            section = m.group(1).split(" - ")[0].strip()
            continue
        line_idx = len(lines)
        lines.append({"text": raw, "section": section})
        for tok in raw.split():
            if norm(tok):
                words.append({"w": tok, "n": norm(tok), "line": line_idx})
    return lines, words


def beat_grid(y, sr, start_bpm=None):
    extra = {"start_bpm": start_bpm, "tightness": 400} if start_bpm else {}
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr, units="frames", **extra)
    beats = librosa.frames_to_time(beat_frames, sr=sr)
    # Downbeat phase: pick the 4-beat offset whose beats carry the most onset energy.
    onset = librosa.onset.onset_strength(y=y, sr=sr)
    strengths = onset[np.clip(beat_frames, 0, len(onset) - 1)]
    phase = int(np.argmax([strengths[p::4].mean() for p in range(4)])) if len(beats) >= 8 else 0
    return float(np.atleast_1d(tempo)[0]), beats.tolist(), beats[phase::4].tolist()


def transcribe(audio_path: Path, lyrics_text: str, model_name="medium.en", use_prompt=True):
    # Decode with librosa and hand Whisper a 16 kHz array; avoids PyAV version drift.
    audio16k, _ = librosa.load(str(audio_path), sr=16000, mono=True)
    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    segments, _ = model.transcribe(
        audio16k,
        language="en",
        word_timestamps=True,
        vad_filter=False,
        condition_on_previous_text=False,
        initial_prompt=lyrics_text[:800] if use_prompt else None,
    )
    out = []
    for seg in segments:
        for w in seg.words or []:
            if norm(w.word):
                out.append({"n": norm(w.word), "start": float(w.start), "end": float(w.end)})
    return out


def align(lyric_words, heard, duration):
    """Map heard timestamps onto lyric words; interpolate any lyric word Whisper missed."""
    a = [w["n"] for w in lyric_words]
    b = [h["n"] for h in heard]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    for block in sm.get_matching_blocks():
        for k in range(block.size):
            lw, hw = lyric_words[block.a + k], heard[block.b + k]
            lw["start"], lw["end"], lw["matched"] = hw["start"], hw["end"], True

    # Spread each run of unmatched lyric words evenly across the gap between its anchors.
    if not any(w.get("matched") for w in lyric_words):
        raise SystemExit("No lyric words matched the transcription; check the audio/lyrics pair.")
    i = 0
    while i < len(lyric_words):
        if lyric_words[i].get("matched"):
            i += 1
            continue
        j = i
        while j < len(lyric_words) and not lyric_words[j].get("matched"):
            j += 1
        t0 = lyric_words[i - 1]["end"] if i > 0 else max(0.0, lyric_words[j]["start"] - 0.4 * (j - i))
        t1 = lyric_words[j]["start"] if j < len(lyric_words) else min(duration, t0 + 0.4 * (j - i))
        step = (t1 - t0) / (j - i)
        for k in range(i, j):
            lyric_words[k]["start"] = round(t0 + step * (k - i), 3)
            lyric_words[k]["end"] = round(t0 + step * (k - i + 1), 3)
            lyric_words[k]["matched"] = False
        i = j
    return sum(1 for w in lyric_words if w["matched"]) / len(lyric_words)


def main():
    ap = argparse.ArgumentParser(description="Word/line timing + beat grid for a music video.")
    ap.add_argument("slug")
    ap.add_argument("audio", type=Path)
    ap.add_argument("lyrics", type=Path)
    ap.add_argument("--model", default="medium.en", help="faster-whisper model name")
    ap.add_argument("--bpm", type=float, default=None, help="seed tempo for the beat tracker")
    ap.add_argument("--no-prompt", action="store_true", help="do not prime Whisper with the lyrics")
    opt = ap.parse_args()
    slug, audio_path, lyrics_path = opt.slug, opt.audio, opt.lyrics
    out_dir = Path(__file__).resolve().parent.parent / "data" / slug / "timing"
    out_dir.mkdir(parents=True, exist_ok=True)

    y, sr = librosa.load(str(audio_path), sr=22050, mono=True)
    duration = float(len(y) / sr)
    tempo, beats, downbeats = beat_grid(y, sr, opt.bpm)
    (out_dir / "beats.json").write_text(json.dumps({
        "duration": round(duration, 3),
        "tempo": round(tempo, 2),
        "beats": [round(t, 3) for t in beats],
        "downbeats": [round(t, 3) for t in downbeats],
    }, indent=1), encoding="utf-8")
    print(f"duration {duration:.2f}s  tempo {tempo:.1f} bpm  beats {len(beats)}")

    lines, lyric_words = parse_lyrics(lyrics_path)
    heard = transcribe(audio_path, lyrics_path.read_text(encoding="utf-8"), opt.model, not opt.no_prompt)
    coverage = align(lyric_words, heard, duration)
    print(f"heard {len(heard)} words; {coverage:.0%} of lyric words matched directly")

    overrides_path = out_dir.parent / "timing-overrides.json"
    override_doc = json.loads(overrides_path.read_text(encoding="utf-8")) if overrides_path.exists() else {}
    overrides = override_doc.get("lines", {})
    for li, line in enumerate(lines):
        ws = [w for w in lyric_words if w["line"] == li]
        if str(li) in overrides:
            t0, t1 = overrides[str(li)]
            step = (t1 - t0) / len(ws)
            for k, w in enumerate(ws):
                w["start"], w["end"] = round(t0 + step * k, 3), round(t0 + step * (k + 1), 3)
        line["start"], line["end"] = ws[0]["start"], ws[-1]["end"]
    if overrides:
        print(f"applied {len(overrides)} line overrides from {overrides_path.name}")
    drop = set(override_doc.get("drop", []))
    if drop:
        keep = [i for i in range(len(lines)) if i not in drop]
        remap = {old: new for new, old in enumerate(keep)}
        lines = [lines[i] for i in keep]
        lyric_words = [dict(w, line=remap[w["line"]]) for w in lyric_words if w["line"] not in drop]
        print(f"dropped {len(drop)} unsung lines")
    sections = []
    for line in lines:
        if not sections or sections[-1]["name"] != line["section"] or line["start"] - sections[-1]["end"] > 6:
            sections.append({"name": line["section"], "start": line["start"], "end": line["end"]})
        else:
            sections[-1]["end"] = line["end"]

    (out_dir / "words.json").write_text(json.dumps({
        "coverage": round(coverage, 3),
        "sections": sections,
        "lines": lines,
        "words": [{k: w[k] for k in ("w", "line", "start", "end", "matched")} for w in lyric_words],
    }, indent=1), encoding="utf-8")
    for s in sections:
        print(f"  {s['name']:<14} {s['start']:7.2f} - {s['end']:7.2f}")


if __name__ == "__main__":
    main()
