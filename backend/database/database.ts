import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let db: Database.Database;
const SCHEMA_VERSION = "2";

export function getDB() {
  if (!db) {
    const { app } = require("electron");
    const dbPath = path.join(app.getPath("userData"), "database.sqlite");
    console.log("DB Path:", dbPath);
    
    const needsRecreate = checkSchemaMismatch(dbPath);
    if (needsRecreate) {
      console.log("Old schema detected. Recreating database...");
      if (fs.existsSync(dbPath)) {
        fs.renameSync(dbPath, dbPath + ".backup-" + Date.now());
      }
    }
    
    db = new Database(dbPath);
    initializeTables(db);
  }
  return db;
}

function checkSchemaMismatch(dbPath: string): boolean {
  if (!fs.existsSync(dbPath)) return false;
  try {
    const tempDb = new Database(dbPath, { readonly: true });
    // Check if entities table has workspace_id column
    const cols = tempDb.prepare(`PRAGMA table_info(entities)`).all() as any[];
    tempDb.close();
    const hasWorkspaceId = cols.some((c) => c.name === "workspace_id");
    if (!hasWorkspaceId) {
      console.log("Schema mismatch: entities table missing workspace_id");
      return true;
    }
    // Check schema version in app_settings
    const tempDb2 = new Database(dbPath, { readonly: true });
    try {
      const row = tempDb2.prepare(`SELECT value FROM app_settings WHERE key = 'schema_version'`).get() as any;
      tempDb2.close();
      if (!row || row.value !== SCHEMA_VERSION) {
        console.log("Schema version mismatch. Expected:", SCHEMA_VERSION, "Got:", row?.value);
        return true;
      }
    } catch {
      tempDb2.close();
      return true;
    }
    return false;
  } catch (err) {
    console.log("Error checking schema:", err);
    return false;
  }
}

function initializeTables(db: Database.Database) {
  db.exec(`
    -- Workspaces (Project Tabs)
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#7c3aed',
      created_at INTEGER
    );

    -- Entities (Cards) belong to a workspace
    CREATE TABLE IF NOT EXISTS entities (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      color TEXT,
      position_x REAL,
      position_y REAL,
      created_at INTEGER
    );

    -- Entity Rows: Key-Value pairs
    CREATE TABLE IF NOT EXISTS entity_rows (
      id TEXT PRIMARY KEY,
      entity_id TEXT NOT NULL,
      row_key TEXT NOT NULL,
      row_value TEXT,
      is_secret INTEGER DEFAULT 0,
      order_index INTEGER,
      created_at INTEGER
    );

    -- Relationships between entities
    CREATE TABLE IF NOT EXISTS relationships (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      type TEXT DEFAULT 'related',
      created_at INTEGER
    );

    -- Trash (soft delete)
    CREATE TABLE IF NOT EXISTS trash (
      id TEXT PRIMARY KEY,
      item_type TEXT NOT NULL,
      item_data TEXT NOT NULL,
      deleted_at INTEGER
    );

    -- App settings
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Set schema version
  db.prepare(`
    INSERT INTO app_settings (key, value) VALUES ('schema_version', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(SCHEMA_VERSION);

  // Seed default workspace if none exists
  const defaultWorkspace = db.prepare(`SELECT id FROM workspaces LIMIT 1`).get() as any;
  if (!defaultWorkspace) {
    const { randomUUID } = require("crypto");
    db.prepare(`
      INSERT INTO workspaces (id, name, color, created_at)
      VALUES (?, ?, ?, ?)
    `).run(randomUUID(), "Default Workspace", "#7c3aed", Date.now());
    console.log("Default workspace created");
  }

  console.log("Database tables ready (schema v" + SCHEMA_VERSION + ")");
}
