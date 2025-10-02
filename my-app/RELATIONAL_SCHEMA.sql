-- Relational schema for the Citizen Reclamation app (SQLite)

PRAGMA foreign_keys = ON;

CREATE TABLE custom_type (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT (datetime('now'))
);

CREATE TABLE reclamation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  custom_type_id INTEGER,
  content TEXT NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'nouveau',
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now')),
  is_deleted INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES auth_user(id),
  FOREIGN KEY (custom_type_id) REFERENCES custom_type(id)
);

CREATE INDEX idx_reclamation_user ON reclamation(user_id);
CREATE INDEX idx_reclamation_status ON reclamation(status);
CREATE INDEX idx_reclamation_created ON reclamation(created_at);

CREATE TABLE photo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reclamation_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (reclamation_id) REFERENCES reclamation(id) ON DELETE CASCADE
);

CREATE INDEX idx_photo_reclamation ON photo(reclamation_id);
