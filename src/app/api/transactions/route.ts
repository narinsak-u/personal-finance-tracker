// Route handler:
// - GET /api/transactions (list with optional filters + pagination)
// - POST /api/transactions (create)
import { NextRequest, NextResponse } from "next/server";
import * as transactionService from "@/services/transactionService";
import { handleError } from "@/lib/http";
import type { TransactionFilters } from "@/types/transaction";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    const filters = {
      type: searchParams.get("type") || undefined,
      category: searchParams.get("category") || undefined,
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    } as TransactionFilters;

    const result = await transactionService.list(filters);
    return NextResponse.json(result);
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
