import fs from "fs";
import path from "path";
import { app } from "electron";

function getBackupDir()
{
  return path.join(
    app.getPath("userData"),
    "backups"
  );
}

function getDBPath()
{
  return path.join(
    app.getPath("userData"),
    "database.sqlite"
  );
}


export function listBackups()
{
  const dir = getBackupDir();

  if (!fs.existsSync(dir))
    return [];

  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith(".db"))
    .sort()
    .reverse();
}


export function restoreBackup(filename: string)
{
  const backupPath =
    path.join(getBackupDir(), filename);

  const dbPath =
    getDBPath();

  if (!fs.existsSync(backupPath))
    throw new Error("Backup not found");

  fs.copyFileSync(
    backupPath,
    dbPath
  );

  console.log(
    "Backup restored:",
    filename
  );
}
