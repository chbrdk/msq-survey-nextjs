// Health Check Route
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'msq-survey-nextjs',
    timestamp: new Date().toISOString()
  });
}

