import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import {config} from "dotenv";

config()

const DB_USER = process.env.DB_USER;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = parseInt(process.env.DB_PORT || "0", 10);
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;

const Option = {
  max: 1,
  host: DB_HOST,
  user: DB_USER,
  pass: DB_PASS,
  database: DB_NAME,
  port: DB_PORT,
};

export const connectionString =
  `postgres://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/${DB_NAME}`;
const sql = postgres(connectionString, Option);

const db = drizzle(sql);


async function main() {
  console.log("Migrating Started");
  console.log(`Migrating to ${DB_HOST} on Database ${DB_NAME}`);
  await migrate(db, { migrationsFolder: "./migrations" });
  console.log("Migration Finish");
  process.exit()
}

// Call the async function to start your script
main().catch((error) => {
  console.error("An error occurred:", error);
});
