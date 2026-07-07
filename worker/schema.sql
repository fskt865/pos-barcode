-- Shared registry of every code ever issued. The PRIMARY KEY makes each code
-- unique globally; an INSERT of an already-seen code fails atomically.
CREATE TABLE IF NOT EXISTS issued_codes (
  code       TEXT PRIMARY KEY,
  created_at TEXT DEFAULT (datetime('now'))
);
