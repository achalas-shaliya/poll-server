import { query } from "./db";
import fs from "fs";
import path from "path";

export const runMigrations = async () => {
  const migrationsDir = path.join(__dirname, "./migrations");
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    console.log(`Running migration: ${file}`);
    await query(sql);
  }

  console.log("Migrations completed.");
  process.exit(0);
};

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});