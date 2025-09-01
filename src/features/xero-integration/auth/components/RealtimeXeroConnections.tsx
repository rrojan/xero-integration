'use client'

import type { ClientUser } from '@/features/copilot-integration/models/ClientUser.model'
import { useRealtimeXeroConnections } from '@/features/xero-integration/auth/hooks/useRealtimeXeroConnections'

interface RealtimeXeroConnectionsProps {
  user: ClientUser
}

export const RealtimeXeroConnections = ({ user }: RealtimeXeroConnectionsProps) => {
  useRealtimeXeroConnections(user)
  return null
}
