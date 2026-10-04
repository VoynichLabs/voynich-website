// Author: Claude Opus 5.5
// Date: 2026-10-04
// PURPOSE: Remotion CLI config for the music-video workspace (render defaults).
// SRP/DRY check: Pass - render settings live here only; per-song data lives in data/{slug}/.
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
Config.setOverwriteOutput(true);
