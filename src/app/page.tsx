import type { PageProps } from '@/app/types'
import { AppStateContextProvider } from '@/context/AppContext'
import { serializeClientUser } from '@/features/copilot-integration/models/ClientUser.model'
import User from '@/features/copilot-integration/models/User.model'
import { CalloutSection } from '@/features/xero-integration/auth/components/CalloutSection'
import { RealtimeXeroConnections } from '@/features/xero-integration/auth/components/RealtimeXeroConnections'
import { TempSyncStatus } from '@/features/xero-integration/auth/components/TempSyncStatus'
import XeroConnectionsService from '@/features/xero-integration/auth/lib/XeroConnections.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const Home = async ({ searchParams }: PageProps) => {
  const sp = await searchParams
  const user = await User.authenticate(sp.token)

  const xeroConnectionsService = new XeroConnectionsService(user)
  const xeroConection = await xeroConnectionsService.getConnectionForWorkspace()

  const clientUser = serializeClientUser(user)

  return (
    <AppStateContextProvider user={clientUser} connectionStatus={!!xeroConection?.status}>
      <main className="pt-6 px-8 sm:px-[100px] lg:px-[220px] pb-[54px]">
        <RealtimeXeroConnections user={clientUser} />
        <CalloutSection />
        <TempSyncStatus />
      </main>
    </AppStateContextProvider>
  )
}

export default Home
