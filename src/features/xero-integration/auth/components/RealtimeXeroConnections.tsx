'use client'

import type { ClientUser } from '@/features/copilot-integration/models/ClientUser.model'
import { useRealtimeXeroConnections } from '@/features/xero-integration/auth/hooks/useRealtimeXeroConnections'

export const RealtimeXeroConnections = ({ user }: { user: ClientUser }) => {
  useRealtimeXeroConnections(user)
  return null
}
