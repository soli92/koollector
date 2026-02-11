import * as SQLite from "expo-sqlite";

export const dbPromise = SQLite.openDatabaseAsync("koollector.db");

export async function initDb() {
    const db = await dbPromise;

    await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS outbox (
      id TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cursor_store (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS outbox (
        id TEXT PRIMARY KEY,              -- UUID
        entity_type TEXT NOT NULL,         -- es: "owned_cards"
        entity_id TEXT NOT NULL,           -- UUID entity
        collection_id TEXT NOT NULL,       -- UUID cooperativa
        op TEXT NOT NULL,                  -- "UPSERT" | "DELETE"
        payload_json TEXT,                 -- JSON string (null per delete)
        updated_at TEXT NOT NULL,          -- ISO (per LWW)
        status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING|ACKED|FAILED
        attempts INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
  `);
}
