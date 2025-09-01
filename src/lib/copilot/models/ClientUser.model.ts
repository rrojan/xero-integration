import type User from './User.model'

export type ClientUser = {
  internalUserId: string
  portalId: string
  token: string
}

export const serializeClientUser = (user: User): ClientUser => ({
  internalUserId: user.internalUserId,
  portalId: user.portalId,
  token: user.token,
})
