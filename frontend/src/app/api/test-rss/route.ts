// Test RSS route
import { NextResponse } from 'next/server';
import { fetchFromRSS } from '@/lib/news/rss';

export async function GET() {
  try {
    const articles = await fetchFromRSS(10);
    return NextResponse.json({
      success: true,
      data: articles,
      count: articles.length
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}