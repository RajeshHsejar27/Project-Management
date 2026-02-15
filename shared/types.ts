export interface Entity {
  id: string;

  name: string;

  type: string;

  color?: string; // optional so old records still work

  position_x?: number;

  position_y?: number;
}

export interface Relationship {
  id: string;

  source_id: string;

  target_id: string;

  type: string;
}

// Define API contract for entity operations
export interface EntityAPI {
  create(name: string, type: string): Promise<Entity>;

  list(): Promise<Entity[]>;

  updatePosition(id: string, x: number, y: number): Promise<void>;

  updateColor(id: string, color: string): Promise<void>;

  delete(id: string): Promise<void>;

  rename(id: string, name: string): Promise<void>;
}

// Define API contract for relationship operations
export interface RelationshipAPI {
  create(
    sourceId: string,
    targetId: string,
    type: string
  ): Promise<Relationship>;

  list(): Promise<Relationship[]>;
  delete(id: string): Promise<void>;
}

// Extend Window object safely
declare global {
  interface Window {
    entityAPI: EntityAPI;

    relationshipAPI: RelationshipAPI;
  }
}

// Required for TypeScript module scope
export {};
