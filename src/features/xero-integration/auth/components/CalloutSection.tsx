'use client'

import { Callout } from '@/components/ui/Callout'
import { useAppState } from '@/context/AppContext'

export const CalloutSection = () => {
  const { user } = useAppState()

  // TODO: Static for now...
  return (
    <Callout
      title={'Authorize your account'}
      description={'Log into Xero with an admin account to get started.'}
      variant={'info'}
      actionProps={{
        variant: 'primary',
        label: 'Connect to Xero',
        prefixIcon: 'Check',
      }}
      hrefUrl={`/auth/initiate?token=${user.token}`}
    />
  )
}
