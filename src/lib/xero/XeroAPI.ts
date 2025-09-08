import 'server-only'

import status from 'http-status'
import { type Contact, type TokenSet, XeroClient } from 'xero-node'
import env from '@/config/server.env'
import APIError from '@/errors/APIError'
import type { ContactCreatePayload } from '@/features/invoice-sync/types'
import type { CreateInvoicePayload } from '@/lib/xero/types'
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
  async refreshWithRefreshToken(refreshToken: string): Promise<TokenSet> {
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
  setTokenSet(tokenSet: TokenSet) {
    this.xero.setTokenSet(tokenSet)
  }

  /**
   * Gets the active (most recently connected) tenant (organization) for
   * @returns Active Tenant's tenantId
   */
  async getActiveTenantId(): Promise<string> {
    const connections = await this.xero.updateTenants(false) // Get an updated set of tenants
    return connections[0].tenantId
  }

  async createInvoices(tenantId: string, invoices: CreateInvoicePayload[]) {
    // Ref: https://developer.xero.com/documentation/api/accounting/invoices#post-invoices
    const { body } = await this.xero.accountingApi.createInvoices(tenantId, { invoices }, true)
    return body
  }

  async getContact(tenantId: string, contactId: string): Promise<Contact | undefined> {
    const { body } = await this.xero.accountingApi.getContact(tenantId, contactId)
    return body.contacts?.[0]
  }

  async createContact(tenantId: string, contact: ContactCreatePayload): Promise<Contact> {
    const { body } = await this.xero.accountingApi.createContacts(
      tenantId,
      { contacts: [contact] },
      true,
    )
    if (!body.contacts?.length)
      throw new APIError('Unable to create contact', status.INTERNAL_SERVER_ERROR)

    return body.contacts[0]
  }
}

export default XeroAPI
