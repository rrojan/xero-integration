import XeroConnectionsService from '@auth/lib/XeroConnections.service'
import Script from 'next/script'
import User from '@/lib/copilot/models/User.model'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface CallbackPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const CallbackPage = async ({ searchParams }: CallbackPageProps) => {
  const sp = await searchParams
  const user = await User.authenticate(sp.state)
  delete sp.state // xero-node sdk doesn't expect state in the url params

  const xeroConnectionsService = new XeroConnectionsService(user)
  await xeroConnectionsService.handleXeroConnectionCallback(sp)

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
