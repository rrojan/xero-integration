import { z } from 'zod'
import CopilotConnectionError from '@/features/copilot-integration/errors/CopilotConnectionError'
import CopilotInvalidTokenError from '@/features/copilot-integration/errors/CopilotInvalidTokenError'
import CopilotNoTokenError from '@/features/copilot-integration/errors/CopilotNoTokenError'
import { CopilotAPI } from '@/features/copilot-integration/lib/CopilotAPI'
import type { Token } from '@/features/copilot-integration/lib/types'

class User {
  internalUserId: string
  portalId: string
  copilot?: CopilotAPI

  constructor(
    public token: string,
    tokenPayload: Token,
    copilot?: CopilotAPI,
  ) {
    this.internalUserId = tokenPayload.internalUserId
    this.portalId = tokenPayload.workspaceId
    this.copilot = copilot
  }

  /**
   * Authenticates a Copilot user by token
   * @param token
   * @returns User instance modeled from the token payload
   * @throws CopilotNoTokenError when no token is provided
   * @throws CopilotInvalidTokenError when the token is invalid
   * @throws CopilotConnectionError when unable to connect to Copilot API
   */
  static async authenticate(token?: unknown): Promise<User> {
    if (!token) {
      throw new CopilotNoTokenError()
    }

    const tokenParsed = z.string().min(1).safeParse(token)

    if (!tokenParsed.success) {
      console.info('User#authenticate :: Token parse error', tokenParsed.error)
      throw new CopilotInvalidTokenError()
    }

    let copilot: CopilotAPI
    try {
      copilot = new CopilotAPI(tokenParsed.data)
    } catch (err) {
      if (err instanceof Error && err.message.includes('Unable to authorize Copilot SDK')) {
        throw new CopilotInvalidTokenError('Unable to authorize Copilot with provided token')
      }
      console.error('User#authenticate :: Error while initializing Copilot client', err)
      throw new CopilotConnectionError()
    }

    const tokenPayload = await copilot.getTokenPayload()
    if (!tokenPayload) {
      throw new CopilotInvalidTokenError('Unable to decode Copilot token payload')
    }

    return new User(tokenParsed.data, tokenPayload, copilot)
  }
}

export default User
