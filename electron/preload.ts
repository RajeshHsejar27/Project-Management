import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("entityAPI", {
  create: (name: string, type: string) =>
    ipcRenderer.invoke("entity:create", name, type),

  list: () => ipcRenderer.invoke("entity:list"),

  updatePosition: (id: string, x: number, y: number) =>
    ipcRenderer.invoke("entity:updatePosition", id, x, y),

  updateColor: (id: string, color: string) =>
    ipcRenderer.invoke("entity:updateColor", id, color),

  delete: (id: string) => ipcRenderer.invoke("entity:delete", id),

  rename: (id: string, name: string) =>
    ipcRenderer.invoke("entity:rename", id, name),
});

contextBridge.exposeInMainWorld("relationshipAPI", {
  create: (sourceId: string, targetId: string, type: string) =>
    ipcRenderer.invoke("relationship:create", sourceId, targetId, type),

  list: () => ipcRenderer.invoke("relationship:list"),
  delete: (id: string) => ipcRenderer.invoke("relationship:delete", id),
});
