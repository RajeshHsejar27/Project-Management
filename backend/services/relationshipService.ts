import { getDB } from "../database/database";
import { randomUUID } from "crypto";

export function createRelationship(
  sourceId: string,
  targetId: string,
  type: string
) {

  const db = getDB();

  // prevent duplicates
  const existing =
    db.prepare(`
      SELECT id FROM relationships
      WHERE source_id = ?
      AND target_id = ?
    `).get(sourceId, targetId);

  if (existing) {

    console.log("Relationship already exists");

    return existing;

  }

const id = randomUUID();


  db.prepare(`
    INSERT INTO relationships (
      id,
      source_id,
      target_id,
      type
    )
    VALUES (?, ?, ?, ?)
  `).run(id, sourceId, targetId, type);

  return {
    id,
    source_id: sourceId,
    target_id: targetId,
    type
  };

}



export function getRelationships() {

  const db = getDB();

  return db.prepare(`
    SELECT * FROM relationships
  `).all();

}
export function deleteRelationship(id: string)
{
  const db = getDB();

  db.prepare(`
    DELETE FROM relationships
    WHERE id = ?
  `).run(id);
}

export function validateRelationships()
{
  const db = getDB();

  db.prepare(`
    DELETE FROM relationships
    WHERE source_id NOT IN (
      SELECT id FROM entities
    )
    OR target_id NOT IN (
      SELECT id FROM entities
    )
  `).run();

  console.log("Relationships validated");
}
