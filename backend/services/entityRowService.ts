import { getDB } from "../database/database";
import { randomUUID } from "crypto";

export function createEntityRow(
  entityId: string,
  rowKey: string,
  rowValue: string,
  orderIndex: number,
  isSecret: boolean = false
) {
  const db = getDB();
  const id = randomUUID();

  db.prepare(`
    INSERT INTO entity_rows
    (id, entity_id, row_key, row_value, is_secret, order_index, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, entityId, rowKey, rowValue, isSecret ? 1 : 0, orderIndex, Date.now());

  return { id, entity_id: entityId, row_key: rowKey, row_value: rowValue, is_secret: isSecret ? 1 : 0, order_index: orderIndex };
}

export function getEntityRows(entityId: string) {
  const db = getDB();
  return db.prepare(`
    SELECT * FROM entity_rows WHERE entity_id = ? ORDER BY order_index
  `).all(entityId);
}

export function updateEntityRow(
  id: string,
  rowKey: string,
  rowValue: string,
  isSecret?: boolean
) {
  const db = getDB();
  if (isSecret !== undefined) {
    db.prepare(`
      UPDATE entity_rows SET row_key = ?, row_value = ?, is_secret = ? WHERE id = ?
    `).run(rowKey, rowValue, isSecret ? 1 : 0, id);
  } else {
    db.prepare(`
      UPDATE entity_rows SET row_key = ?, row_value = ? WHERE id = ?
    `).run(rowKey, rowValue, id);
  }
}

export function updateEntityRowOrder(id: string, orderIndex: number) {
  const db = getDB();
  db.prepare(`
    UPDATE entity_rows SET order_index = ? WHERE id = ?
  `).run(orderIndex, id);
}

export function deleteEntityRow(id: string) {
  const db = getDB();
  db.prepare(`DELETE FROM entity_rows WHERE id = ?`).run(id);
}

export function deleteEntityRowsByEntityId(entityId: string) {
  const db = getDB();
  db.prepare(`DELETE FROM entity_rows WHERE entity_id = ?`).run(entityId);
}
