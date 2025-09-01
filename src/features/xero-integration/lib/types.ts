import type XeroAPI from '@/features/xero-integration/lib/XeroAPI'
export type XeroTokenSet = Awaited<ReturnType<typeof XeroAPI.prototype.handleApiCallback>>
