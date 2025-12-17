import { NextResponse } from 'next/server'

type ErrorPayload = {
  error: string
  details?: unknown
}

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }

  toJSON(): ErrorPayload {
    return {
      error: this.message,
      ...(this.details ? { details: this.details } : {}),
    }
  }

  toResponse() {
    return NextResponse.json(this.toJSON(), { status: this.status })
  }
}

export function handleApiError(
  error: unknown,
  fallbackMessage = 'Internal server error',
  fallbackStatus = 500
) {
  if (error instanceof ApiError) {
    return error.toResponse()
  }

  console.error('[API ERROR]', error)
  return NextResponse.json({ error: fallbackMessage }, { status: fallbackStatus })
}
