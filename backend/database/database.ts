import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";
import { createTablesSQL } from "./schema";


let db: Database.Database;

export function getDB() {

  if (!db) {

    const userDataPath =
      app.getPath("userData");

    const dbPath =
      path.join(userDataPath, "project-manager.db");

    console.log("DB PATH:", dbPath);

    db = new Database(dbPath);

    initTables();

  }

  return db;
}

function initTables() {

  // create base tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS entities (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
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
  `);


  // MIGRATION: add color column if missing
  try {

    db.prepare(`
      ALTER TABLE entities
      ADD COLUMN color TEXT DEFAULT '#1e1e1e'
    `).run();

    console.log("Color column added");

  }
  catch (err: any) {

    if (!err.message.includes("duplicate column")) {

      console.error(err);

    }

  }

}


export function testDatabase() {

  const db = getDB();

  db.prepare(`
    INSERT INTO test (name)
    VALUES (?)
  `).run("Hello");

  return "Database working";
}
