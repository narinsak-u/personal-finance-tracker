import { NextResponse } from "next/server"
import type { ZodIssue } from "zod"
import { z, ZodError } from "zod"

export abstract class AppError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = this.constructor.name
  }
  abstract toResponse(): NextResponse
}

export class ValidationError extends AppError {
  constructor(public details: ZodIssue[]) {
    super("Validation failed", 400)
  }
  toResponse(): NextResponse {
    return NextResponse.json(
      { error: this.message, details: this.details },
      { status: this.status },
    )
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404)
  }
  toResponse(): NextResponse {
    return NextResponse.json({ error: this.message }, { status: this.status })
  }
}

export function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (e) {
    if (e instanceof ZodError) {
      throw new ValidationError(e.issues)
    }
    throw e
  }
}