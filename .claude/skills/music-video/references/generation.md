# Generation: OpenRouter images + HeyGen Video 1

All calls go through `video/scripts/generate.mjs` (stills / segments / shots). It reads `video/.env`, skips anything already on disk, and logs cost to `data/{slug}/ledger.json`. Prefer extending it over ad-hoc curl.

## Images (stills)
- `POST https://openrouter.ai/api/v1/images` with `{model, prompt, aspect_ratio, resolution, input_references:[{type:"image_url", image_url:{url}}]}`. The response is `data[0].b64_json`.
- Model: `google/gemini-3.1-flash-image`, `resolution: "1K"`, about $0.067 per image. It keeps a face consistent from up to 14 references.
- Image references may be `data:` URLs.
- Prompt pattern for variants: "The same person as the reference image, same face and hair, same pose/stage, but now ... Same framing." This keeps identity and only swaps wardrobe/setting.
- Vertical videos: `aspect_ratio: "9:16"`.

## Video (shots): `heygen/heygen-video-1`
- `POST /api/v1/videos`, then poll `polling_url` (statuses `pending`, `in_progress`, `completed`, `failed`, `cancelled`, `expired`), then GET `unsigned_urls[0]` with the auth header.
- Durations 5–15 s; resolutions 480p or 768p (768p costs $0.03/s; reference mode costs $0.06/s).
- `frame_images` supports **`first_frame` only** (no last frame).
- **Always renders an audio track.** Sending `generate_audio: false` gets a 400. Omit it and mute the clip in Remotion (`<OffthreadVideo muted>`).
- Image references can be data URLs. **Audio references must be public HTTPS URLs** (data: audio is rejected). If you ever need audio in, publish the snippet under `public/` first and push.
- If `frame_images` and `input_references` are both present, `frame_images` wins.
- About 1–3 minutes per clip; submit the whole batch in parallel (generate.mjs does).

## Prompts that worked
- Morph: `"The outfit transforms into {target}. Continuous on-camera transformation with no cuts: the outfit ripples and morphs like liquid fabric while the singer keeps dancing... Same face, same hair, same stage and lighting."`
- Performance: describe energy plus camera ("dynamic handheld camera", "slow push in", "static camera").
- Mood scenes: describe light and motion ("mirror ball turns slowly, specks of light drift").

## Other models (if HeyGen can't do something)
- `GET https://openrouter.ai/api/v1/videos/models` lists durations, resolutions, frame support and pricing. Kling v3.0 std ($0.084/s) supports first + last frame; Wan 3.0 runs 2–30 s.

## Remotion gotchas
- `--scale` must produce whole-number pixel sizes (use `0.6666666666666666`, not `0.6667`).
- Remotion's bundled ffmpeg (`npx remotion ffmpeg`) can encode h264/aac/mp3 and use `-s WxH`, but has no `xstack`/complex filters.
- Scanlines and noise blow up file size (an 88 MB 1080p render). Re-encode for the web: `-s 1280x720 -c:v libx264 -preset slow -crf 30`.
