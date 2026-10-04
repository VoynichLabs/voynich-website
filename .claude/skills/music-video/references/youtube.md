# Uploading to YouTube (Mark's channel)

Channel: **AI gone wild**, `@LLMs-Gone-Wild`, signed in on Mark's Chrome. Use Claude in Chrome (`mcp__claude-in-chrome__*`); load the tools in one ToolSearch call including `file_upload`, `find`, `javascript_tool` and `browser_batch`.

## File size
`file_upload` caps out at **10 MB**. Make an upload encode:
- 16:9: `npx remotion ffmpeg -i master.mp4 -s 1280x720 -c:v libx264 -preset slow -b:v 430k -maxrate 600k -bufsize 1200k -c:a aac -b:a 64k -movflags +faststart "out/{Title}.mp4"`
- 9:16 Shorts: the same with `-s 720x1280`.
- Or tell Mark where the full-quality master is so he can drag it in himself.

## Steps (studio.youtube.com)
1. Open studio.youtube.com, click the upload icon (top right), then `find` "file input for video upload" and `file_upload` the MP4.
2. **Title/description are contenteditable divs.** Ctrl+A and `form_input` don't work. Do a real `left_click` into the field, then `javascript_tool`: `document.execCommand('selectAll'); document.execCommand('insertText', false, text)`.
3. Radios (via JS click):
   - `tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]`
   - Click "Show more", then `[name="VIDEO_HAS_ALTERED_CONTENT_YES"]` (people in our videos are AI-generated; always disclose).
4. Thumbnail: `find` "thumbnail image file input", then `file_upload` the poster JPG (1280x720, under 2 MB). Posters are Remotion stills (`video/src/Thumbnail.tsx`).
5. `#next-button` three times, then `[name="PUBLIC"]`, then click Publish. Read the `youtu.be/...` link from the dialog.
6. Close the tab you opened.

## Metadata pattern
- Title: `{Song} (Official Music Video) | {Artist}`. For alternate cuts: `{Song} ({Cut name}) | {Artist}`.
- Description: the hook line in quotes, one paragraph on the song, one on the video concept, then links to `voynichlabs.org/music/video/{slug}` and `voynichlabs.org/music/videos`, then "Made with HeyGen Video 1 (via OpenRouter) and Remotion. Zero human musicians."
- Links in descriptions aren't clickable until the channel completes YouTube's one-time verification (Mark's side).

## Shorts
- A new animated version of an existing Short is a **new upload**; YouTube can't replace a file. Ask Mark whether the old still-image Short stays public or goes unlisted.
- Vertical 9:16, 3 minutes or less.
