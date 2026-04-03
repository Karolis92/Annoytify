import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { tasks } from "./sqliteSchema";

const sqlite = SQLite.openDatabase("annoytify.db");
let initPromise: Promise<void> | undefined;
const migrations = [
  {
    version: 1,
    queries: [
      `CREATE TABLE IF NOT EXISTS ${tasks._.name} (
        ${tasks.id.name} TEXT PRIMARY KEY NOT NULL,
        ${tasks.title.name} TEXT NOT NULL,
        ${tasks.description.name} TEXT NOT NULL,
        ${tasks.date.name} TEXT NOT NULL,
        ${tasks.repeat.name} TEXT NOT NULL,
        ${tasks.done.name} INTEGER NOT NULL DEFAULT 0
      )`,
    ],
  },
];

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
    const fallbackRow = arrayRows.at(0) ?? [];

    switch (method) {
      case "run":
        return { rows: [] };
      case "get":
        return { rows: fallbackRow };
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
    initPromise = sqlite.transactionAsync(async (tx) => {
      await tx.executeSqlAsync(
        `CREATE TABLE IF NOT EXISTS "__app_migrations" (
          id INTEGER PRIMARY KEY NOT NULL,
          version INTEGER NOT NULL UNIQUE
        )`,
      );

      const latestMigration = await tx.executeSqlAsync(
        `SELECT MAX(version) as version FROM "__app_migrations"`,
      );
      const currentVersion = Number(latestMigration.rows?.[0]?.version ?? 0);

      for (const migration of migrations) {
        if (migration.version <= currentVersion) {
          continue;
        }

        for (const query of migration.queries) {
          await tx.executeSqlAsync(query);
        }

        await tx.executeSqlAsync(
          `INSERT OR IGNORE INTO "__app_migrations" (version) VALUES (?)`,
          [migration.version],
        );
      }
    });
  }
  await initPromise;
};

export default db;
