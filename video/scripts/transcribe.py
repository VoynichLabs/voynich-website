# Author: Claude Opus 5.5
# Date: 2026-10-04
# PURPOSE: Draft a lyrics file for a song that has none (e.g. audio pulled from a YouTube Short).
#          Whisper transcribes the vocal; lines follow Whisper's segments and a "[Part N]" header
#          starts after any gap longer than 3 s. The output is a DRAFT for Mark to correct, then
#          analyze.py aligns against it exactly like a hand-written lyrics file.
# SRP/DRY check: Pass - transcription only; alignment stays in analyze.py.
#
# Usage (from video/):
#   .venv/Scripts/python scripts/transcribe.py ../public/audio/shorts/ten-dev-commandments.mp3
#   -> ../public/audio/shorts/ten-dev-commandments_lyrics.txt (refuses to overwrite)

import sys
from pathlib import Path

import librosa
from faster_whisper import WhisperModel


def main():
    if len(sys.argv) != 2:
        raise SystemExit("usage: transcribe.py <audio.mp3>")
    audio = Path(sys.argv[1])
    out = audio.with_name(audio.stem + "_lyrics.txt")
    if out.exists():
        raise SystemExit(f"{out} exists; edit it by hand instead of re-transcribing")
    y, _ = librosa.load(str(audio), sr=16000, mono=True)
    model = WhisperModel("medium.en", device="cpu", compute_type="int8")
    segments, _ = model.transcribe(y, vad_filter=True, condition_on_previous_text=False, beam_size=5)
    lines, part, last_end = [], 0, None
    for seg in segments:
        text = seg.text.strip()
        if not text:
            continue
        if last_end is None or seg.start - last_end > 3.0:
            part += 1
            if lines:
                lines.append("")
            lines.append(f"[Part {part}]")
        lines.append(text)
        last_end = seg.end
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"wrote {out} ({sum(1 for l in lines if l and not l.startswith('['))} lines) - DRAFT, needs a human pass")


if __name__ == "__main__":
    main()
