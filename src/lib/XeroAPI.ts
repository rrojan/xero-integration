import 'server-only'

import { eq } from 'drizzle-orm'
import { XeroClient } from 'xero-node'
import env from '@/config/server.env'
import db from '@/db'
import { xeroConnections } from '@/db/schema/xeroConnections.schema'
import { CopilotAPI } from '@/lib/CopilotAPI'
import { getServerUrl } from '@/utils/serverUrl'

export class XeroAPI {
  private xero: XeroClient

  constructor() {
    this.xero = new XeroClient({
      clientId: env.XERO_CLIENT_ID,
      clientSecret: env.XERO_CLIENT_SECRET,
      redirectUris: [env.XERO_CALLBACK_URL],
      scopes: env.XERO_SCOPES.split(' '),
    })
  }

  /**
   * Authorize Xero for a Copilot workspace using a token payload
   * @param token - Copilot app token
   */
  async authorizeXeroForCopilotWorkspace(token: string): Promise<void> {
    // Get workspace ID from Copilot token
    const copilot = new CopilotAPI(token)
    const tokenPayload = await copilot.getTokenPayload()
    if (!tokenPayload || !tokenPayload.workspaceId) {
      throw new Error('Invalid Copilot token')
    }

    // Find corresponding Xero connection for the workspace
    const connection = (
      await db.query.xeroConnections.findMany({
        where: eq(xeroConnections.portalId, tokenPayload.workspaceId),
      })
    )?.[0]

    // Xero connection not found or inactive. Send a mail prompting IUs to re-authorize
    if (!connection || !connection.tokenSet || !connection.tokenSet.refresh_token) {
      return
    }

    // If access token is expired, attempt to refresh access token via refresh token
    const isAccessTokenValid = connection.tokenSet.expires_at
      ? connection.tokenSet.expires_at * 1000 > Date.now()
      : false
    if (!isAccessTokenValid) {
      const tokenSet = await this.xero.refreshWithRefreshToken(
        env.XERO_CLIENT_ID,
        env.XERO_CLIENT_SECRET,
        connection.tokenSet.refresh_token,
      )
      await db
        .update(xeroConnections)
        .set({ tokenSet })
        .where(eq(xeroConnections.id, connection.id))
      // Refresh token flow was unsuccessful. Send a mail prompting IUs to re-authorize
    }
  }

  /**
   * Build the consent URL to redirect users to Xero's authorization page
   * using Xero OAuth app's clientId, clientScret, redirectUri, and scopes
   */
  async buildConsentUrl(): Promise<string> {
    return await this.xero.buildConsentUrl()
  }

  /**
   * Handle API callback from Xero and exchange the authorization code
   */
  async handleApiCallback(searchParams: {
    [key: string]: string | string[] | undefined
  }): ReturnType<XeroClient['apiCallback']> {
    try {
      const url = await getServerUrl('/auth/callback', await searchParams)
      const tokenSet = await this.xero.apiCallback(url)
      return tokenSet
    } catch (error) {
      console.error('XeroAPI#handleApiCallback | Error during API callback:', error)
      throw error
    }
  }
}

const xero = new XeroAPI()
export default xero
