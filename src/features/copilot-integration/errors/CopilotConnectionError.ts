import status from 'http-status'
import { baseErrorFactory } from '@/errors/BaseServerError'

/**
 * Generic error thrown when Copilot SDK / API refuses to serve requests
 */
const CopilotConnectionError = baseErrorFactory(
  'CopilotConnectionError',
  'Unable to connect to Copilot API',
  status.INTERNAL_SERVER_ERROR,
)

export default CopilotConnectionError
