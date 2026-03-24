import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL?.trim();
    if (!url) {
      throw new Error(
        "DATABASE_URL mancante. Copia apps/api/.env.example in apps/api/.env e avvia Postgres (vedi README)."
      );
    }
    pool = new Pool({ connectionString: url });
  }
  return pool;
}

export async function dbHealth(): Promise<boolean> {
  try {
    const p = getPool();
    await p.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
