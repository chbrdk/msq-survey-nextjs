// Process Route - Process user responses
import { NextRequest, NextResponse } from 'next/server';
import { processStep } from '@/server/services/stepProcessor';
import { saveSession, saveSurveyResult } from '@/server/services/mongoService';

export async function POST(req: NextRequest) {
  try {
    const { userId, userResponse, conversationState } = await req.json();

    if (!userId || !conversationState) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const stepId = conversationState.currentStep;
    console.log(`🔄 Processing step: ${stepId} for user: ${userId}`);

    const result = await processStep(stepId, userResponse, conversationState);

    // Save updated session to MongoDB (skip if not available)
    try {
      await saveSession(userId, result.conversationState);
    } catch (dbError) {
      console.warn('⚠️ MongoDB not available, skipping session save');
    }

    const isComplete = result.nextStep === 'complete' || result.isComplete;

    // If survey is complete, save final result (skip if not available)
    if (isComplete) {
      try {
        await saveSurveyResult(userId, result.conversationState.collectedData);
      } catch (dbError) {
        console.warn('⚠️ MongoDB not available, skipping result save');
      }
    }

    return NextResponse.json({
      assistantMessage: result.assistantMessage,
      component: result.component,
      conversationState: result.conversationState,
      isComplete
    });
  } catch (error) {
    console.error('❌ Error in process route:', error);
    return NextResponse.json(
      { error: 'Failed to process step', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

