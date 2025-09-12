import { CalloutSection } from '@auth/components/CalloutSection'
import { RealtimeXeroConnections } from '@auth/components/RealtimeXeroConnections'
import AuthService from '@auth/lib/Auth.service'
import type { PageProps } from '@/app/types'
import { AppStateContextProvider } from '@/context/AppContext'
import { serializeClientUser } from '@/lib/copilot/models/ClientUser.model'
import User from '@/lib/copilot/models/User.model'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const Home = async ({ searchParams }: PageProps) => {
  const sp = await searchParams
  const user = await User.authenticate(sp.token)

  const authService = new AuthService(user)
  const xeroConection = await authService.authorizeXeroForCopilotWorkspace(true)

  const clientUser = serializeClientUser(user)

  return (
    <AppStateContextProvider user={clientUser} connectionStatus={!!xeroConection.status}>
      <main className="pt-6 px-8 sm:px-[100px] lg:px-[220px] pb-[54px] h-full">
        <RealtimeXeroConnections user={clientUser} />
        <CalloutSection />
      </main>
    </AppStateContextProvider>
  )
}

export default Home
