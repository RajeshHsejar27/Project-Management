import { getDB } from "../database/database";

export function getSetting(key: string): string | null {
  const db = getDB();
  const row = db.prepare(`SELECT value FROM app_settings WHERE key = ?`).get(key) as any;
  return row ? row.value : null;
}

export function setSetting(key: string, value: string) {
  const db = getDB();
  db.prepare(`
    INSERT INTO app_settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}

export function getAllSettings() {
  const db = getDB();
  return db.prepare(`SELECT key, value FROM app_settings`).all();
}
