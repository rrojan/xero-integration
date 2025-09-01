'use client'

import { type AppStateContextType, useAppState } from '@/context/AppContext'

'use client'

import { type AppStateContextType, useAppState } from '@/context/AppContext'
import { useEffect } from 'react'

export function AppStateSetter({ newState }: { newState: Partial<AppStateContextType> }) {
  const { updateAppState } = useAppState()
  useEffect(() => {
    updateAppState(newState)
  }, [newState, updateAppState])
  return null
}
