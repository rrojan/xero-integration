import { sendAuthorizationFailedNotification } from '@auth/lib/Auth.helpers'
import XeroConnectionsService from '@auth/lib/XeroConnections.service'
import type { XeroConnection } from '@/db/schema/xeroConnections.schema'
import type User from '@/lib/copilot/models/User.model'
import BaseService from '@/lib/copilot/services/base.service'
import type { XeroTokenSet } from '@/lib/xero/types'
import XeroAPI from '@/lib/xero/XeroAPI'

class AuthService extends BaseService {
  connectionsService: XeroConnectionsService

  constructor(user: User) {
    super(user)
    this.connectionsService = new XeroConnectionsService(this.user)
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
    return await xeroConnectionsService.updateConnectionForWorkspace({ tokenSet, tenantId })
  }

  private async handleRefreshFailure(shouldSendEmail: boolean) {
    if (shouldSendEmail) {
      await sendAuthorizationFailedNotification(this.user)
    }
  }

  /**
   * Authorize Xero for a Copilot workspace using a token payload
   * Ref: https://developer.xero.com/documentation/guides/oauth2/auth-flow/
   * @param token - Copilot app token
   */
  async authorizeXeroForCopilotWorkspace(
    opts: { shouldSendEmail: boolean } = { shouldSendEmail: true },
  ): Promise<XeroConnection> {
    // Find corresponding Xero connection for the workspace
    let connection = await this.connectionsService.getConnectionForWorkspace()
    const isAccessTokenValid =
      connection.tokenSet?.access_token && connection.tokenSet?.expires_at
        ? connection.tokenSet.expires_at * 1000 > Date.now()
        : false

    // --- Handle active connection
    if (!isAccessTokenValid) {
      // --- Handle inactive connection
      // Update connection as inactive first
      connection = await this.connectionsService.updateConnectionForWorkspace({ status: false })

      // If Xero connection was not found or unrefreshable. Send a mail prompting IUs to re-authorize
      if (!connection.tokenSet || !connection.tokenSet.refresh_token) {
        console.info(
          'XeroConnectionsService#authorizeXeroForCopilotWorkspace :: Unable to refresh Xero access token, no refresh token available',
        )
        await this.handleRefreshFailure(opts.shouldSendEmail)
      } else {
        // Attempt to refresh access token via refresh token
        let tokenSet: XeroTokenSet
        try {
          const xero = new XeroAPI()
          tokenSet = await xero.refreshWithRefreshToken(connection.tokenSet.refresh_token)
          return await this.connectionsService.updateConnectionForWorkspace({
            tokenSet,
            status: true,
          })
        } catch (e: unknown) {
          // If unable to refresh, send notification email
          console.error('Error refreshing Xero access token:', e)
          await this.handleRefreshFailure(opts.shouldSendEmail)
        }
      }
    }
    return connection
  }
}

export default AuthService
