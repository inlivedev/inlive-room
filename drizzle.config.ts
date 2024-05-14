import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';

config();

const DB_USER = process.env.DB_USER;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = parseInt(process.env.DB_PORT || '0', 10);
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;

export default {
  schema: './app/(server)/_features/**/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    user: DB_USER,
    host: DB_HOST || '',
    port: DB_PORT,
    database: DB_NAME || '',
    password: DB_PASS,
  },
} satisfies Config;
