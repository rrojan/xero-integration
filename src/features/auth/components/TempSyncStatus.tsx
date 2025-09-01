'use client'

import { useAppState } from '@/context/AppContext'

/**
 * Temporary client component to show sync status.
 */
export const TempSyncStatus = () => {
  const { connectionStatus } = useAppState()

  return (
    <div className="mt-10">
      Connection Status: {connectionStatus ? 'Connected' : 'Not Connected'}
    </div>
  )
}
