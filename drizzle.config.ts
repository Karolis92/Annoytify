import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/common/db/schema.ts",
  out: "./src/common/db/drizzle",
  dialect: "sqlite",
  driver: "expo",
});
