#!/usr/bin/env python3
"""
Germany Migration Intelligence Dashboard - Local Web & API Server
Serves static dashboard files and provides REST API endpoints.
Zero external dependencies (uses standard Python library).
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import urllib.parse

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
ETL_DIR = BASE_DIR / "etl"
PORT = int(os.getenv("PORT", 8080))

class DashboardHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def log_message(self, format, *args):
        # Clean logging
        sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # API Endpoints
        if path == "/runtime-config.js":
            body = b"window.DASHBOARD_RUNTIME = Object.freeze({ apiAvailable: true });\n"
            self.send_response(200)
            self.send_header("Content-Type", "application/javascript; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
        elif path == "/api/metadata":
            self.send_json_file(DATA_DIR / "metadata.json")
        elif path == "/api/annual":
            self.send_json_file(DATA_DIR / "destatis_migration_annual_totals.json")
        elif path == "/api/monthly":
            self.send_json_file(DATA_DIR / "destatis_migration_monthly.json")
        elif path == "/api/nationalities":
            self.send_json_file(DATA_DIR / "destatis_migration_nationalities.json")
        elif path == "/api/german-emigration":
            self.send_json_file(DATA_DIR / "destatis_german_emigration_destinations.json")
        elif path == "/api/states":
            self.send_json_file(DATA_DIR / "destatis_states_migration.json")
        elif path == "/api/naturalizations":
            self.send_json_file(DATA_DIR / "destatis_naturalizations.json")
        elif path == "/api/verification":
            self.send_json_file(DATA_DIR / "destatis_verification_claim.json")
        else:
            # Fallback to static files
            if path == "/":
                self.path = "/index.html"
            return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/trigger-refresh":
            try:
                res = subprocess.run([sys.executable, str(ETL_DIR / "scheduler.py"), "--once"],
                                     capture_output=True, text=True, timeout=60)
                if res.returncode == 0:
                    self.send_response_json(200, {"success": True, "message": "Data refreshed successfully from Destatis pipeline."})
                else:
                    self.send_response_json(500, {"success": False, "error": res.stderr})
            except Exception as e:
                self.send_response_json(500, {"success": False, "error": str(e)})
        else:
            self.send_error(404, "Endpoint not found")

    def send_json_file(self, filepath):
        if not filepath.exists():
            self.send_error(404, f"File not found: {filepath.name}")
            return
        with open(filepath, "rb") as f:
            content = f.read()
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(content)

    def send_response_json(self, code, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

def get_local_ip():
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.5)
        # doesn't need to be reachable, just triggers local interface selection
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def main():
    host = os.getenv("HOST", "0.0.0.0")
    server_address = (host, PORT)
    httpd = ThreadingHTTPServer(server_address, DashboardHandler)
    httpd.daemon_threads = True
    local_ip = get_local_ip()
    print("=" * 65)
    print("🇩🇪 Germany Migration Intelligence Dashboard (德国移民数据智能分析平台)")
    print("=" * 65)
    print(f"👉 本地浏览器访问:       http://localhost:{PORT} 或 http://127.0.0.1:{PORT}")
    print(f"📄 独立战略研报 (PDF):   http://localhost:{PORT}/findings.html")
    if local_ip != "127.0.0.1":
        print(f"🌐 同一局域网/Wi-Fi分享: http://{local_ip}:{PORT}")
    print(f"⚡ API 元数据接口:       http://localhost:{PORT}/api/metadata")
    print("=" * 65)
    print("提示: 按 Ctrl+C 可停止本地服务。如需离线分享，直接将文件夹打包即可，无需服务器。")
    print("=" * 65)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer shutting down gracefully.")
        httpd.server_close()

if __name__ == "__main__":
    main()
