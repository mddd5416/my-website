import http.server, socketserver, json, os

PORT = 8000
# التخزين تلقائياً في نفس مجلد السكريبت
DATA_FILE = os.path.join(os.path.dirname(__file__), 'data.json')

class SimpleStorage(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/get_data':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE, 'r', encoding='utf-8') as f:
                    self.wfile.write(f.read().encode('utf-8'))
            else: self.wfile.write(b"[]")
        else: super().do_GET()

    def do_POST(self):
        if self.path == '/save_data':
            length = int(self.headers['Content-Length'])
            data = self.rfile.read(length).decode('utf-8')
            with open(DATA_FILE, 'w', encoding='utf-8') as f:
                f.write(data)
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

print(f"الخادم يعمل: http://localhost:{PORT}")
socketserver.TCPServer(("", PORT), SimpleStorage).serve_forever()
