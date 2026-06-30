import { NextRequest, NextResponse } from 'next/server';
import * as transactionService from '@/services/transactionService';
import { handleError } from '@/lib/http';
import { TransactionFilters } from '@/types/transaction';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      type: searchParams.get('type') || undefined,
      category: searchParams.get('category') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
    } as TransactionFilters;
    const transactions = await transactionService.list(filters);
    return NextResponse.json(transactions);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const transaction = await transactionService.create(body);
    return NextResponse.json(transaction, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
