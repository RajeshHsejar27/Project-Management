import { contextBridge, ipcRenderer } from "electron";

// Workspace API
contextBridge.exposeInMainWorld("workspaceAPI", {
  create: (name: string, color?: string) =>
    ipcRenderer.invoke("workspace:create", name, color),
  list: () => ipcRenderer.invoke("workspace:list"),
  update: (id: string, name: string, color?: string) =>
    ipcRenderer.invoke("workspace:update", id, name, color),
  delete: (id: string) => ipcRenderer.invoke("workspace:delete", id),
  setActive: (id: string) => ipcRenderer.invoke("workspace:setActive", id),
  getActive: () => ipcRenderer.invoke("workspace:getActive"),
});

// Entity API
contextBridge.exposeInMainWorld("entityAPI", {
  create: (workspaceId: string, name: string, type: string) =>
    ipcRenderer.invoke("entity:create", workspaceId, name, type),
  list: (workspaceId?: string) => ipcRenderer.invoke("entity:list", workspaceId),
  updatePosition: (id: string, x: number, y: number) =>
    ipcRenderer.invoke("entity:updatePosition", id, x, y),
  updateColor: (id: string, color: string) =>
    ipcRenderer.invoke("entity:updateColor", id, color),
  updateType: (id: string, type: string) =>
    ipcRenderer.invoke("entity:updateType", id, type),
  delete: (id: string) => ipcRenderer.invoke("entity:delete", id),
  rename: (id: string, name: string) =>
    ipcRenderer.invoke("entity:rename", id, name),
});

// Entity Row API
contextBridge.exposeInMainWorld("entityRowAPI", {
  create: (entityId: string, rowKey: string, rowValue: string, orderIndex: number, isSecret?: boolean) =>
    ipcRenderer.invoke("entityRow:create", entityId, rowKey, rowValue, orderIndex, isSecret),
  list: (entityId: string) => ipcRenderer.invoke("entityRow:list", entityId),
  update: (id: string, rowKey: string, rowValue: string, isSecret?: boolean) =>
    ipcRenderer.invoke("entityRow:update", id, rowKey, rowValue, isSecret),
  updateOrder: (id: string, orderIndex: number) =>
    ipcRenderer.invoke("entityRow:updateOrder", id, orderIndex),
  delete: (id: string) => ipcRenderer.invoke("entityRow:delete", id),
});

// Relationship API
contextBridge.exposeInMainWorld("relationshipAPI", {
  create: (sourceId: string, targetId: string, type: string) =>
    ipcRenderer.invoke("relationship:create", sourceId, targetId, type),
  list: () => ipcRenderer.invoke("relationship:list"),
  delete: (id: string) => ipcRenderer.invoke("relationship:delete", id),
  rename: (id: string, type: string) =>
    ipcRenderer.invoke("relationship:rename", id, type),
});

// Backup API
contextBridge.exposeInMainWorld("backupAPI", {
  list: () => ipcRenderer.invoke("backup:list"),
  restore: (filename: string) => ipcRenderer.invoke("backup:restore", filename),
});

// Data API
contextBridge.exposeInMainWorld("dataAPI", {
  exportCards: (workspaceId?: string, entityIds?: string[]) =>
    ipcRenderer.invoke("data:export", workspaceId, entityIds),
  importCards: (filePath: string, targetWorkspaceId?: string) =>
    ipcRenderer.invoke("data:import", filePath, targetWorkspaceId),
});

// Settings API
contextBridge.exposeInMainWorld("settingsAPI", {
  get: (key: string) => ipcRenderer.invoke("settings:get", key),
  set: (key: string, value: string) => ipcRenderer.invoke("settings:set", key, value),
  getAll: () => ipcRenderer.invoke("settings:getAll"),
});
