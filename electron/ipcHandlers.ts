import { ipcMain, dialog } from "electron";
import { getDB } from "../backend/database/database";

import {
  createEntity,
  getEntities,
  updateEntityPosition,
  updateEntityColor,
  updateEntityType,
  deleteEntity,
  renameEntity
} from "../backend/services/entityService";

import {
  createRelationship,
  getRelationships,
  deleteRelationship,
  renameRelationship
} from "../backend/services/relationshipService";

import {
  listBackups,
  restoreBackup
} from "../backend/services/backupRestoreService";

import {
  createEntityRow,
  getEntityRows,
  updateEntityRow,
  updateEntityRowOrder,
  deleteEntityRow
} from "../backend/services/entityRowService";

import {
  createWorkspace,
  getWorkspaces,
  updateWorkspace,
  deleteWorkspace,
  setActiveWorkspace,
  getActiveWorkspace
} from "../backend/services/workspaceService";

import {
  getSetting,
  setSetting,
  getAllSettings
} from "../backend/services/settingsService";

import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";

export function registerIPC() {
  // =========================
  // WORKSPACE HANDLERS
  // =========================
  ipcMain.handle("workspace:create", (_, name: string, color?: string) =>
    createWorkspace(name, color)
  );
  ipcMain.handle("workspace:list", () => getWorkspaces());
  ipcMain.handle("workspace:update", (_, id: string, name: string, color?: string) => {
    updateWorkspace(id, name, color);
    return { id, name, color };
  });
  ipcMain.handle("workspace:delete", (_, id: string) => {
    deleteWorkspace(id);
    return { id };
  });
  ipcMain.handle("workspace:setActive", (_, id: string) => {
    setActiveWorkspace(id);
    return { id };
  });
  ipcMain.handle("workspace:getActive", () => getActiveWorkspace());

  // =========================
  // ENTITY HANDLERS
  // =========================
  ipcMain.handle("entity:create", (_, workspaceId: string, name: string, type: string) =>
    createEntity(workspaceId, name, type)
  );
  ipcMain.handle("entity:list", (_, workspaceId?: string) => getEntities(workspaceId));
  ipcMain.handle("entity:updatePosition", (_, id: string, x: number, y: number) =>
    updateEntityPosition(id, x, y)
  );
  ipcMain.handle("entity:updateColor", (_, id: string, color: string) =>
    updateEntityColor(id, color)
  );
  ipcMain.handle("entity:updateType", (_, id: string, type: string) =>
    updateEntityType(id, type)
  );
  ipcMain.handle("entity:delete", (_, id: string) => deleteEntity(id));
  ipcMain.handle("entity:rename", (_, id: string, name: string) => {
    console.log("IPC rename:", id, name);
    renameEntity(id, name);
    return { id, name };
  });

  // =========================
  // ENTITY ROW HANDLERS
  // =========================
  ipcMain.handle("entityRow:create", (_, entityId: string, rowKey: string, rowValue: string, orderIndex: number, isSecret?: boolean) =>
    createEntityRow(entityId, rowKey, rowValue, orderIndex, isSecret)
  );
  ipcMain.handle("entityRow:list", (_, entityId: string) => getEntityRows(entityId));
  ipcMain.handle("entityRow:update", (_, id: string, rowKey: string, rowValue: string, isSecret?: boolean) => {
    updateEntityRow(id, rowKey, rowValue, isSecret);
    return { id, rowKey, rowValue, isSecret };
  });
  ipcMain.handle("entityRow:updateOrder", (_, id: string, orderIndex: number) => {
    updateEntityRowOrder(id, orderIndex);
    return { id, orderIndex };
  });
  ipcMain.handle("entityRow:delete", (_, id: string) => {
    deleteEntityRow(id);
    return { id };
  });

  // =========================
  // RELATIONSHIP HANDLERS
  // =========================
  ipcMain.handle("relationship:create", (_, sourceId, targetId, type) => {
    console.log("Creating relationship:", sourceId, "→", targetId);
    return createRelationship(sourceId, targetId, type);
  });
  ipcMain.handle("relationship:list", () => getRelationships());
  ipcMain.handle("relationship:delete", (_, id: string) => {
    console.log("Deleting relationship:", id);
    deleteRelationship(id);
    return { id };
  });
  ipcMain.handle("relationship:rename", (_, id: string, type: string) => {
    console.log("IPC relationship rename:", id, type);
    return renameRelationship(id, type);
  });

  // =========================
  // BACKUP HANDLERS
  // =========================
  ipcMain.handle("backup:list", () => listBackups());
  ipcMain.handle("backup:restore", (_, filename: string) =>
    restoreBackup(filename)
  );

  // =========================
  // SETTINGS HANDLERS
  // =========================
  ipcMain.handle("settings:get", (_, key: string) => getSetting(key));
  ipcMain.handle("settings:set", (_, key: string, value: string) => {
    setSetting(key, value);
    return { key, value };
  });
  ipcMain.handle("settings:getAll", () => getAllSettings());

  // =========================
  // DATA EXPORT/IMPORT HANDLERS
  // =========================
  ipcMain.handle("data:export", async (_, workspaceId?: string, entityIds?: string[]) => {
    const db = getDB();
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: "project-manager-export.xlsx",
      filters: [{ name: "Excel", extensions: ["xlsx"] }]
    });
    if (!filePath) return null;

    let entities: any[] = [];
    if (entityIds && entityIds.length > 0) {
      const placeholders = entityIds.map(() => "?").join(",");
      entities = db.prepare(`SELECT * FROM entities WHERE id IN (${placeholders})`).all(...entityIds);
    } else if (workspaceId) {
      entities = db.prepare(`SELECT * FROM entities WHERE workspace_id = ?`).all(workspaceId);
    } else {
      entities = db.prepare(`SELECT * FROM entities`).all();
    }

    const wb = XLSX.utils.book_new();
    for (const entity of entities) {
      const rows = db.prepare(`SELECT * FROM entity_rows WHERE entity_id = ? ORDER BY order_index`).all(entity.id) as any[];
      const sheetData: any[] = [
        [`Card: ${entity.name}`, `Type: ${entity.type}`, `Color: ${entity.color || ""}`],
        ["Key", "Value", "Is Secret"]
      ];
      for (const row of rows) {
        sheetData.push([row.row_key, row.row_value, row.is_secret ? "Yes" : "No"]);
      }
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      const safeName = entity.name.replace(/[*?:\/\[\]]/g, "").substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, safeName || "Card");
    }

    XLSX.writeFile(wb, filePath);
    return filePath;
  });

  ipcMain.handle("data:import", async (_, filePath: string, targetWorkspaceId?: string) => {
    const db = getDB();
    const { randomUUID } = await import("crypto");
    const wb = XLSX.readFile(filePath);
    let created = 0;
    let skipped = 0;

    const wsId = targetWorkspaceId || (db.prepare(`SELECT id FROM workspaces LIMIT 1`).get() as any)?.id;
    if (!wsId) return { created: 0, skipped: 0 };

    for (const sheetName of wb.SheetNames) {
      const ws = wb.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];
      if (!data || data.length < 2) { skipped++; continue; }

      const headerRow = data[0] || [];
      const cardName = (headerRow[0] || sheetName).replace("Card: ", "");
      const cardType = (headerRow[1] || "custom").replace("Type: ", "");
      const cardColor = (headerRow[2] || "").replace("Color: ", "");

      const entityId = randomUUID();
      db.prepare(`
        INSERT INTO entities (id, workspace_id, name, type, color, position_x, position_y, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(entityId, wsId, cardName, cardType, cardColor || null, 200 + Math.random() * 400, 200 + Math.random() * 400, Date.now());

      const keyIdx = data[1]?.indexOf("Key") ?? 0;
      const valIdx = data[1]?.indexOf("Value") ?? 1;
      const secretIdx = data[1]?.indexOf("Is Secret") ?? -1;

      for (let i = 2; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        const rowKey = row[keyIdx] || "";
        const rowValue = row[valIdx] || "";
        const isSecret = secretIdx >= 0 ? (row[secretIdx] === "Yes" || row[secretIdx] === "1") : false;
        db.prepare(`
          INSERT INTO entity_rows (id, entity_id, row_key, row_value, is_secret, order_index, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(randomUUID(), entityId, rowKey, rowValue, isSecret ? 1 : 0, i - 2, Date.now());
      }
      created++;
    }
    return { created, skipped };
  });
}
