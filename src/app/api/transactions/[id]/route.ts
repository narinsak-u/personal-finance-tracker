import { NextRequest, NextResponse } from 'next/server';
import * as transactionService from '@/services/transactionService';
import { handleError } from '@/lib/http';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const transaction = await transactionService.getById(params.id);
    return NextResponse.json(transaction);
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const transaction = await transactionService.update(params.id, body);
    return NextResponse.json(transaction);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await transactionService.remove(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return handleError(e);
  }
}
