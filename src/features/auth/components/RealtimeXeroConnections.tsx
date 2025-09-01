'use client'

import { useRealtimeXeroConnections } from '@/features/auth/hooks/useRealtimeXeroConnections'
import type { ClientUser } from '@/lib/copilot/models/ClientUser.model'

interface RealtimeXeroConnectionsProps {
  user: ClientUser
}

export const RealtimeXeroConnections = ({ user }: RealtimeXeroConnectionsProps) => {
  useRealtimeXeroConnections(user)
  return null
}
