import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { openDatabaseAsync } from "expo-sqlite";
import migrations from "./drizzle/migrations";
import * as schema from "./schema";

export type AppDatabase = Awaited<typeof databasePromise>;

const databasePromise = openDatabaseAsync("main.db", {
  enableChangeListener: true,
})
  .then((sqlite) => drizzle(sqlite, { schema }))
  .then(async (database) => {
    await migrate(database, migrations);
    return database;
  });

export const getDatabase = () => databasePromise;
