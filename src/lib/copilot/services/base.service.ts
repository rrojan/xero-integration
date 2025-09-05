import type User from '@/lib/copilot/models/User.model'

class BaseService {
  constructor(protected readonly user: User) {}
}

export default BaseService
