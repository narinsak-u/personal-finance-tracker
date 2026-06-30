import { NextResponse } from 'next/server';
import { ValidationError, NotFoundError } from './errors';

export function handleError(e: unknown): NextResponse {
  if (e instanceof ValidationError) {
    return NextResponse.json(
      { error: 'Validation failed', details: e.details },
      { status: 400 },
    );
  }
  if (e instanceof NotFoundError) {
    return NextResponse.json(
      { error: e.message },
      { status: 404 },
    );
  }
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 },
  );
}
