import {
  customType,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { Repeat } from "../enums/Repeat";

const isoDate = customType<{ data: Date; driverData: string }>({
  dataType() {
    return "text";
  },
  toDriver(value) {
    return value.toISOString();
  },
  fromDriver(value) {
    return new Date(value);
  },
});

const repeatType = customType<{ data: Repeat; driverData: string }>({
  dataType() {
    return "text";
  },
  toDriver(value) {
    return value;
  },
  fromDriver(value) {
    return value as Repeat;
  },
});

export const tasks = sqliteTable("tasks", {
  _id: text("_id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: isoDate("date").notNull(),
  repeat: repeatType("repeat").notNull(),
  done: integer("done", { mode: "boolean" }).notNull().default(false),
});
