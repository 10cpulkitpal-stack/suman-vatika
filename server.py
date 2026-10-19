#!/usr/bin/env python3
"""
Suman Vatika - Local Development Server with Lead Capture API
Serves static assets and records wedding inquiries to leads.json
"""

import http.server
import socketserver
import json
import os
import sys
from datetime import datetime

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
LEADS_FILE = os.path.join(DIRECTORY, "leads.json")

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_POST(self):
        if self.path == "/api/enquire":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            
            try:
                lead_data = json.loads(post_data.decode("utf-8"))
                lead_data["server_received_at"] = datetime.now().isoformat()

                # Read existing leads
                leads = []
                if os.path.exists(LEADS_FILE):
                    try:
                        with open(LEADS_FILE, "r", encoding="utf-8") as f:
                            leads = json.load(f)
                    except Exception:
                        leads = []

                leads.append(lead_data)

                # Save back to leads.json
                with open(LEADS_FILE, "w", encoding="utf-8") as f:
                    json.dump(leads, f, indent=2, ensure_ascii=False)

                response_bytes = json.dumps({
                    "status": "success",
                    "message": "Inquiry recorded successfully",
                    "leadId": lead_data.get("id")
                }).encode("utf-8")

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Content-Length", str(len(response_bytes)))
                self.end_headers()
                self.wfile.write(response_bytes)
                print(f"[Lead Captured] {lead_data.get('name')} - {lead_data.get('phone')} for {lead_data.get('eventDate')}")

            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == "/api/leads":
            # API endpoint to view all captured leads
            leads = []
            if os.path.exists(LEADS_FILE):
                try:
                    with open(LEADS_FILE, "r", encoding="utf-8") as f:
                        leads = json.load(f)
                except Exception:
                    leads = []

            response_bytes = json.dumps(leads, indent=2).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(len(response_bytes)))
            self.end_headers()
            self.wfile.write(response_bytes)
        else:
            super().do_GET()

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"==================================================")
        print(f"  Suman Vatika Luxury Redesign Server Running")
        print(f"  URL: http://localhost:{PORT}")
        print(f"  Leads Database: {LEADS_FILE}")
        print(f"==================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")

if __name__ == "__main__":
    run_server()
