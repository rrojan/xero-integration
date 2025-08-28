import { boolean, pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { timestamps } from '@/db/db.helpers'

export const xeroConnectionsTable = pgTable('xero_connections', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  // Workspace ID / Portal ID in Copilot
  portalId: varchar({ length: 16 }).notNull(),
  // Access token for Xero OAuth. Fixed expiry of 30 minutes
  accessToken: varchar({ length: 2048 }).notNull(),
  // Refresh token for Xero OAuth. Fixed expiry of 60 days
  refreshToken: varchar({ length: 255 }).notNull(),
  // Status of the oauth connection (OAuth)
  status: boolean().notNull().default(false),
  // Copilot internalUserId that initiated the connection
  initiatedBy: uuid().notNull(),
  // authEventId from the latest connection to Xero
  authEventId: uuid().notNull(),
  // tenantId (organization ID) from the latest connection to Xero
  tenantId: varchar({ length: 255 }).notNull(),
  ...timestamps,
})
