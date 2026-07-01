import { NextResponse } from "next/server"
import { AppError } from "./errors"

export function handleError(e: unknown): NextResponse {
  if (e instanceof AppError) {
    return e.toResponse()
  }
  
  console.error(e)
  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}