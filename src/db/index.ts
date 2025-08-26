import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { DATABASE_URL } from '@/config/server.env'

const client = postgres(DATABASE_URL, { prepare: false })
const db = drizzle({ client, casing: 'snake_case' })

export default db
