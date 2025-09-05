import 'server-only'

import { XeroClient } from 'xero-node'
import env from '@/config/server.env'
import type { XeroTokenSet } from '@/lib/xero/types'
import { getServerUrl } from '@/utils/serverUrl'

class XeroAPI {
  private readonly xero: XeroClient

  constructor() {
    this.xero = new XeroClient({
      clientId: env.XERO_CLIENT_ID,
      clientSecret: env.XERO_CLIENT_SECRET,
      redirectUris: [env.XERO_CALLBACK_URL],
      scopes: env.XERO_SCOPES.split(' '),
    })
  }

  /**
   * Build the consent URL to redirect users to Xero's authorization page
   * using Xero OAuth app's clientId, clientScret, redirectUri, and scopes
   */
  async buildConsentUrl(): Promise<string> {
    return await this.xero.buildConsentUrl()
  }

  /**
   * Refreshes a Xero access token with a set refresh token
   */
  async refreshWithRefreshToken(refreshToken: string): Promise<XeroTokenSet> {
    return await this.xero.refreshWithRefreshToken(
      env.XERO_CLIENT_ID,
      env.XERO_CLIENT_SECRET,
      refreshToken,
    )
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

  /**
   * Sets active tokenset for Xero SDK authorization
   * @param tokenSet
   */
  async setTokenSet(tokenSet: XeroTokenSet) {
    await this.xero.setTokenSet(tokenSet)
  }

  /**
   * Gets the active (most recently connected) tenant (organization) for
   * @returns Active Tenant's tenantId
   */
  async getActiveTenantId(): Promise<string> {
    const connections = await this.xero.updateTenants(false) // Get an updated set of tenants
    return connections[0].tenantId
  }
}

export default XeroAPI
