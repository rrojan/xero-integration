import { type NextRequest, NextResponse } from 'next/server'
import User from '@/lib/copilot/models/User.model'
import WebhookService from '../lib/webhook.service'
import { WebhookEventSchema } from '../types'

export const handleCopilotWebhook = async (req: NextRequest) => {
  const token = req.nextUrl.searchParams.get('token')
  const user = await User.authenticate(token)

  const reqBody = await req.json()
  const webhookData = WebhookEventSchema.parse(reqBody)

  const webhookService = new WebhookService(user)
  await webhookService.handleEvent(webhookData)

  return NextResponse.json({ message: 'Webhook received' }, { status: 200 })
}
