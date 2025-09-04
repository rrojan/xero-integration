import { type NextRequest, NextResponse } from 'next/server'

export const handleCopilotWebhook = async (req: NextRequest) => {
  await console.info('Webhook received:', await req.json())
  return NextResponse.json({ message: 'Webhook received' }, { status: 200 })
}
