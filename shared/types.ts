export interface Workspace {
  id: string;
  name: string;
  color: string;
}

export interface Entity {
  id: string;
  workspace_id: string;
  name: string;
  type: string;
  color?: string;
  position_x?: number;
  position_y?: number;
}

export interface EntityRow {
  id: string;
  entity_id: string;
  row_key: string;
  row_value: string;
  is_secret: number;
  order_index: number;
}

export interface Relationship {
  id: string;
  source_id: string;
  target_id: string;
  type: string;
}

export interface AppSetting {
  key: string;
  value: string;
}

// --- IPC API Contracts ---

export interface WorkspaceAPI {
  create(name: string, color?: string): Promise<Workspace>;
  list(): Promise<Workspace[]>;
  update(id: string, name: string, color?: string): Promise<void>;
  delete(id: string): Promise<void>;
  setActive(id: string): Promise<void>;
  getActive(): Promise<string | null>;
}

export interface EntityAPI {
  create(workspaceId: string, name: string, type: string): Promise<Entity>;
  list(workspaceId?: string): Promise<Entity[]>;
  updatePosition(id: string, x: number, y: number): Promise<void>;
  updateColor(id: string, color: string): Promise<void>;
  updateType(id: string, type: string): Promise<void>;
  delete(id: string): Promise<void>;
  rename(id: string, name: string): Promise<void>;
}

export interface EntityRowAPI {
  create(entityId: string, rowKey: string, rowValue: string, orderIndex: number, isSecret?: boolean): Promise<EntityRow>;
  list(entityId: string): Promise<EntityRow[]>;
  update(id: string, rowKey: string, rowValue: string, isSecret?: boolean): Promise<void>;
  updateOrder(id: string, orderIndex: number): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface RelationshipAPI {
  create(sourceId: string, targetId: string, type: string): Promise<Relationship>;
  list(): Promise<Relationship[]>;
  delete(id: string): Promise<void>;
  rename(id: string, type: string): Promise<void>;
}

export interface BackupAPI {
  list(): Promise<string[]>;
  restore(filename: string): Promise<void>;
}

export interface DataAPI {
  exportCards(workspaceId?: string, entityIds?: string[]): Promise<string>;
  importCards(filePath: string, targetWorkspaceId?: string): Promise<{ created: number; skipped: number }>;
}

export interface SettingsAPI {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  getAll(): Promise<AppSetting[]>;
}

// Extend Window object safely
declare global {
  interface Window {
    workspaceAPI: WorkspaceAPI;
    entityAPI: EntityAPI;
    entityRowAPI: EntityRowAPI;
    relationshipAPI: RelationshipAPI;
    backupAPI: BackupAPI;
    dataAPI: DataAPI;
    settingsAPI: SettingsAPI;
  }
}

export {};
