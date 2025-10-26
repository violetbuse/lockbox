import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const mutex_table = sqliteTable("mutexes", {
  resource: text("resource").notNull(),
  nonce: text("nonce").notNull(),
  expires_at: int("expires_at", { mode: "timestamp" }).notNull(),
});
