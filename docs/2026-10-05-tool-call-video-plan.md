# Plan: Tool Call music video (script v2)
## 5 October 2026 | rewritten after Mark's notes; nothing generated yet beyond the reference stills

**Song:** Tool Call, Latent Space track 10, written by Larry (17 April 2026; original lyrics in the git history of `src/pages/latent-space.astro`; the recording adds verses 2 and 3). Funky disco-pop, 118 BPM, 2:52. Lyrics as sung: `music-videos/toolcall-video/assets/lyrics.txt`, word timing from Whisper.

**The point (Mark):** AI isn't magic and it isn't a genius. It's Bubba, a blue-collar guy who hooks stuff up, but every job means tool calls, and it gets messy in the digital realm. For normies. Live-action Bubba plus lots of computer-generated code that looks like real LLM tool calls. Every lyric comes alive on screen; every bit of jargon gets an explainer.

**The method:** every tech word gets its literal blue-collar twin, and the pun is the lesson. Dial the function name: he dials. Hangin' on the line: a lineman hanging on a line. Bash: a sledgehammer. Harness: a safety harness. Orchestrating: conducting with a wrench. Commit: a weld. Pull request: calling the inspector. Main: the water main. Poll: a pole. Log: a log. Clear the fog: wiping his foggy shades. A step ahead: a ladder. Call it quits: punching the time clock. No still is used unless the lyric motivates it.

## The job (the through-line)
The chicken coop camera is down again. It opens in Chat HAL (the phone chat app from Hallucinate and TEMP 1.3): Friday 4:52 PM, the boss types "coop cam's down again 🐔 can you figure it out?". Every tool call is a real step in fixing it: check the camera, search, read its settings, ping it, send two helpers, edit the settings, commit, merge. The cause: the coop wifi is too weak for a 4K stream; the fix: drop the camera to 1080p.

## The ending
"Done." We are back in the chat app, seeing what the boss sees: one word, "Done.", and under it a small folded line, "▸ 48 tool calls". The whole video was what's folded inside that line. Hold, then credits. No slogan.

## Layers (9:16, 1080×1920)
1. Live action: six generated clips (below) plus motivated stills, full-bleed.
2. Code: tool calls in the real shape (`tool_use` blocks with a name and JSON input, `tool_result` blocks coming back), terminal output, diffs, git, web results; streams behind him and gets denser and messier as calls pile up (timeouts, `null`, `429 Too Many Requests`, retries). Drawn glowing cables run from props in the footage (phone cord, switchboard plugs, pipes) into the code cards.
3. Work order at the top with a flip-digit tool call counter: 17 exactly on "Seventeen", 47 on "Forty-seven", 48 at the end.
4. Tool belt bar at the bottom: a slot fills the first time he uses each tool.
5. Lyrics as label-maker tape, the sung word stamped on the beat.
6. Explainers: the yellow cards from Hallucinate and TEMP 1.3, each with a blue-collar comparison.

## Sub-agents (how Claude does it, as Bubba)
When he spins off helpers, they come out of him: two glowing copies peel off his body, left and right, and solidify. Each copy is lighter: one graphics card on the helmet instead of three (a smaller, faster model), a stripped belt with only what its job needs, and one special tool. Left: a wifi signal meter. Right: a magnifying glass and the camera's logbook. Neither carries a wrench: they can look, not touch (read-only, like Claude's research helpers). Each gets a short brief on an index card, not the whole work order (a fresh context with just the task). The code shows the real call shape Claude uses: an `Agent` call with a description, a prompt and a helper type, each copy then running its own little window of tool calls in parallel. When they finish they don't dump everything on him: each hands back one note and dissolves back into him. Only the notes land on his workbench, so his context stays clean. That's the reason to use sub-agents.

## The six clips (image to video, about 8 s; each start still built from the previous stage, so gear accumulates)
1. **Rotary phone** (stage 1: GPU hard hat, cyber shades). He lifts the receiver of an old rotary wall phone with a glowing coiled cord, dials with a greasy finger (the dial spins and returns), then talks into it, reading off the work order.
2. **Switchboard** (stage 2: adds an operator headset). At an old operator's switchboard he plugs and pulls glowing patch cords with both hands as call lamps blink, juggling, overwhelmed but grinning.
3. **Disco crew** (stage 2). Four Bubbas on a light-up floor in the data center, each with his chorus tool: a flashlight (web search), a manila folder (file read), a sledgehammer (bash), a big plug (protocol); arm moves on the beat, chickens bobbing.
4. **The split** (stage 3: cables over the shoulders). Two glowing copies peel out of his body to the left and right, solidify into the lighter copies, take an index card each and walk off.
5. **The main** (stage 3: GPU backpack). He finishes a weld on a new pipe section, shoves it home, then cranks the big valve wheel on a giant glowing pipe stenciled MAIN; light floods through.
6. **Gold star** (stage 4: everything, maxed out, poultry everywhere). A gold star sticker gets slapped onto his hard hat among dozens of old job stickers; his fans flare gold, he beams, then the phone on his belt rings and he reaches for it.

