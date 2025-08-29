declare global {
  var _drizzleDb: ReturnType<typeof drizzle> | undefined
}

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import env from '@/config/server.env'

globalThis._drizzleDb ??= drizzle({
  client: postgres(env.DATABASE_URL, { prepare: false }),
  casing: 'snake_case',
})

const db = globalThis._drizzleDb

export default db
