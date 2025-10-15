// API Route to fetch all survey results
import { NextRequest, NextResponse } from 'next/server';
import { getSurveyResults, getSurveyResultById } from '@/server/services/mongoService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (userId) {
      // Get specific user's result
      const result = await getSurveyResultById(userId);
      if (!result) {
        return NextResponse.json(
          { error: 'Survey result not found' },
          { status: 404 }
        );
      }
      
      // Transform: rename 'data' to 'collectedData' for frontend compatibility
      const transformed = {
        ...result,
        collectedData: result.data || result.collectedData || {},
      };
      delete (transformed as any).data;
      
      return NextResponse.json(transformed);
    }
    
    // Get all results
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');
    
    const results = await getSurveyResults(limit, skip);
    
    // Transform all results: rename 'data' to 'collectedData'
    const transformedResults = results.map((result: any) => ({
      ...result,
      collectedData: result.data || result.collectedData || {},
    }));
    
    return NextResponse.json({
      results: transformedResults,
      count: transformedResults.length,
      limit,
      skip
    });
    
  } catch (error) {
    console.error('Error fetching survey results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch survey results' },
      { status: 500 }
    );
  }
}

