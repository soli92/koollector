import * as SQLite from "expo-sqlite";

export const dbPromise = SQLite.openDatabaseAsync("koollector.db");

/**
 * Schema locale allineato a syncService / enqueueOutbox / applyChange.
 * Se avevi una build precedente con `outbox` errata, su dev: cancella i dati app o cambia nome DB.
 */
export async function initDb() {
  const db = await dbPromise;

  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cursor_store (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS owned_cards (
      id TEXT PRIMARY KEY,
      card_id TEXT NOT NULL,
      owner_user_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS outbox (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      collection_id TEXT NOT NULL,
      op TEXT NOT NULL,
      payload_json TEXT,
      updated_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      attempts INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
