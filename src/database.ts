import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// export const db = drizzle(process.env.DB_FILE_NAME!, { schema });

export const create_db = (db_url: string) => {
  // return drizzle(process.env.DB_FILE_NAME!, { schema });
  return drizzle(db_url, { schema });
};

export type DB = ReturnType<typeof create_db>;
