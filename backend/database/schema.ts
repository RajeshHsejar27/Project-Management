export const createTablesSQL = `

CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  data TEXT,
  position_x REAL,
  position_y REAL,
  created_at INTEGER
);


CREATE TABLE IF NOT EXISTS relationships (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  type TEXT,
  created_at INTEGER
);

`;
