import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";
import { createTablesSQL } from "./schema";


let db: Database.Database;

export function getDB() {

  if (!db) {

    const dbPath = path.join(
      app.getPath("userData"),
      "data.db"
    );

    db = new Database(dbPath);
  

    initTables();
  }

  return db;
}

function initTables() {

 db.exec(createTablesSQL);

}

export function testDatabase() {

  const db = getDB();

  db.prepare(`
    INSERT INTO test (name)
    VALUES (?)
  `).run("Hello");

  return "Database working";
}
