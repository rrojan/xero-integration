import type { CopilotAPI as SDK } from 'copilot-node-sdk'
import { copilotApi } from 'copilot-node-sdk'
import env from '@/config/server.env'
import { withRetry } from '@/lib/withRetry'
import {
  type ClientRequest,
  type ClientResponse,
  ClientResponseSchema,
  ClientsResponseSchema,
  type CompaniesResponse,
  CompaniesResponseSchema,
  type CompanyCreateRequest,
  type CompanyResponse,
  CompanyResponseSchema,
  type CopilotListArgs,
  type InternalUser,
  InternalUserSchema,
  type InternalUsersResponse,
  InternalUsersResponseSchema,
  type NotificationCreatedResponse,
  NotificationCreatedResponseSchema,
  type NotificationRequestBody,
  type Token,
  TokenSchema,
  type WorkspaceResponse,
  WorkspaceResponseSchema,
} from '@/types/copilotApi'

export class CopilotAPI {
  copilot: SDK

  constructor(
    private token: string,
    customApiKey?: string,
  ) {
    this.copilot = copilotApi({
      apiKey: customApiKey ?? env.COPILOT_API_KEY,
      token,
    })
  }

  // NOTE: Any method prefixed with _ is a API method that doesn't implement retry & delay
  // NOTE: Any normal API method name implements `withRetry` with default config

  // Get Token Payload from copilot request token
  async _getTokenPayload(): Promise<Token | null> {
    const getTokenPayload = this.copilot.getTokenPayload
    if (!getTokenPayload) {
      console.error(
        `CopilotAPI#getTokenPayload | Could not parse token payload for token ${this.token}`,
      )
      return null
    }

    return TokenSchema.parse(await getTokenPayload())
  }

  async _getWorkspace(): Promise<WorkspaceResponse> {
    console.info('CopilotAPI#_getWorkspace', this.token)
    return WorkspaceResponseSchema.parse(await this.copilot.retrieveWorkspace())
  }

  async _createClient(
    requestBody: ClientRequest,
    sendInvite: boolean = false,
  ): Promise<ClientResponse> {
    console.info('CopilotAPI#_createClient', this.token)
    return ClientResponseSchema.parse(
      await this.copilot.createClient({ sendInvite, requestBody }),
    )
  }

  async _getClient(id: string): Promise<ClientResponse> {
    console.info('CopilotAPI#_getClient', this.token)
    return ClientResponseSchema.parse(await this.copilot.retrieveClient({ id }))
  }

  async _getClients(args: CopilotListArgs & { companyId?: string } = {}) {
    console.info('CopilotAPI#_getClients', this.token)
    return ClientsResponseSchema.parse(await this.copilot.listClients(args))
  }

  async _updateClient(
    id: string,
    requestBody: ClientRequest,
  ): Promise<ClientResponse> {
    console.info('CopilotAPI#_updateClient', this.token)
    return ClientResponseSchema.parse(
      await this.copilot.updateClient({ id, requestBody }),
    )
  }

  async _deleteClient(id: string) {
    console.info('CopilotAPI#_deleteClient', this.token)
    return await this.copilot.deleteClient({ id })
  }

  async _createCompany(requestBody: CompanyCreateRequest) {
    console.info('CopilotAPI#_createCompany', this.token)
    return CompanyResponseSchema.parse(
      await this.copilot.createCompany({ requestBody }),
    )
  }

  async _getCompany(id: string): Promise<CompanyResponse> {
    console.info('CopilotAPI#_getCompany', this.token)
    return CompanyResponseSchema.parse(
      await this.copilot.retrieveCompany({ id }),
    )
  }

  async _getCompanies(
    args: CopilotListArgs & { isPlaceholder?: boolean } = {},
  ): Promise<CompaniesResponse> {
    console.info('CopilotAPI#_getCompanies', this.token)
    return CompaniesResponseSchema.parse(await this.copilot.listCompanies(args))
  }

  async _getCompanyClients(companyId: string): Promise<ClientResponse[]> {
    console.info('CopilotAPI#_getCompanyClients', this.token)
    return (await this.getClients({ limit: 10000, companyId })).data || []
  }

  async _getInternalUsers(
    args: CopilotListArgs = {},
  ): Promise<InternalUsersResponse> {
    console.info('CopilotAPI#_getInternalUsers', this.token)
    return InternalUsersResponseSchema.parse(
      await this.copilot.listInternalUsers(args),
    )
  }

  async _getInternalUser(id: string): Promise<InternalUser> {
    console.info('CopilotAPI#_getInternalUser', this.token)
    return InternalUserSchema.parse(
      await this.copilot.retrieveInternalUser({ id }),
    )
  }

  async _createNotification(
    requestBody: NotificationRequestBody,
  ): Promise<NotificationCreatedResponse> {
    console.info('CopilotAPI#_createNotification', this.token)
    const notification = await this.copilot.createNotification({ requestBody })
    return NotificationCreatedResponseSchema.parse(notification)
  }

  private wrapWithRetry<Args extends unknown[], R>(
    fn: (...args: Args) => Promise<R>,
  ): (...args: Args) => Promise<R> {
    return (...args: Args): Promise<R> => withRetry(fn.bind(this), args)
  }

  // Methods wrapped with retry
  getTokenPayload = this.wrapWithRetry(this._getTokenPayload)
  getWorkspace = this.wrapWithRetry(this._getWorkspace)
  createClient = this.wrapWithRetry(this._createClient)
  getClient = this.wrapWithRetry(this._getClient)
  getClients = this.wrapWithRetry(this._getClients)
  updateClient = this.wrapWithRetry(this._updateClient)
  deleteClient = this.wrapWithRetry(this._deleteClient)
  createCompany = this.wrapWithRetry(this._createCompany)
  getCompany = this.wrapWithRetry(this._getCompany)
  getCompanies = this.wrapWithRetry(this._getCompanies)
  getCompanyClients = this.wrapWithRetry(this._getCompanyClients)
  getInternalUsers = this.wrapWithRetry(this._getInternalUsers)
  getInternalUser = this.wrapWithRetry(this._getInternalUser)
  createNotification = this.wrapWithRetry(this._createNotification)
}
