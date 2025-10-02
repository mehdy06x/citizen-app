import sqlite3
import sys

DB='db.sqlite3'
try:
    conn=sqlite3.connect(DB)
    c=conn.cursor()
    c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='api_reclamation'")
    exists = bool(c.fetchone())
    print('table_exists:', exists)
    if not exists:
        sys.exit(0)
    c.execute('SELECT COUNT(*) FROM api_reclamation')
    total = c.fetchone()[0]
    print('count:', total)
    c.execute('SELECT id, author_id, type, status, created_at FROM api_reclamation ORDER BY created_at DESC LIMIT 20')
    rows = c.fetchall()
    if not rows:
        print('no rows')
    else:
        for r in rows:
            print(r)
except Exception as e:
    print('error:', e)
finally:
    try:
        conn.close()
    except:
        pass
