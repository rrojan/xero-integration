import { Callout } from '@/components/Callout'

export default function Home() {
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
      />
    </main>
  )
}
