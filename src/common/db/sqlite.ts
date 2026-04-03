import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { tasks } from "./sqliteSchema";

const sqlite = SQLite.openDatabase("annoytify.db");
let initPromise: Promise<void> | undefined;

const db = drizzle(
  async (query, params, method) => {
    const isReadOnly =
      method === "all" || method === "get" || method === "values";
    const result = await sqlite.execAsync(
      [{ sql: query, args: params }],
      isReadOnly,
    );
    const first = result.at(0);

    if (!first || "error" in first) {
      throw first?.error ?? new Error("SQLite query execution failed.");
    }

    const arrayRows = first.rows.map((row) => Object.values(row));
    const firstRow = arrayRows.at(0) ?? [];

    switch (method) {
      case "run":
        return { rows: [] };
      case "get":
        return { rows: firstRow };
      case "all":
      case "values":
        return { rows: arrayRows };
    }
  },
  {
    schema: { tasks },
  },
);

export const initDb = async () => {
  if (!initPromise) {
    initPromise = sqlite
      .execAsync(
        [
          {
            sql: `CREATE TABLE IF NOT EXISTS tasks (
              id TEXT PRIMARY KEY NOT NULL,
              title TEXT NOT NULL,
              description TEXT NOT NULL,
              date TEXT NOT NULL,
              repeat TEXT NOT NULL,
              done INTEGER NOT NULL DEFAULT 0
            )`,
            args: [],
          },
        ],
        false,
      )
      .then(() => undefined);
  }
  await initPromise;
};

export default db;
