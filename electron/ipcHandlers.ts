import { ipcMain } from "electron";

import {
  createEntity,
  getEntities,
  updateEntityPosition,
  updateEntityColor,
  deleteEntity,
  renameEntity
} from "../backend/services/entityService";

import {
  createRelationship,
  getRelationships,deleteRelationship
} from "../backend/services/relationshipService";

export function registerIPC() {
  // =========================
  // ENTITY HANDLERS
  // =========================

  ipcMain.handle("entity:create", (_, name: string, type: string) =>
    createEntity(name, type)
  );

  ipcMain.handle("entity:list", () => getEntities());

  ipcMain.handle(
    "entity:updatePosition",
    (_, id: string, x: number, y: number) => updateEntityPosition(id, x, y)
  );

  // =========================
  // RELATIONSHIP HANDLERS
  // =========================

  ipcMain.handle("relationship:create", (_, sourceId, targetId, type) => {
    console.log("Creating relationship:", sourceId, "→", targetId);

    return createRelationship(sourceId, targetId, type);
  });

  ipcMain.handle("relationship:list", () => getRelationships());

  ipcMain.handle("entity:updateColor", (_, id: string, color: string) => {
    console.log("IPC update color:", id, color);

    return updateEntityColor(id, color);
  });

  ipcMain.handle("entity:delete", (_, id: string) => deleteEntity(id));

  ipcMain.handle("entity:rename", (_, id: string, name: string) => {
    console.log("Renaming entity:", id, "→", name);

    return renameEntity(id, name);
  });

  ipcMain.handle(
  "relationship:delete",
  (_, id: string) => {

    console.log(
      "Deleting relationship:",
      id
    );

    return deleteRelationship(id);

  }
);

}
