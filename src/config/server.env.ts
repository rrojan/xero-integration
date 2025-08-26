import z from 'zod'

export const COPILOT_API_KEY = z
  .string({ error: 'Please provide a valid COPILOT_API_KEY' })
  .min(1)
  .parse(process.env.COPILOT_API_KEY)

export const DATABASE_URL = z
  .url({ error: 'Please provide a valid DATABASE_URL' })
  .parse(process.env.DATABASE_URL)
