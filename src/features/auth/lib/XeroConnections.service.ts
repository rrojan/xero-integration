import { eq } from 'drizzle-orm'
import { z } from 'zod'
import db from '@/db'
import { xeroConnections } from '@/db/schema/xeroConnections.schema'
import { sendAuthorizationFailedNotification } from '@/features/auth/lib/XeroConnections.helpers'
import type User from '@/lib/copilot/models/User.model'
import type { XeroTokenSet } from '@/lib/xero/types'
import XeroAPI from '@/lib/xero/XeroAPI'

class XeroConnectionsService {
  constructor(private user: User) {}

  /**
   * Authorize Xero for a Copilot workspace using a token payload
   * @param token - Copilot app token
   */
  async authorizeXeroForCopilotWorkspace(): Promise<void> {
    // Find corresponding Xero connection for the workspace
    const connection = await this.getConnectionForWorkspace()

    // Xero connection not found or inactive. Send a mail prompting IUs to re-authorize
    if (!connection || !connection.tokenSet || !connection.tokenSet.refresh_token) {
      sendAuthorizationFailedNotification()
      return
    }

    // If access token is expired, attempt to refresh access token via refresh token
    const isAccessTokenValid = connection.tokenSet.expires_at
      ? connection.tokenSet.expires_at * 1000 > Date.now()
      : false

    let tokenSet: XeroTokenSet
    if (!isAccessTokenValid) {
      try {
        const xero = new XeroAPI()
        tokenSet = await xero.refreshWithRefreshToken(connection.tokenSet.refresh_token)
      } catch (e: unknown) {
        sendAuthorizationFailedNotification(e)
        return
      }

      await this.updateConnection(tokenSet)
    }
  }

  async getConnectionForWorkspace() {
    return await db.query.xeroConnections.findFirst({
      where: eq(xeroConnections.portalId, this.user.portalId),
    })
  }

  async upsertConnection(tokenSet: XeroTokenSet) {
    await db
      .insert(xeroConnections)
      .values({
        portalId: z.string().min(1).parse(this.user.portalId),
        tokenSet: tokenSet,
        status: true,
        initiatedBy: this.user.internalUserId,
      })
      .onConflictDoUpdate({
        target: xeroConnections.portalId,
        set: {
          tokenSet: tokenSet,
          status: true,
          initiatedBy: this.user.internalUserId,
        },
      })
  }

  async updateConnection(tokenSet: XeroTokenSet) {
    await db
      .update(xeroConnections)
      .set({ tokenSet })
      .where(eq(xeroConnections.portalId, this.user.portalId))
  }
}

export default XeroConnectionsService
