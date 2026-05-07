import http.server, socketserver, json, os, tkinter as tk
from tkinter import filedialog

PORT = 8000

class PickerStorage(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/pick_file':
            # فتح نافذة اختيار الملف للمستخدم
            root = tk.Tk()
            root.withdraw()
            root.attributes("-topmost", True)
            file_path = filedialog.askopenfilename(filetypes=[("JSON files", "*.json")])
            root.destroy()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"path": file_path}).encode())

        elif '/get_data' in self.path:
            from urllib.parse import urlparse, parse_qs
            path = parse_qs(urlparse(self.path).query).get('path', [None])[0]
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            if path and os.path.exists(path):
                with open(path, 'r', encoding='utf-8') as f:
                    self.wfile.write(f.read().encode('utf-8'))
            else: self.wfile.write(b"[]")

    def do_POST(self):
        if self.path == '/save_data':
            length = int(self.headers['Content-Length'])
            data = json.loads(self.rfile.read(length).decode('utf-8'))
            path, content = data.get('path'), data.get('content')
            if path:
                with open(path, 'w', encoding='utf-8') as f:
                    json.dump(content, f, ensure_ascii=False, indent=2)
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

print(f"الخادم يعمل: http://localhost:{PORT}")
socketserver.TCPServer(("", PORT), PickerStorage).serve_forever()
