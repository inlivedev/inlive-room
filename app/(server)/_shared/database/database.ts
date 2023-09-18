import postgres from "postgres";
import { drizzle } from 'drizzle-orm/postgres-js';
import schema from '@/(server)/_schema/index'

const DB_USER = process.env.DB_USER
const DB_HOST = process.env.DB_HOST
const DB_PORT = parseInt(process.env.DB_PORT || '0',10)
const DB_PASS = process.env.DB_PASS
const DB_NAME = process.env.DB_NAME


const queryClient = postgres("",{
    host: DB_HOST,
    user: DB_USER,
    pass: DB_PASS,
    database:DB_NAME,
    port: DB_PORT,
})

export const db = drizzle(queryClient,{schema})