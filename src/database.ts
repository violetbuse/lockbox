import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

export const create_db = (db_url: string) => {
  const sqlite = createClient({ url: db_url });

  sqlite.execute("PRAGMA journal_mode = WAL;");
  sqlite.execute("PRAGMA busy_timeout = 5000;");
  sqlite.execute("PRAGMA synchronous = NORMAL;");
  sqlite.execute("PRAGMA cache_size = 1000000000;");
  sqlite.execute("PRAGMA foreign_keys = true;");
  sqlite.execute("PRAGMA temp_store = memory;");

  return drizzle(sqlite, { schema });
};

export type DB = ReturnType<typeof create_db>;
