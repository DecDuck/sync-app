import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const syncBucket = sqliteTable("buckets", {
  token: text("token").primaryKey(),
  userId: integer("userId"),
  data: text("data"),
});

export const syncBucketRelation = relations(syncBucket, ({ one }) => ({
  user: one(users, {
    fields: [syncBucket.userId],
    references: [users.id],
  }),
}));
