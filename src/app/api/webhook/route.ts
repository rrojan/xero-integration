import { handleCopilotWebhook } from '@/features/invoice-sync/api/webhook.controller'
import { withErrorHandler } from '@/utils/withErrorHandler'

export const POST = withErrorHandler(handleCopilotWebhook)
