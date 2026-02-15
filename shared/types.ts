export interface Entity {

  id: string;
  name: string;
  type: string;
  position_x?: number;
  position_y?: number;

}

declare global {

  interface Window {

    api: any;

    entityAPI: {

      create(name: string, type: string): Promise<Entity>;

      list(): Promise<Entity[]>;

    };

  }

}

