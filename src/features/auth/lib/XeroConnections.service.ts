import { eq } from 'drizzle-orm'
import { z } from 'zod'
import db from '@/db'
import {
  type XeroConnection,
  type XeroConnectionUpdatePayload,
  xeroConnections,
} from '@/db/schema/xeroConnections.schema'
import BaseService from '@/lib/copilot/services/base.service'

class XeroConnectionsService extends BaseService {
  async getConnectionForWorkspace(): Promise<XeroConnection> {
    let connection = await db.query.xeroConnections.findFirst({
      where: eq(xeroConnections.portalId, this.user.portalId),
    })

    if (!connection) {
      const newConnection = await db
        .insert(xeroConnections)
        .values({
          portalId: z.string().min(1).parse(this.user.portalId),
          status: false,
          initiatedBy: z.uuid().parse(this.user.internalUserId),
        })
        .returning()
      connection = newConnection[0]
    }

    return connection
  }

  async updateConnectionForWorkspace(
    payload: XeroConnectionUpdatePayload,
  ): Promise<XeroConnection> {
    const connections = await db
      .update(xeroConnections)
      .set(payload)
      .where(eq(xeroConnections.portalId, this.user.portalId))
      .returning()
    return connections[0]
  }
}

export default XeroConnectionsService
