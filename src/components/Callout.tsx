'use client'

import { Callout as CopilotCallout } from 'copilot-design-system'
import type { ComponentProps } from 'react'

type CalloutProps = ComponentProps<typeof CopilotCallout> & {
  hrefUrl: string
}

export const Callout = ({ hrefUrl, ...props }: CalloutProps) => {
  const userActionProps = props.actionProps

  return (
    <CopilotCallout
      {...props}
      actionProps={{
        ...(userActionProps as CalloutProps['actionProps'] & { label: string }),
        onClick: (_e: unknown) => {
          window.open(hrefUrl, '_blank', 'noopener,noreferrer')
        },
      }}
    />
  )
}
