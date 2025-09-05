import { eq } from 'drizzle-orm'
// import { after } from 'next/server'
import { z } from 'zod'
import db from '@/db'
import { type XeroConnection, xeroConnections } from '@/db/schema/xeroConnections.schema'
import BaseService from '@/lib/copilot/services/base.service'
import type { XeroTokenSet } from '@/lib/xero/types'
import XeroAPI from '@/lib/xero/XeroAPI'

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

  async upsertConnection({
    tokenSet,
    tenantId,
  }: {
    tokenSet: XeroTokenSet
    tenantId: string
  }): Promise<XeroConnection> {
    const connections = await db
      .insert(xeroConnections)
      .values({
        portalId: z.string().min(1).parse(this.user.portalId),
        tokenSet,
        tenantId,
        status: true,
        initiatedBy: z.uuid().parse(this.user.internalUserId),
      })
      .onConflictDoUpdate({
        target: xeroConnections.portalId,
        set: {
          tokenSet,
          tenantId,
          status: true,
          initiatedBy: this.user.internalUserId,
        },
      })
      .returning()
    return connections[0]
  }

  async updateConnection(tokenSet: XeroTokenSet) {
    await db
      .update(xeroConnections)
      .set({ tokenSet })
      .where(eq(xeroConnections.portalId, this.user.portalId))
  }

  async handleXeroConnectionCallback(
    urlParams: Record<string, string | string[] | undefined>,
  ): Promise<XeroConnection> {
    let tokenSet: XeroTokenSet, tenantId: string
    try {
      const xero = new XeroAPI()
      tokenSet = await xero.handleApiCallback(urlParams)
      tenantId = await xero.getActiveTenantId()
    } catch (error) {
      console.error(
        'XeroConnectionsService#handleXeroConnectionCallback :: Error handling Xero callback:',
        error,
      )
      throw new Error('Error handling Xero callback')
    }

    const xeroConnectionsService = new XeroConnectionsService(this.user)
    return await xeroConnectionsService.upsertConnection({ tokenSet, tenantId })
  }
}

export default XeroConnectionsService
