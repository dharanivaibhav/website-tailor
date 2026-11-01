import os
import sqlite3
import random
import string
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "tailor_shop.db")

app = Flask(__name__, static_folder=BASE_DIR, static_url_path="")
CORS(app)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            service TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            notes TEXT,
            status TEXT DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()

    # Seed sample records if table is completely empty
    cursor.execute("SELECT COUNT(*) FROM appointments")
    if cursor.fetchone()[0] == 0:
        sample_data = [
            ("DHT-4821", "Anitha Sharma", "9876543210", "Blouse Stitching", "2026-10-25", "Morning (10:00 AM - 1:00 PM)", "Aari work blouse with boat neck", "Confirmed"),
            ("DHT-5192", "Meenakshi Sundaram", "9845123789", "Chudidar & Salwar", "2026-10-26", "Afternoon (1:00 PM - 4:00 PM)", "Anarkali style with lining", "Pending"),
            ("DHT-6304", "Deepa Krishnan", "9765432109", "Kurti & Dress", "2026-10-24", "Evening (4:00 PM - 7:30 PM)", "Daily wear cotton kurti fitting", "Completed")
        ]
        cursor.executemany('''
            INSERT INTO appointments (booking_code, name, phone, service, date, time, notes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', sample_data)
        conn.commit()

    conn.close()

# Initialize DB tables
init_db()

# --- Static Frontend Serving Routes ---

@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")

@app.route("/admin")
def admin():
    return send_from_directory(BASE_DIR, "admin.html")

# --- Backend REST API Endpoints ---

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "online",
        "service": "Dharani Women's Tailors Backend API",
        "timestamp": datetime.now().isoformat()
    })

@app.route("/api/appointments", methods=["GET"])
def get_appointments():
    status = request.args.get("status", "").strip()
    search = request.args.get("search", "").strip()

    query = "SELECT * FROM appointments WHERE 1=1"
    params = []

    if status and status.lower() != "all":
        query += " AND status = ?"
        params.append(status)

    if search:
        query += " AND (name LIKE ? OR phone LIKE ? OR booking_code LIKE ? OR service LIKE ?)"
        wildcard = f"%{search}%"
        params.extend([wildcard, wildcard, wildcard, wildcard])

    query += " ORDER BY id DESC"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    appointments = [dict(row) for row in rows]
    return jsonify({"success": True, "count": len(appointments), "appointments": appointments})

@app.route("/api/appointments", methods=["POST"])
def create_appointment():
    data = request.get_json(force=True, silent=True) or request.form

    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    service = data.get("service", "").strip()
    date = data.get("date", "").strip()
    time = data.get("time", "").strip()
    notes = data.get("notes", "").strip()

    if not name or not phone or not service or not date or not time:
        return jsonify({
            "success": False,
            "error": "Missing required fields (name, phone, service, date, time)"
        }), 400

    # Generate unique booking code
    booking_code = f"DHT-{random.randint(1000, 9999)}"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO appointments (booking_code, name, phone, service, date, time, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
    ''', (booking_code, name, phone, service, date, time, notes))
    appointment_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Appointment booked successfully!",
        "booking": {
            "id": appointment_id,
            "booking_code": booking_code,
            "name": name,
            "phone": phone,
            "service": service,
            "date": date,
            "time": time,
            "notes": notes,
            "status": "Pending"
        }
    }), 201

@app.route("/api/appointments/<int:id>", methods=["PATCH"])
def update_appointment_status(id):
    data = request.get_json(force=True, silent=True) or {}
    new_status = data.get("status", "").strip()

    valid_statuses = ["Pending", "Confirmed", "Completed", "Cancelled"]
    if new_status not in valid_statuses:
        return jsonify({
            "success": False,
            "error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        }), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE appointments SET status = ? WHERE id = ?", (new_status, id))
    conn.commit()
    affected = cursor.rowcount
    conn.close()

    if affected == 0:
        return jsonify({"success": False, "error": "Appointment not found"}), 404

    return jsonify({"success": True, "message": f"Status updated to {new_status}"})

@app.route("/api/appointments/<int:id>", methods=["DELETE"])
def delete_appointment(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM appointments WHERE id = ?", (id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()

    if affected == 0:
        return jsonify({"success": False, "error": "Appointment not found"}), 404

    return jsonify({"success": True, "message": "Appointment deleted successfully"})

@app.route("/api/stats", methods=["GET"])
def get_stats():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM appointments")
    total = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM appointments WHERE status = 'Pending'")
    pending = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM appointments WHERE status = 'Confirmed'")
    confirmed = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM appointments WHERE status = 'Completed'")
    completed = cursor.fetchone()[0]

    cursor.execute("SELECT service, COUNT(*) as count FROM appointments GROUP BY service")
    services = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return jsonify({
        "success": True,
        "stats": {
            "total": total,
            "pending": pending,
            "confirmed": confirmed,
            "completed": completed,
            "services": services
        }
    })

@app.route("/api/contact", methods=["POST"])
def submit_contact():
    data = request.get_json(force=True, silent=True) or request.form
    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    email = data.get("email", "").strip()
    message = data.get("message", "").strip()

    if not name or not message:
        return jsonify({"success": False, "error": "Name and message are required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO inquiries (name, phone, email, message)
        VALUES (?, ?, ?, ?)
    ''', (name, phone, email, message))
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Inquiry received successfully!"}), 201

# --- Admin Authentication ---

ADMIN_CREDENTIALS = {
    "email": "dharanitailors@gmail.com",
    "password": "dharani@2006"
}

@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json(force=True, silent=True) or request.form or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    if email == ADMIN_CREDENTIALS["email"].lower() and password == ADMIN_CREDENTIALS["password"]:
        return jsonify({
            "success": True,
            "message": "Authentication successful",
            "admin": {
                "email": ADMIN_CREDENTIALS["email"],
                "role": "Administrator",
                "name": "Dharani Admin"
            }
        })
    else:
        return jsonify({
            "success": False,
            "error": "Invalid email or password. Please check your credentials."
        }), 401

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f" * Dharani Tailors Server running at http://127.0.0.1:{port}")
    app.run(host="127.0.0.1", port=port, debug=False)
