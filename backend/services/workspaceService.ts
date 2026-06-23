import fs from "fs";
import path from "path";
import { getDB } from "../database/database";
import { app } from "electron";
import { randomUUID } from "crypto";

export function createWorkspace(name: string, color?: string) {
  const db = getDB();
  const id = randomUUID();
  db.prepare(`
    INSERT INTO workspaces (id, name, color, created_at)
    VALUES (?, ?, ?, ?)
  `).run(id, name, color || "#7c3aed", Date.now());
  return { id, name, color: color || "#7c3aed" };
}

export function getWorkspaces() {
  const db = getDB();
  return db.prepare(`SELECT * FROM workspaces ORDER BY created_at`).all();
}

export function updateWorkspace(id: string, name: string, color?: string) {
  const db = getDB();
  if (color) {
    db.prepare(`UPDATE workspaces SET name = ?, color = ? WHERE id = ?`).run(name, color, id);
  } else {
    db.prepare(`UPDATE workspaces SET name = ? WHERE id = ?`).run(name, id);
  }
}

export function deleteWorkspace(id: string) {
  const db = getDB();
  db.prepare(`DELETE FROM workspaces WHERE id = ?`).run(id);
  // entities and rows cascade via delete triggers, relationships validated below
  validateRelationships();
}

export function setActiveWorkspace(id: string) {
  const db = getDB();
  db.prepare(`
    INSERT INTO app_settings (key, value) VALUES ('active_workspace', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(id);
}

export function getActiveWorkspace(): string | null {
  const db = getDB();
  const row = db.prepare(`SELECT value FROM app_settings WHERE key = 'active_workspace'`).get() as any;
  return row ? row.value : null;
}

function validateRelationships() {
  const db = getDB();
  db.prepare(`
    DELETE FROM relationships
    WHERE source_id NOT IN (SELECT id FROM entities)
    OR target_id NOT IN (SELECT id FROM entities)
  `).run();
}

// Autosave
export function autosaveWorkspace() {
  try {
    const workspacePath = path.join(process.cwd(), "workspace.json");
    const data = { timestamp: Date.now() };
    fs.writeFileSync(workspacePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Autosave failed:", err);
  }
}

export function recoverWorkspace() {
  const workspacePath = path.join(process.cwd(), "workspace.json");
  if (!fs.existsSync(workspacePath)) return null;
  return JSON.parse(fs.readFileSync(workspacePath, "utf-8"));
}

// Backup
export function backupDatabase() {
  try {
    const userData = app.getPath("userData");
    const dbPath = path.join(userData, "database.sqlite");
    const backupDir = path.join(userData, "backups");
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
    const backupPath = path.join(backupDir, `backup-${Date.now()}.db`);
    fs.copyFileSync(dbPath, backupPath);
    console.log("Backup created:", backupPath);
  } catch (err) {
    console.error("Backup failed:", err);
  }
}
