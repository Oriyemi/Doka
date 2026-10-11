import "server-only";
import { Pool } from "pg";

// One shared Postgres connection pool for the whole server. It connects on the
// first query, not on import. Reads DATABASE_URL from .env.local.
export const db = new Pool({ connectionString: process.env.DATABASE_URL });
