import type { PageProps } from '@/app/types'
import { AppStateContextProvider } from '@/context/AppContext'
import { CalloutSection } from '@/features/auth/components/CalloutSection'
import { RealtimeXeroConnections } from '@/features/auth/components/RealtimeXeroConnections'
import XeroConnectionsService from '@/features/auth/lib/XeroConnections.service'
import { serializeClientUser } from '@/lib/copilot/models/ClientUser.model'
import User from '@/lib/copilot/models/User.model'

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
        <form
          action={async () => {
            'use server'
            // Dummy action to test re-authorization flow
            const user = await User.authenticate((await searchParams).token as string) // capture only the string
            const svc = new XeroConnectionsService(user)
            await svc.authorizeXeroForCopilotWorkspace()
          }}
        >
          <button className="border border-gray-200 px-4 py-1 mt-4 rounded-sm" type="submit">
            Check authorization
          </button>
        </form>
      </main>
    </AppStateContextProvider>
  )
}

export default Home
