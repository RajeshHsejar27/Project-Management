import { getDB } from "../database/database";
import { randomUUID } from "crypto";

export function createEntity(
  name: string,
  type: string
) {

  const db = getDB();

  const id = randomUUID();

  // generate position HERE (backend source of truth)
  const position_x =
    200 + Math.random() * 600;

  const position_y =
    200 + Math.random() * 400;

  // default color
  const color = "#1e1e1e";

  db.prepare(`
    INSERT INTO entities
    (
      id,
      name,
      type,
      color,
      position_x,
      position_y,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?,?)
  `).run(
    id,
    name,
    type, color,
    position_x,
    position_y,
    Date.now()
  );


  console.log(
    "Created entity:",
    id,
    position_x,
    position_y
  );


  return {
    id,
    name,
    type, color,
    position_x,
    position_y
  };

}

export function getEntities() {

  const db = getDB();

  return db.prepare(`
    SELECT * FROM entities
  `).all();

}


export function updateEntityPosition(
  id: string,
  x: number,
  y: number
) {

  const db = getDB();

  db.prepare(`
    UPDATE entities
    SET position_x = ?, position_y = ?
    WHERE id = ?
  `).run(x, y, id);

}

// export function updateEntityColor(
//   id: string,
//   color: string
// ) {

//   const db = getDB();

//   db.prepare(`
//     UPDATE entities
//     SET color = ?
//     WHERE id = ?
//   `).run(color, id);

// }

export function updateEntityColor(
  id: string,
  color: string
) {

  const db = getDB();

  db.prepare(`
    UPDATE entities
    SET color = ?
    WHERE id = ?
  `).run(color, id);

}


export function deleteEntity(id: string) {

  const db = getDB();

  db.prepare(`
    DELETE FROM entities
    WHERE id = ?
  `).run(id);

  db.prepare(`
    DELETE FROM relationships
    WHERE source_id = ?
    OR target_id = ?
  `).run(id, id);

}

export function renameEntity(
  id: string,
  name: string
) {

  const db = getDB();

  console.log("DB rename:", id, name);

  db.prepare(`
    UPDATE entities
    SET name = ?
    WHERE id = ?
  `).run(name, id);

}

