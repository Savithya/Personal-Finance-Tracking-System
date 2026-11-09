declare module 'node:sqlite' {
  export class StatementSync {
    run(...params: any[]): { changes: number | bigint; lastInsertRowid: number | bigint };
    all(...params: any[]): any[];
    get(...params: any[]): any;
  }
  export class DatabaseSync {
    constructor(location: string, options?: any);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
