import z from 'zod'
import { ReportTaxType } from '@/lib/xero/constants'

export const WebhookTokenSchema = z.object({
  workspaceId: z.string().min(1),
})
export type WebhookToken = z.infer<typeof WebhookTokenSchema>

export const InvoiceCreatedEventSchema = z.object({
  clientId: z.uuid(),
  companyId: z.uuid(),
  collectionMethod: z.enum(['sendInvoice']),
  createdAt: z.iso.datetime(),
  currency: z.string(),
  dueDate: z.iso.datetime(),
  fileUrl: z.string(),
  id: z.string(),
  lineItems: z.array(
    z.object({
      amount: z.number(),
      description: z.string(),
      quantity: z.number(),
      priceId: z.string().optional(),
      productId: z.uuid().optional(),
    }),
  ),
  memo: z.string(),
  number: z.string(),
  sentDate: z.iso.datetime(),
  status: z.enum(['open', 'draft']),
  taxAmount: z.number(),
  taxPercentage: z.number(),
  total: z.number(),
  updatedAt: z.iso.datetime(),
})
export type InvoiceCreatedEvent = z.infer<typeof InvoiceCreatedEventSchema>

export const WebhookEventSchema = z.object({
  eventType: z.literal('invoice.created'),
  data: InvoiceCreatedEventSchema,
})
export type WebhookEvent = z.infer<typeof WebhookEventSchema>

export const ContactCreatePayloadSchema = z.object({
  name: z.string().min(1).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  emailAddress: z.email(),
})
export type ContactCreatePayload = z.infer<typeof ContactCreatePayloadSchema>

export const TaxRateCreatePayloadSchema = z.object({
  taxComponents: z.array(
    z.object({
      name: z.string(),
      rate: z.number(),
      isCompound: z.boolean(),
      isNonRecoverable: z.boolean(),
    }),
  ),
  taxType: z.enum(ReportTaxType),
  name: z.string(),
})
export type TaxRateCreatePayload = z.infer<typeof TaxRateCreatePayloadSchema>
