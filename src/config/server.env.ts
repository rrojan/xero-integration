import { z } from 'zod'

const ServerEnvSchema = z.object({
  COPILOT_API_KEY: z
    .string({ error: 'Please provide a valid COPILOT_API_KEY' })
    .min(1),
  DATABASE_URL: z.url({ error: 'Please provide a valid DATABASE_URL' }),
})

const env = ServerEnvSchema.parse(process.env)
export default env
