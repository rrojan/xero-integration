'use client'

import { useEffect } from 'react'
import { type AppStateContextType, useAppState } from '@/context/AppContext'

export function AppStateSetter({ newState }: { newState: Partial<AppStateContextType> }) {
  const { updateAppState } = useAppState()
  useEffect(() => {
    updateAppState(newState)
  }, [newState, updateAppState])
  return null
}
