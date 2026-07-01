// Route handler:
// - GET /api/transactions/:id
// - PUT /api/transactions/:id
// - DELETE /api/transactions/:id
import { NextRequest, NextResponse } from 'next/server';
import * as transactionService from '@/services/transactionService';
import { handleError } from '@/lib/http';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const transaction = await transactionService.getById(id);
    return NextResponse.json(transaction);
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const transaction = await transactionService.update(id, body);
    return NextResponse.json(transaction);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await transactionService.remove(id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return handleError(e);
  }
}
