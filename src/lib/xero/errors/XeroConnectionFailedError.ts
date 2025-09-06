import status from 'http-status'
import { baseServerErrorFactory } from '@/errors/BaseServerError'

/**
 * Raised when no token is provided for server component / action / API route
 */
const XeroConnectionFailedError = baseServerErrorFactory(
  'XeroConnectionFailedError',
  'Xero is not connected',
  status.UNAUTHORIZED,
)

export default XeroConnectionFailedError
