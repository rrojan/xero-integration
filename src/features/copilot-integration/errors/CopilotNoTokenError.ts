import status from 'http-status'
import { baseErrorFactory } from '@/errors/BaseServerError'

/**
 * Raised when no token is provided for server component / action / API route
 */
const CopilotNoTokenError = baseErrorFactory(
  'CopilotNoTokenError',
  'Token is not provided',
  status.BAD_REQUEST,
)

export default CopilotNoTokenError
