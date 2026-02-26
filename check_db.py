import sqlite3
import os

db_paths = [
    'backend/managemind.db',
    'managemind.db',
    'backend/app/managemind.db'
]

for path in db_paths:
    if os.path.exists(path):
        print(f"\n🔍 Checking {path}...")
        try:
            conn = sqlite3.connect(path)
            cur = conn.cursor()
            cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = cur.fetchall()
            print(f"  Tables: {[t[0] for t in tables]}")
            
            if ('mcqs',) in tables or 'mcqs' in [t[0] for t in tables]:
                cur.execute("SELECT COUNT(*) FROM mcqs")
                count = cur.fetchone()[0]
                print(f"  MCQ Count: {count}")
                
                if count > 0:
                    cur.execute("SELECT topic, unit FROM mcqs LIMIT 5")
                    print(f"  Sample Topics: {cur.fetchall()}")
            conn.close()
        except Exception as e:
            print(f"  ❌ Error: {e}")
    else:
        print(f"\n🚫 {path} does not exist.")
