# backend/database.py
import sqlite3
import os
import json
from datetime import datetime

# Database file path
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'food_history.db')

def ensure_directory_exists():
    """Ensure the database directory exists"""
    db_dir = os.path.dirname(DB_PATH)
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)

def setup_db():
    """Set up the SQLite database and create tables if they don't exist"""
    ensure_directory_exists()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create food_history table if it doesn't exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS food_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        food_name TEXT NOT NULL,
        quantity TEXT NOT NULL,
        nutrition_data TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()
    
    print(f"Database setup complete at {DB_PATH}")

def add_food_entry(food_name, quantity, nutrition_data):
    """Add a food entry to the database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    cursor.execute(
        'INSERT INTO food_history (food_name, quantity, nutrition_data, timestamp) VALUES (?, ?, ?, ?)',
        (food_name, quantity, nutrition_data, timestamp)
    )
    
    conn.commit()
    conn.close()
    
    print(f"Added food entry: {food_name}, {quantity}")
    return True

def get_food_history():
    """Get all food entries from the database"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM food_history ORDER BY timestamp DESC')
    rows = cursor.fetchall()
    
    # Convert rows to list of dictionaries
    history = []
    for row in rows:
        entry = {
            'id': row['id'],
            'food_name': row['food_name'],
            'quantity': row['quantity'],
            'nutrition_data': json.loads(row['nutrition_data']),
            'timestamp': row['timestamp']
        }
        history.append(entry)
    
    conn.close()
    return history