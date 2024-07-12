import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import schema from '@/(server)/_schema/index';

const DB_USER = process.env.DB_USER;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = parseInt(process.env.DB_PORT || '0', 10);
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;

const Option: postgres.Options<Record<string, postgres.PostgresType>> = {
  host: DB_HOST,
  user: DB_USER,
  pass: DB_PASS,
  database: DB_NAME,
};

if (process.env.NEXT_PUBLIC_APP_ENV == 'development') {
  Option.port = DB_PORT;
}

const queryClient = postgres(Option);

export const db = drizzle(queryClient, { schema });

// Type to represent the database connection, it can be a connection or a transaction
export type DB =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];
