// import { app, BrowserWindow, ipcMain } from "electron";
// import path from "path";
// import { testDatabase } from "../backend/database/database";
// import { registerIPC } from "./ipcHandlers";

// import
// {
//   autosaveWorkspace,
//   backupDatabase
// }
// from "../backend/services/workspaceService";

// import
// {
//   validateRelationships
// }
// from "../backend/services/relationshipService";

// import { recoverWorkspace }
// from "../backend/services/workspaceService";


// const recovered =
//   recoverWorkspace();

// if (recovered)
// {
//   console.log(
//     "Recovered workspace:",
//     recovered.timestamp
//   );
// }

// let mainWindow: BrowserWindow;

// function createWindow() {

//   mainWindow = new BrowserWindow({

//     width: 1200,
//     height: 800,

//     webPreferences: {
//       preload: path.join(__dirname, "preload.js"),
//       contextIsolation: true,
//     nodeIntegration: false
//     }
//   });

//   mainWindow.loadURL("http://localhost:5173");
// }

// app.whenReady().then(() => {

//     registerIPC();

//   createWindow();


// //   ipcMain.handle("test-db", () => {
// //     return testDatabase();
// //   });

// });

// setInterval(() =>
// {
//   autosaveWorkspace();
// }, 2000);

// setInterval(() =>
// {
//   backupDatabase();
// }, 60000);

// setInterval(() =>
// {
//   validateRelationships();
// }, 5000);


import { app, BrowserWindow } from "electron";
import path from "path";

import { registerIPC } from "./ipcHandlers";

import
{
  autosaveWorkspace,
  backupDatabase,
  recoverWorkspace
}
from "../backend/services/workspaceService";

import
{
  validateRelationships
}
from "../backend/services/relationshipService";


let mainWindow: BrowserWindow;


// =========================
// CREATE WINDOW
// =========================

function createWindow()
{
  mainWindow =
    new BrowserWindow({

      width: 1200,
      height: 800,

      webPreferences:
      {
        preload:
          path.join(
            __dirname,
            "preload.js"
          ),

        contextIsolation: true,
        nodeIntegration: false
      }

    });

  mainWindow.loadURL(
    "http://localhost:5173"
  );
}


// =========================
// APP READY
// =========================

app.whenReady().then(() =>
{

  // IPC
  registerIPC();


  // Crash Recovery
  const recovered =
    recoverWorkspace();

  if (recovered)
  {
    console.log(
      "Recovered workspace:",
      new Date(
        recovered.timestamp
      ).toLocaleString()
    );
  }


  // Create window
  createWindow();


  // =========================
  // AUTOSAVE TIMER
  // =========================

  setInterval(() =>
  {
    autosaveWorkspace();
  }, 2000);


  // =========================
  // BACKUP TIMER
  // =========================

  setInterval(() =>
  {
    backupDatabase();
  }, 60000);


  // =========================
  // RELATIONSHIP VALIDATION
  // =========================

  setInterval(() =>
  {
    validateRelationships();
  }, 30000);


});


// =========================
// MAC CLOSE BEHAVIOR
// =========================

app.on("window-all-closed", () =>
{
  if (process.platform !== "darwin")
    app.quit();
});
