import fs from "fs";
import path from "path";
import { getDB } from "../database/database";
import { app } from "electron";
const WORKSPACE_PATH =
  path.join(process.cwd(), "workspace.json");


  //Autosave System
export function autosaveWorkspace()
{
  try
  {
    const workspacePath =
      path.join(
        process.cwd(),
        "workspace.json"
      );

    const data =
    {
      timestamp: Date.now()
    };

    fs.writeFileSync(
      workspacePath,
      JSON.stringify(
        data,
        null,
        2
      )
    );
  }
  catch(err)
  {
    console.error(
      "Autosave failed:",
      err
    );
  }
}



// Crash Recovery

// If app crashes → restore workspace.json


export function recoverWorkspace()
{
  if (!fs.existsSync(WORKSPACE_PATH))
    return null;

  const data =
    JSON.parse(
      fs.readFileSync(
        WORKSPACE_PATH,
        "utf-8"
      )
    );

  return data;
}

// Backup System

// Create periodic backups.
export function backupDatabase()
{
  try
  {
    const userData =
      app.getPath("userData");

    const dbPath =
      path.join(
        userData,
        "database.sqlite"
      );

    const backupDir =
      path.join(
        userData,
        "backups"
      );

    if (!fs.existsSync(backupDir))
      fs.mkdirSync(backupDir);

    const backupPath =
      path.join(
        backupDir,
        `backup-${Date.now()}.db`
      );

    fs.copyFileSync(
      dbPath,
      backupPath
    );

    console.log(
      "Backup created:",
      backupPath
    );
  }
  catch(err)
  {
    console.error(
      "Backup failed:",
      err
    );
  }
}