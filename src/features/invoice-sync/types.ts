import z from 'zod'

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
