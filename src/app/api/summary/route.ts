import { NextRequest, NextResponse } from 'next/server';
import * as summaryService from '@/services/summaryService';
import { handleError } from '@/lib/http';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Both "from" and "to" query parameters are required' },
        { status: 400 },
      );
    }

    const summary = await summaryService.getSummary(from, to);
    return NextResponse.json(summary);
  } catch (e) {
    return handleError(e);
  }
}
