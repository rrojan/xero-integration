import WebhookService from '@invoice-sync/lib/webhook.service'
import { WebhookEventSchema } from '@invoice-sync/types'
import { type NextRequest, NextResponse } from 'next/server'
import AuthService from '@/features/auth/lib/Auth.service'
import User from '@/lib/copilot/models/User.model'

export const handleCopilotWebhook = async (req: NextRequest) => {
  const token = req.nextUrl.searchParams.get('token')
  const user = await User.authenticate(token)

  const authService = new AuthService(user)
  const connection = await authService.authorizeXeroForCopilotWorkspace()

  const reqBody = await req.json()
  const webhookData = WebhookEventSchema.parse(reqBody)

  const webhookService = new WebhookService(user, connection)
  await webhookService.handleEvent(webhookData)

  return NextResponse.json({ message: 'Webhook received' }, { status: 200 })
}
