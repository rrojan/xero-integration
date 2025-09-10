import { type Contact, Invoice, LineAmountTypes } from 'xero-node'
import z from 'zod'
import { AccountCode } from '@/lib/xero/constants'
import type XeroAPI from '@/lib/xero/XeroAPI'

/**
 *  @deprecated Use `TokenSet` from `xero-node` instead
 */
export type XeroTokenSet = Awaited<ReturnType<typeof XeroAPI.prototype.handleApiCallback>>

/**
 * Schema for `Invoice` entity in Xero.
 * See "Elements of LineItems"
 * Ref: https://developer.xero.com/documentation/api/accounting/invoices#post-invoices
 *
 */
export const LineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(1).positive(),
  unitAmount: z.number().positive(),
  taxAmount: z.number().nonnegative(),
  // Unique code to identify Xero item
  // Ref:
  accountCode: z.enum(AccountCode),
})
export type LineItem = z.infer<typeof LineItemSchema>

export const ContactSchema = z.object({
  contactID: z.uuid().optional(),
  contactName: z.string().optional(),
})

export const CreateInvoicePayloadSchema = z.object({
  // ACCREC – Unique alpha numeric code identifying invoice (when missing will auto-generate from your Organisation Invoice Settings) (max length = 255)
  invoiceNumber: z.string(),
  // Type of Invoice (see enum details)
  type: z.enum(Invoice.TypeEnum),
  // Predefined contact
  contact: ContactSchema,
  // Date invoice was issued – YYYY-MM-DD. If the Date element is not specified it will default to the current date based on the timezone setting of the organisation
  date: z.iso.date(),
  // Date invoice is due – YYYY-MM-DD
  dueDate: z.iso.date(),
  // Line amounts are exclusive of tax by default if you don’t specify this
  lineAmountTypes: z.enum(LineAmountTypes),
  // Line items
  lineItems: z.array(LineItemSchema),
  // Status (See enum)
  status: z.enum(Invoice.StatusEnum),
})
export type CreateInvoicePayload = z.infer<typeof CreateInvoicePayloadSchema>

export type ValidContact = Contact & { contactID: string }
