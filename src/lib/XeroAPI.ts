import 'server-only'

import { XeroClient } from 'xero-node'
import env from '@/config/server.env'
import { getServerUrl } from '@/utils/serverUrl'

class XeroAPI {
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
   * Build the consent URL to redirect users to Xero's authorization page
   * using Xero OAuth app's clientId, clientScret, redirectUri, and scopes
   */
  async buildConsentUrl(): Promise<string> {
    return await this.xero.buildConsentUrl()
  }

  /**
   * Handle API callback from Xero and exchange the authorization code
   */
  async handleApiCallback(searchParams: { [key: string]: string | string[] | undefined }) {
    try {
      const url = await getServerUrl('/auth/callback', await searchParams)
      const tokenSet = await this.xero.apiCallback(url)
      return tokenSet
    } catch (error) {
      console.error('handleApiCallback | Error during API callback:', error)
      throw error
    }
  }
}

const xero = new XeroAPI()
export default xero
