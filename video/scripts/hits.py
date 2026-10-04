# Author: Claude Opus 5.5
# Date: 2026-10-04
# PURPOSE: Find the moments a music video should glitch on: hard transients (the loudest onset
#          spikes, ranked against their local neighbourhood) and digital dropouts (sudden short
#          silences inside loud passages, the "buffer stutter" effect in glitchcore). Writes
#          data/{slug}/timing/hits.json = {"hits": [{"t": s, "kind": "spike"|"drop", "s": 0..1}]}
#          which compositions read to time chromatic-split / slice-displacement glitches.
# SRP/DRY check: Pass - analyze.py owns words + beat grid; this script owns glitch cue points
#                only. Song-agnostic (slug + audio path as args).
#
# Usage (from video/):
#   .venv/bin/python scripts/hits.py cve-carnival-bubba ../public/music/raps/cve-carnival-v2.mp3

import argparse
import json
from pathlib import Path

import librosa
import numpy as np

HOP = 512


def main():
    ap = argparse.ArgumentParser(description="Glitch cue points (spikes + dropouts) for a music video.")
    ap.add_argument("slug")
    ap.add_argument("audio", type=Path)
    ap.add_argument("--spike-pct", type=float, default=98.5, help="local onset percentile for a spike")
    ap.add_argument("--min-gap", type=float, default=0.25, help="seconds between kept cues")
    opt = ap.parse_args()

    y, sr = librosa.load(str(opt.audio), sr=22050, mono=True)
    fps = sr / HOP
    onset = librosa.onset.onset_strength(y=y, sr=sr, hop_length=HOP)
    rms = librosa.feature.rms(y=y, hop_length=HOP)[0]
    db = librosa.amplitude_to_db(rms, ref=np.max)

    cues = []
    # Spikes: onset peaks that stand out against a 6-second window around them.
    win = int(6 * fps)
    peaks = librosa.util.peak_pick(onset, pre_max=3, post_max=3, pre_avg=10, post_avg=10, delta=0.5, wait=int(0.1 * fps))
    for p in peaks:
        lo, hi = max(0, p - win // 2), min(len(onset), p + win // 2)
        thresh = np.percentile(onset[lo:hi], opt.spike_pct)
        if onset[p] >= thresh:
            cues.append({"t": p / fps, "kind": "spike", "s": float(onset[p] / onset[lo:hi].max())})

    # Dropouts: level falls >= 18 dB below the surrounding second for 40-400 ms while the
    # surrounding second is loud (> -20 dB of the track peak).
    ctx = int(1.0 * fps)
    k = 0
    while k < len(db):
        lo, hi = max(0, k - ctx), min(len(db), k + ctx)
        local = np.percentile(db[lo:hi], 80)
        if local > -20 and db[k] < local - 18:
            j = k
            while j < len(db) and db[j] < local - 18:
                j += 1
            dur = (j - k) / fps
            if 0.04 <= dur <= 0.4:
                cues.append({"t": k / fps, "kind": "drop", "s": float(min(1.0, (local - db[k:j].min()) / 40))})
            k = j
        k += 1

    cues.sort(key=lambda c: c["t"])
    kept = []
    for c in cues:
        if kept and c["t"] - kept[-1]["t"] < opt.min_gap:
            if c["s"] > kept[-1]["s"]:
                kept[-1] = c
            continue
        kept.append(c)
    out = Path(__file__).resolve().parent.parent / "data" / opt.slug / "timing" / "hits.json"
    out.write_text(json.dumps({"hits": [{"t": round(c["t"], 3), "kind": c["kind"], "s": round(c["s"], 2)} for c in kept]}, indent=1), encoding="utf-8")
    spikes = sum(c["kind"] == "spike" for c in kept)
    print(f"{len(kept)} cues ({spikes} spikes, {len(kept) - spikes} dropouts) -> {out}")


if __name__ == "__main__":
    main()