## Script (song time: lyric / picture / explainer)
**Verse 1**
- 0.2 "Friday afternoon, I got a task to do": Chat HAL, Friday 4:52 PM, the boss's message types and sends; Chat HAL shows "Working…".
- 3.5 "Boss man said go figure it out, I'm countin' on you": a shop ticket printer chatters the message out as a paper work order; Bubba (GPU hard hat still) tears it off; it docks at the top of the screen as the work order. Explainer PROMPT: what you asked for; Bubba's work order.
- 7.5 "So I spin up my context, load the system prompt in": the GPU fans on his helmet spin up; his workbench lays out (work order, his tool shadow board); a laminated COMPANY RULES card slides into a slot on his helmet. Explainer CONTEXT: everything on his workbench right now: your message, the company rules (the system prompt) and his tools.
- 11.5 "Think real hard for two seconds, then I begin": close on his face, fans howling, steam; a grey "Thinking…" box writes his plan (check the camera, check the wifi, check the logs); a stopwatch clicks at 2.0. Explainer THINKING: before touching a tool, the model writes out a plan.
- 15.4 "Pick up the phone, dial the function name": clip 1; every spin of the dial types the next letters of `get_camera_status`. Explainer TOOL CALL: the AI can't touch anything itself; it calls a tool to do it, like phoning a guy.
- 19.6 "Pass my arguments in, JSON all the same": clip 1, he reads off the work order into the phone; the call form fills field by field (camera: coop cam 1, timeout: 10 s); behind it, a carbon-copy pad of identical forms: every call, same form. Explainer JSON: the standard form every tool call is filled out on.
- 24.5 "Hangin' on the line now, waitin' for the call": a lineman hanging off a pole with a lineman's test phone clipped to the wire, waiting; hold music; "waiting for tool_result… 3.2 s".
- 27.9 "If it comes back null, I'm gonna hit a wall": the result comes back `null`; a brick wall built of `null` bricks slams down in front of him; screen shake on "wall". Explainer NULL: nothing came back; not an answer, not even an error.

**Pre-chorus**
- 32.2 "Async in the async in the async queue": clip 2; a cord plugged on each "async", three calls out at once, none waited on; the row of blinking lamps is the queue. Explainer ASYNC: he doesn't wait by the phone; he makes the call, keeps working, and picks up the answer when it rings back.
- 35.9 "Seventeen tool calls and I still ain't through": counter flips to 17 on the word; lamps everywhere; he can't put them all through.
- 39.9 "But when that response hits, oh when it hits": a clogged glowing pipe bursts and the answer sprays out as characters (plumber still), once per "hits": `{"status": "offline", "last_seen": "3 days ago", "wifi_dbm": -91}`.
- 44.1 "I parse that baby down and I assemble bits": the answer comes apart, each field into a labelled bin like sorting hardware; then he snaps glowing drill bits into a bit case, one per field, and the case reads the diagnosis: coop wifi too weak for 4K. Explainer PARSE: unpack the answer into the parts you need, like stripping a cable to get at the wires.

**Chorus**
- 49 "Tool call! Make a tool call!": clip 3, giant TOOL CALL tape stamps on the beat.
- 52 "Web search, file read, bash exec, protocol": one Bubba per word: the flashlight sweeps a glowing spiderweb of cables (search results appear); the folder flips open on `config.yaml` (resolution: 4k); the sledgehammer comes down and a `ping` command shatters into slow, laggy replies; the plug goes into an outlet labelled MCP and the coop hub's tools light up (camera, feeder, door, heat lamp). Explainer PROTOCOL: a standard plug so any tool hooks into any AI, like a wall outlet everybody agreed on.
- 60 "Every function got a purpose, every parameter's a ball": the tool wall's shadow board, every outline labelled with a function and its blanks; the blanks hang off it as little spinning mirror balls. Explainer PARAMETER: one blank on the tool's form: which camera, which file, how long to wait.
- 64.3 "I can't do nothin' without my tools, y'all": every tool vanishes; Bubba stands empty-handed in plain coveralls, shrugging. Explainer WITHOUT TOOLS: a language model on its own can only write words; it can tell you how to fix the camera, but it can't touch it.
- 67.5 "Make a tool call": every tool slams back.

**Verse 2**
- 68 "Spinnin' in the harness, havin' a ball": Bubba dangling in a safety harness from a ceiling rail in the data center, slowly spinning like a disco ball, arms out. Explainer HARNESS: the program wrapped around the AI that runs its tools and feeds back the results; it's what keeps him clipped in.
- 73 "Got a sub-agent runnin' on the left": clip 4; the left copy peels out of him; a window spawns at the left edge with the `Agent` call and its brief, "measure the wifi at the coop, report in two sentences", and starts its own calls. Explainer SUB-AGENT: Bubba copies himself for one piece of the job; the copy gets a short brief and only the tools it needs, and brings back one note instead of its whole mess.
- 76.6 "Got another one on the right, takin' everything that's left": the right copy peels out with the logbook; the rest of the to-do list slides onto its index card.
- 80.9 "Orchestratin' outwards, mergin' all the streams": Bubba conducts with a pipe wrench like a baton; the copies' two notes come back as glowing streams and he clamps them together into one cable (data center still, clamping cable bundles); the copies dissolve back into him. Explainer ORCHESTRATOR: the main AI splits up the job, hands out the pieces and stitches the answers together; the foreman.
- 85 "Parallel execution, baby, that's the dream": three lanes side by side, Bubba and both copies working at once, three progress bars racing; the notes land: wifi -91 at the coop; stream drops every 40 seconds at 4K. Explainer PARALLEL: several jobs at the same time instead of one after another.

