import Script from 'next/script'
import { SilentError } from '@/components/layouts/SilentError'
import XeroConnectionsService from '@/features/auth/lib/XeroConnections.service'
import User from '@/lib/copilot/models/User.model'
import type { XeroTokenSet } from '@/lib/xero/types'
import XeroAPI from '@/lib/xero/XeroAPI'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface CallbackPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const CallbackPage = async ({ searchParams }: CallbackPageProps) => {
  const sp = await searchParams
  const user = await User.authenticate(sp.state)

  let tokenSet: XeroTokenSet
  try {
    delete sp.state // xero-node sdk doesn't expect state in the url params
    const xero = new XeroAPI()
    tokenSet = await xero.handleApiCallback(sp)
  } catch (error) {
    console.error('Error handling Xero callback:', error)
    return <SilentError message="Failed to handle Xero callback" />
  }

  const xeroConnectionsService = new XeroConnectionsService(user)
  await xeroConnectionsService.upsertConnection(tokenSet)

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
