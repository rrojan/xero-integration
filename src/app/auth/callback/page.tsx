import Script from 'next/script'
import { z } from 'zod'
import { SilentError } from '@/components/templates/SilentError'
import db from '@/db'
import { xeroConnectionsTable } from '@/db/schema/xero_connections.schema'
import { CopilotAPI } from '@/lib/CopilotAPI'
import xero from '@/lib/XeroAPI'
import type { XeroTokenSet } from '@/types/xeroApi'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface CallbackPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const CallbackPage = async ({ searchParams }: CallbackPageProps) => {
  const sp = await searchParams
  const token = z.string().parse(sp.state)
  delete sp.state // xero-node sdk doesn't expect state in the url params

  if (!token) {
    return <SilentError message="No token available" />
  }

  const copilot = new CopilotAPI(token)
  const tokenPayload = await copilot.getTokenPayload()

  if (!tokenPayload || !tokenPayload.workspaceId || !tokenPayload.internalUserId) {
    return <SilentError message="Invalid token payload" />
  }

  let tokenSet: XeroTokenSet
  try {
    tokenSet = await xero.handleApiCallback(sp)
  } catch (error) {
    console.error('Error handling Xero callback:', error)
    return <SilentError message="Failed to handle Xero callback" />
  }

  // Upsert xero connection record
  await db
    .insert(xeroConnectionsTable)
    .values({
      portalId: z.string().min(1).parse(tokenPayload.workspaceId),
      tokenSet: tokenSet as XeroTokenSet,
      status: true,
      initiatedBy: tokenPayload.internalUserId,
    })
    .onConflictDoUpdate({
      target: xeroConnectionsTable.portalId,
      set: {
        tokenSet: tokenSet as XeroTokenSet,
        status: true,
        initiatedBy: tokenPayload.internalUserId,
      },
    })

  return (
    <div className="py-4 px-2">
      <div>Connecting Xero Integration...</div>
      <Script id="xero-confirmation-close" strategy="afterInteractive">
        {`
          setTimeout(() => {
            window.close();
          }, 1000)
        `}
      </Script>
    </div>
  )
}

export default CallbackPage
