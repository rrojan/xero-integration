import z from 'zod'

export const copilotApiKey = z
  .string()
  .min(1)
  .parse(process.env.COPILOT_API_KEY)
