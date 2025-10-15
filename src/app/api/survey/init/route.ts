// Init Route - Initialize survey conversation
import { NextRequest, NextResponse } from 'next/server';
import { STEP_DEFINITIONS } from '@/server/config/stepDefinitions';
import { saveSession } from '@/server/services/mongoService';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const userId = uuidv4();

    const initialState = {
      currentPhase: 'intro',
      currentStep: 'intro',
      collectedData: {},
      validationHistory: []
    };

    // Save initial session to MongoDB (skip if not available)
    try {
      await saveSession(userId, initialState);
    } catch (dbError) {
      console.warn('⚠️ MongoDB not available, skipping session save');
    }

    const firstStep = STEP_DEFINITIONS.intro;

    return NextResponse.json({
      userId,
      assistantMessage: firstStep.question,
      component: firstStep.component,
      conversationState: initialState,
      isComplete: false
    });
  } catch (error) {
    console.error('❌ Error in init route:', error);
    return NextResponse.json(
      { error: 'Failed to initialize survey' },
      { status: 500 }
    );
  }
}

