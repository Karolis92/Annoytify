import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/common/db/sqliteSchema.ts",
  out: "./src/common/db/migrations",
  dialect: "sqlite",
  driver: "expo",
});
