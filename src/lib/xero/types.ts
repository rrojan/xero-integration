import type XeroAPI from '@/lib/xero/XeroAPI'
export type XeroTokenSet = Awaited<ReturnType<typeof XeroAPI.prototype.handleApiCallback>>
