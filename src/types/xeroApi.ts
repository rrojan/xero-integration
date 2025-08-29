import type xero from '@/lib/XeroAPI'

export type XeroTokenSet = Awaited<ReturnType<typeof xero.handleApiCallback>>
