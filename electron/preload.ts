import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("entityAPI", {

  create: (name: string, type: string) =>
    ipcRenderer.invoke("entity:create", name, type),

  list: () =>
    ipcRenderer.invoke("entity:list")

});
