import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { testDatabase } from "../backend/database/database";
import { registerIPC } from "./ipcHandlers";


let mainWindow: BrowserWindow;

function createWindow() {

  mainWindow = new BrowserWindow({

    width: 1200,
    height: 800,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  });

  mainWindow.loadURL("http://localhost:5173");
}

app.whenReady().then(() => {

    registerIPC();

  createWindow();


//   ipcMain.handle("test-db", () => {
//     return testDatabase();
//   });

});
