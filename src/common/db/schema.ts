import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v4 as uuid } from "uuid";
import { Repeat } from "../enums/Repeat";

export const tasks = sqliteTable("tasks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuid()),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  date: integer("date", { mode: "timestamp" }).notNull(),
  repeat: text("repeat", {
    enum: [Repeat.No, Repeat.Daily, Repeat.Monthly],
  })
    .notNull()
    .default(Repeat.No),
  done: integer("done", { mode: "boolean" }).notNull().default(false),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
