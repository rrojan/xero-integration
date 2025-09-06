import httpStatus from 'http-status'
import { type NextRequest, NextResponse } from 'next/server'
import z, { ZodError } from 'zod'
import APIError from '@/errors/APIError'
import type { StatusableError } from '@/errors/BaseServerError'

type RequestHandler = (req: NextRequest, params: unknown) => Promise<NextResponse>

/**
 * Reusable utility that wraps a given request handler with a global error handler to standardize response structure
 * in case of failures. Catches exceptions thrown from the handler, and returns a formatted error response.
 *
 * @param {RequestHandler} handler - The request handler to wrap.
 * @returns {RequestHandler} The new handler that includes error handling logic.
 * @example
 * const safeHandler = withErrorHandler(async (req: NextRequest) => {
 *   // your request handling logic
 *   if (errorCondition) {
 *     throw new Error("Oh no!")}
 *   return NextResponse.next();
 * });
 *
 * @throws {ZodError} Captures and handles validation errors and responds with status 400 and the issue detail.
 * @throws {APIError} Captures and handles APIError
 */
export const withErrorHandler = (handler: RequestHandler): RequestHandler => {
  return async (req: NextRequest, params: unknown) => {
    // Execute the handler wrapped in a try... catch block
    try {
      return await handler(req, params)
    } catch (error: unknown) {
      // Build error API response and log error
      let status: number = (error as StatusableError).status || httpStatus.INTERNAL_SERVER_ERROR
      let message = 'Something went wrong'

      console.error(error)

      // Build a proper response based on the type of Error encountered
      if (error instanceof ZodError) {
        status = httpStatus.UNPROCESSABLE_ENTITY
        message = z.prettifyError(error)
        const formattedError = z.treeifyError(error)
        console.error('ZodError: ', z.prettifyError(error), '\n', formattedError)
      } else if (error instanceof APIError) {
        status = error.status
        message = error.message || message
      } else if (error instanceof Error && error.message) {
        message = error.message
      }

      return NextResponse.json({ error: message }, { status })
    }
  }
}
