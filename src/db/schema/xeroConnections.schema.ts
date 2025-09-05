import type { InferSelectModel } from 'drizzle-orm'
import { boolean, jsonb, pgTable, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { timestamps } from '@/db/db.helpers'
import type { XeroTokenSet } from '@/lib/xero/types'

export const xeroConnections = pgTable(
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

    // Active Tenant ID (most recently connected Xero organization)
    tenantId: uuid(),

    ...timestamps,
  },
  (table) => [uniqueIndex('uq_xero_connections_portal_id').on(table.portalId)],
)

export type XeroConnection = InferSelectModel<typeof xeroConnections>
export type XeroConnectionWithTokenSet = XeroConnection & { tokenSet: XeroTokenSet }
