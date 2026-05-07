import http.server, socketserver, json, os
from urllib.parse import urlparse, parse_qs

PORT = 8000

class MasterStorage(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if '/get_data' in self.path:
            query = parse_qs(urlparse(self.path).query)
            path = query.get('path', [None])[0]
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            if path and os.path.exists(path):
                with open(path, 'r', encoding='utf-8') as f:
                    self.wfile.write(f.read().encode('utf-8'))
            else: self.wfile.write(b"[]")
        else: super().do_GET()

    def do_POST(self):
        if self.path == '/save_data':
            length = int(self.headers['Content-Length'])
            data = json.loads(self.rfile.read(length).decode('utf-8'))
            path, content = data.get('path'), data.get('content')
            if path:
                os.makedirs(os.path.dirname(path), exist_ok=True) if os.path.dirname(path) else None
                with open(path, 'w', encoding='utf-8') as f:
                    json.dump(content, f, ensure_ascii=False, indent=2)
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

print(f"Server Active: http://localhost:{PORT}")
socketserver.TCPServer(("", PORT), MasterStorage).serve_forever()
