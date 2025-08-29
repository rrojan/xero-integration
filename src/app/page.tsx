import { Callout } from '@/components/Callout'
import { SilentError } from '@/components/templates/SilentError'
import type { PageProps } from '@/types/componentProps'

const Home = async ({ searchParams }: PageProps) => {
  const { token } = await searchParams

  if (!token) {
    return <SilentError message="No token available" />
  }

  return (
    <main className="pt-6 px-8 sm:px-[100px] lg:px-[220px] pb-[54px]">
      <Callout
        title={'Authorize your account'}
        description={'Log into Xero with an admin account to get started.'}
        variant={'info'}
        actionProps={{
          variant: 'primary',
          label: 'Connect to Xero',
          prefixIcon: 'Check',
        }}
        hrefUrl={`/auth/initiate?token=${token}`}
      />
    </main>
  )
}

export default Home