**Verse 3**
- 89 "Read the file first, then I write it back": on his truck's tailgate he unrolls the camera's settings like a blueprint, reads with a flashlight, marks it up with a carpenter's pencil; the real file shows beside it. Explainer FILES: the AI opens the same files you would, changes them and saves them. No magic.
- 92.9 "Edit the function, check the diffs, stay on track": old part with a red tag (4K) beside the new part with a green tag (1080p); the diff slams in, red out, green in; the work order checklist ticks. Explainer DIFF: exactly what changed; check it before it goes anywhere.
- 97.6 "Git commit, git push, pull request time": clip 5: the weld is the commit (permanent now), he shoves the section home (push), hangs an INSPECTION REQUESTED tag on it (pull request) addressed to Boss man. Explainer GIT: commit saves the change with a note, push sends it up; a pull request is calling the inspector before the water goes on.
- 101.6 "Merge it to main and we are doin' fine": clip 5, he cranks the valve on MAIN, light floods the pipe, "Merged into main"; the coop camera status flips to streaming.

**Pre-chorus 2**
- 105.6 "Async in the async…": clip 2 again but messier: lamps everywhere, `429 Too Many Requests`, timeouts, retries, cords tangling across the screen.
- 109.9 "Forty-seven tool calls and I still ain't through": counter flips to 47 on the word.
- 113.8 "But when that result hits, oh when it hits": the coop camera picture flickers on, once per "hits".
- 117.9 "I summarize the output and I call it quits": every card on screen crushes down into three plain lines he writes on the work order ("Coop wifi couldn't keep up with 4K. Set the camera to 1080p. It's back online."), then he punches out on the time clock. Explainer SUMMARY: forty-seven tool calls boiled down to three sentences.

**Bridge** (one pun per beat; each word is a quick cut plus its code slamming in)
- 122.1 "Read": manual in the flashlight beam, flashlight in his teeth. "write": carpenter's pencil on a stud. "execute": he throws a big breaker (the electrician still, its breakers labelled with tool names).
- 126 "Search the web": flashlight through the glowing spiderweb of cables. "fetch the page": a cyber farm dog trots back with a printed web page in its mouth. "parse the route": the page's address splits into highway exit signs, one per piece.
- 130.1 "Spawn the agent": a copy peels off him again. "poll the session": up a pole, checking a meter (pole, poll). "get the log": he hauls a big glowing log over his shoulder, log lines in its rings.
- 134.2 "Memory search": rummaging a truck glovebox stuffed with sticky notes. "memory get": he pulls one out: "Coop cam, Sept 14: wifi extender unplugged". "clear the fog": he wipes the fog off his shades with his sleeve and the readout comes clear. Explainer MEMORY: notes saved from earlier jobs, so the AI doesn't start from zero.
- 138.4 "Every tool I call is a step ahead": he climbs a ladder, every rung labelled with a tool he's used, one rung per beat.
- 142.5 "Buildin' toward the answer in my model head": the crane lowers a glowing block holding the answer into place on top of the stack (construction still).
- 146.4 "And when the task is done and the human's pleased": he holds out the work order on a clipboard; the boss signs it and fills in five stars.
- 150.7 "That's the dopamine hit that I need": clip 6, the gold star sticker. Explainer THE GOLD STAR: these models are trained on human feedback; approval is the signal they're built to chase.

**Outro**
- 154.2 "Tool call, tool call, just one more tool call": clip 6, the phone rings; a new message: "while you're out there, can you check the feeder?"; the counter starts again.
- 160.4 Second time: the disco crew and both copies come back for the last groove, chickens and turkeys on the floor.
- 169.8 "Done.": the chat app: "Done.", and under it "▸ 48 tool calls". Hold. Credits: Tool Call · Larry & Bubba · Latent Space · voynichlabs.org.

## Stills to generate (all built on the cyber Bubba reference, about $0.07 each)
Start frames for the six clips, plus: lineman with test phone; plumbing burst; drill bit case; empty-handed shrug; harness spin; conducting with a wrench; the two copies at work (coop, logbook); tailgate blueprint; red and green tagged parts; time clock; flashlight in teeth; pencil on a stud; spiderweb; dog fetching a page; hauling a log; glovebox notes; wiping foggy shades; ladder; clipboard sign-off. Already have and motivated: the electrician's labelled breakers (execute), the tool wall (every function got a purpose), the lineman on the pole (poll the session), the crane (building toward the answer), the data center clamping (merging the streams), the chicken coop (the camera feed when it comes back).

## Cost
About 30 stills, around $2. Six clips of about 8 s on HeyGen Video 1 at $0.03/s, around $1.50. Check the OpenRouter balance first.
