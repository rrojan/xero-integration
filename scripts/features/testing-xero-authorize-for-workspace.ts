import { z } from 'zod'
import { XeroAPI } from '@/lib/XeroAPI'

const run = async () => {
  const token = z.string().min(1).parse(process.argv[2])

  try {
    const xero = new XeroAPI()
    await xero.authorizeXeroForCopilotWorkspace(token)
    console.info('Xero authorization process completed')
  } catch (error) {
    console.error('Error during Xero authorization:', error)
  }
}

;(async () => {
  await run()
  process.exit(0)
})()
