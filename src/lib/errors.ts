import { ZodIssue } from 'zod';

export class ValidationError extends Error {
  constructor(public details: ZodIssue[]) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}