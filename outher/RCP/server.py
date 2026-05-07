from http.server import SimpleHTTPRequestHandler, HTTPServer
import json
import os

PORT = 8000
DATA_FILE = 'data.json'

# إنشاء ملف البيانات إذا لم يكن موجوداً
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'w') as f:
        json.dump([], f)

class MyHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/get_data':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            with open(DATA_FILE, 'r') as f:
                self.wfile.write(f.read().encode())
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/save_data':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            with open(DATA_FILE, 'w') as f:
                f.write(post_data.decode())
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

    def do_OPTIONS(self): # للسماح بالطلبات من المتصفح
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

print(f"Server started at http://localhost:{PORT}")
HTTPServer(('localhost', PORT), MyHandler).serve_forever()
