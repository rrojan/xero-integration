/**
 * Base error class for Server components / actions / API routes
 */
export class BaseError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message)
    this.name = 'BaseServerError'
  }
}

export const baseErrorFactory = (name: string, message: string, statusCode: number) => {
  return class extends BaseError {
    constructor(messageOverride?: string) {
      super(messageOverride || message, statusCode)
      this.name = name
    }
  }
}
