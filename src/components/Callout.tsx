'use client'

import { Callout as CopilotCallout } from 'copilot-design-system'
import type { ComponentProps } from 'react'
import { getAuthUrl } from '@/features/auth/auth'

type Props = ComponentProps<typeof CopilotCallout>

export const Callout = (props: Props) => {
  const userActionProps = props.actionProps

  //   return (
  //     <a href={getAuthUrl()} target="_blank" rel="noopener noreferrer">
  //       Connect to Xero
  //     </a>
  //   )

  return (
    <CopilotCallout
      {...props}
      actionProps={{
        ...(userActionProps as { label: string }),
        onClick: (e: unknown) => {
          // call the user’s handler first (if present)
          const authUrl = getAuthUrl()
          window.open(authUrl, '_blank', 'noopener,noreferrer')
        },
      }}
    />
  )
}
