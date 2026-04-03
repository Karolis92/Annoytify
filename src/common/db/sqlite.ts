import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { openDatabaseSync } from "expo-sqlite/next";
import migrations from "./migrations/migrations";
import { tasks } from "./sqliteSchema";

const sqlite = openDatabaseSync("annoytify.db", {
  enableChangeListener: true,
});
let initPromise: Promise<void> | undefined;
const db = drizzle(sqlite, { schema: { tasks } });

export const initDb = async () => {
  if (!initPromise) {
    initPromise = migrate(db, migrations);
  }
  await initPromise;
};

export default db;
