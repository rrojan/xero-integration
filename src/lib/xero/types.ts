import z from 'zod'
import type XeroAPI from '@/lib/xero/XeroAPI'
export type XeroTokenSet = Awaited<ReturnType<typeof XeroAPI.prototype.handleApiCallback>>

export const CreateXeroInvoicePayloadSchema = z.object({
  // contact:
})
