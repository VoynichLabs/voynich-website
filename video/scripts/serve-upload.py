# Author: Claude Opus 5.5
# Date: 2026-10-04
# PURPOSE: Throwaway local file server for full-quality YouTube uploads (see the music-video skill,
#          references/youtube.md): serves video/out/ on 127.0.0.1 with the CORS and Private Network
#          Access headers YouTube Studio's page needs to fetch() a local file into its upload input.
# SRP/DRY check: Pass - replaces the ad-hoc server described in the skill notes; no other server exists here.
#
# Usage (from video/):  .venv/Scripts/python scripts/serve-upload.py [port]   (default 8765; Ctrl+C to stop)
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    root = Path(__file__).resolve().parent.parent / "out"
    ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=str(root))).serve_forever()
