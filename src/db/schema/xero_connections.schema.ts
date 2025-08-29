import { boolean, jsonb, pgTable, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { timestamps } from '@/db/db.helpers'
import type { XeroTokenSet } from '@/types/xeroApi'

export const xeroConnectionsTable = pgTable(
  'xero_connections',
  {
    id: uuid().primaryKey().notNull().defaultRandom(),

    // Workspace ID / Portal ID in Copilot
    portalId: varchar({ length: 16 }).notNull(),

    // Xero tokenset returned after a successful OAuth connection
    tokenSet: jsonb().$type<XeroTokenSet>(),

    // Connection status
    status: boolean().notNull().default(false),

    // Copilot internalUserId that initiated the connection
    initiatedBy: uuid().notNull(),

    ...timestamps,
  },
  (table) => [uniqueIndex('uq_xero_connections_portal_id').on(table.portalId)],
)
