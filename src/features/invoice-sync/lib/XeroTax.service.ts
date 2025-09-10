import type { TaxComponent } from 'xero-node'
import AuthenticatedXeroService from '@/lib/xero/AuthenticatedXero.service'
import { ReportTaxType } from '@/lib/xero/constants'
import { type TaxRateCreatePayload, TaxRateCreatePayloadSchema } from '../types'

class XeroTaxService extends AuthenticatedXeroService {
  async getTaxRateForItem(effectiveRate: number) {
    const taxRates = await this.xero.getTaxRates(this.connection.tenantId)
    let matchingTaxRate = taxRates?.find((t) => t.effectiveRate === effectiveRate)
    if (!matchingTaxRate) {
      matchingTaxRate = await this.xero.createTaxRate(
        this.connection.tenantId,
        TaxRateCreatePayloadSchema.parse({
          name: `Copilot Sales Tax ${effectiveRate}%`,
          taxType: ReportTaxType.OUTPUT,
          taxComponents: [
            {
              name: `Copilot Sales Tax - ${effectiveRate}%`,
              rate: effectiveRate,
              isCompound: false,
              isNonRecoverable: false,
            } satisfies TaxComponent,
          ],
        } satisfies TaxRateCreatePayload),
      )
    }
    return matchingTaxRate
  }
}

export default XeroTaxService
