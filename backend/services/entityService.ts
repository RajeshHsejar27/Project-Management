import { getDB } from "../database/database";
import { randomUUID } from "crypto";
import { deleteEntityRowsByEntityId } from "./entityRowService";

export function createEntity(
  workspaceId: string,
  name: string,
  type: string
) {
  const db = getDB();
  const id = randomUUID();

  const position_x = 200 + Math.random() * 600;
  const position_y = 200 + Math.random() * 400;
  const color = getTypeColor(type);

  db.prepare(`
    INSERT INTO entities
    (id, workspace_id, name, type, color, position_x, position_y, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, workspaceId, name, type, color, position_x, position_y, Date.now());

  return { id, workspace_id: workspaceId, name, type, color, position_x, position_y };
}

export function getEntities(workspaceId?: string) {
  const db = getDB();
  if (workspaceId) {
    return db.prepare(`
      SELECT * FROM entities WHERE workspace_id = ?
    `).all(workspaceId);
  }
  return db.prepare(`SELECT * FROM entities`).all();
}

export function updateEntityPosition(id: string, x: number, y: number) {
  const db = getDB();
  db.prepare(`
    UPDATE entities SET position_x = ?, position_y = ? WHERE id = ?
  `).run(x, y, id);
}

export function updateEntityColor(id: string, color: string) {
  const db = getDB();
  db.prepare(`
    UPDATE entities SET color = ? WHERE id = ?
  `).run(color, id);
}

export function updateEntityType(id: string, type: string) {
  const db = getDB();
  const color = getTypeColor(type);
  db.prepare(`
    UPDATE entities SET type = ?, color = ? WHERE id = ?
  `).run(type, color, id);
}

export function deleteEntity(id: string) {
  const db = getDB();
  deleteEntityRowsByEntityId(id);
  db.prepare(`DELETE FROM entities WHERE id = ?`).run(id);
  db.prepare(`
    DELETE FROM relationships WHERE source_id = ? OR target_id = ?
  `).run(id, id);
}

export function renameEntity(id: string, name: string) {
  const db = getDB();
  db.prepare(`
    UPDATE entities SET name = ? WHERE id = ?
  `).run(name, id);
}

export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    project: "#7c3aed",
    variable: "#3b82f6",
    database: "#22c55e",
    server: "#eab308",
    api: "#f97316",
    subscription: "#ec4899",
    account: "#06b6d4",
    hosting: "#6366f1",
    custom: "#64748b",
  };
  return colors[type] || colors["custom"];
}
