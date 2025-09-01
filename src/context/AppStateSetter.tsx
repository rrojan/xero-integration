'use client'

import { type AppStateContextType, useAppState } from '@/context/AppContext'

export const AppStateSetter = (newState: Partial<AppStateContextType>) => {
  const { updateAppState } = useAppState()
  updateAppState(newState)

  return null
}
