import { redirect } from 'next/navigation'
import { SilentError } from '@/components/templates/SilentError'
import xero from '@/lib/XeroAPI'
import type { PageProps } from '@/types/componentProps'

const AuthInitiatePage = async ({ searchParams }: PageProps) => {
  const { token } = await searchParams
  if (!token) {
    return <SilentError message="No token available" />
  }

  const consentUrl = await xero.buildConsentUrl()
  redirect(`${consentUrl}&state=${token}`)
}

export default AuthInitiatePage
