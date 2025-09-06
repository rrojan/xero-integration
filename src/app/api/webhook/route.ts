import { handleCopilotWebhook } from '@invoice-sync/api/webhook.controller'
import { withErrorHandler } from '@/utils/withErrorHandler'

export const POST = withErrorHandler(handleCopilotWebhook)
