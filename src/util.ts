import { lt, and, eq } from "drizzle-orm";
import { DB } from "./database";
import { mutex_table } from "./schema";

export const delete_if_expired = async (
  db: DB,
  resource_id: string,
): Promise<void> => {
  await db
    .delete(mutex_table)
    .where(
      and(
        eq(mutex_table.resource, resource_id),
        lt(mutex_table.expires_at, new Date()),
      ),
    );
};
