import { lt } from "drizzle-orm";
import { DB } from "./database";
import { mutex_table } from "./schema";

export const delete_if_expired = async (db: DB): Promise<void> => {
  await db.delete(mutex_table).where(lt(mutex_table.expires_at, new Date()));
};
