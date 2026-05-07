import http.server
import socketserver
import json
import os
from urllib.parse import urlparse, parse_qs

PORT = 8000

class SmartStorageHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if '/get_data' in self.path:
            query = parse_qs(urlparse(self.path).query)
            file_path = query.get('path', [None])[0]
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            if file_path and os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    self.wfile.write(f.read().encode('utf-8'))
            else:
                self.wfile.write(b"[]")
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/save_data':
            content_length = int(self.headers['Content-Length'])
            data = json.loads(self.rfile.read(content_length).decode('utf-8'))
            
            file_path = data.get('path')
            shortcuts = data.get('shortcuts')

            if file_path:
                # إنشاء المجلدات إذا لم تكن موجودة
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(shortcuts, f, ensure_ascii=False, indent=2)
                
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

print(f"الخادم يعمل الآن على: http://localhost:{PORT}")
socketserver.TCPServer(("", PORT), SmartStorageHandler).serve_forever()
