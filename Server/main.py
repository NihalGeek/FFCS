
# --- Imports and setup ---
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import os

load_dotenv()
passwd = os.getenv("PASSWD")

con = mysql.connector.connect(
    host="127.0.0.1",
    port=3306,
    user="root",
    password=passwd,
    db="ffcs"
)

app = Flask(__name__)
CORS(app)

# --- Helper functions ---
def create_registration_table():
    cursor = con.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS registrations (
            id BIGINT PRIMARY KEY,
            student VARCHAR(255),
            subjects TEXT,
            time_slot VARCHAR(255),
            teacher VARCHAR(255),
            status VARCHAR(50),
            timestamp VARCHAR(255)
        )
    ''')
    con.commit()
    cursor.close()

def insert_registration(reg):
    cursor = con.cursor()
    # CREATE QUERY (#C#RUD)
    sql = '''
        INSERT INTO registrations (id, student, subjects, time_slot, teacher, status, timestamp)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    '''
    cursor.execute(sql, (
        reg['id'],
        reg['student'],
        ','.join(reg['subjects']) if isinstance(reg['subjects'], list) else reg['subjects'],
        reg['timeSlot'],
        reg['teacher'],
        reg['status'],
        reg['timestamp']
    ))
    con.commit()
    cursor.close()

# --- Ensure table is created before first request ---
@app.before_request
def setup():
    create_registration_table()

# --- API Endpoints ---
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    try:
        insert_registration(data)
        return jsonify({'success': True}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/registrations', methods=['GET'])
def get_registrations():
    cursor = con.cursor(dictionary=True)

    # READ QUERY (C#R#UD)
    cursor.execute('SELECT * FROM registrations')
    rows = cursor.fetchall()
    cursor.close()
    # Convert comma-separated subjects back to list
    for row in rows:
        if row.get('subjects'):
            row['subjects'] = row['subjects'].split(',')
    return jsonify(rows)

@app.route('/registration/status', methods=['POST'])
# Update (CR#U#D)
def update_registration_status():
    data = request.get_json()
    reg_id = data.get('id')
    new_status = data.get('status')
    if not reg_id or new_status not in ['approved', 'rejected']:
        return jsonify({'success': False, 'error': 'Invalid request'}), 400
    cursor = con.cursor()
    cursor.execute('UPDATE registrations SET status=%s WHERE id=%s', (new_status, reg_id))
    con.commit()
    cursor.close()
    return jsonify({'success': True})

# --- Main block ---
if __name__ == '__main__':
    create_registration_table()
    app.run(debug=True, host='0.0.0.0', port=5000)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    try:
        insert_registration(data)
        return jsonify({'success': True}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500




