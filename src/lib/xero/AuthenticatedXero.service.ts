import type { XeroConnectionWithTokenSet } from '@/db/schema/xeroConnections.schema'
import type User from '@/lib/copilot/models/User.model'
import BaseService from '@/lib/copilot/services/base.service'
import XeroAPI from '@/lib/xero/XeroAPI'

class AuthenticatedXeroService extends BaseService {
  protected xero: XeroAPI

  constructor(
    user: User,
    protected readonly connection: XeroConnectionWithTokenSet,
  ) {
    super(user)
    this.xero = new XeroAPI()
    this.xero.setTokenSet(connection.tokenSet)
  }
}

export default AuthenticatedXeroService
