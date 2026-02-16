
import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";

let db: Database.Database;

export function getDB()
{
  if (!db)
  {
    const dbPath =
      path.join(
        app.getPath("userData"),
        "database.sqlite"
      );

    console.log("DB Path:", dbPath);

    db =
      new Database(dbPath);

    initializeTables(db);
  }

  return db;
}


function initializeTables(db: Database.Database)
{
  db.exec(`

  CREATE TABLE IF NOT EXISTS entities
  (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    color TEXT,
    position_x REAL,
    position_y REAL,
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS relationships
  (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    type TEXT,
    created_at INTEGER
  );

  `);

  console.log("Database tables ready");
}
