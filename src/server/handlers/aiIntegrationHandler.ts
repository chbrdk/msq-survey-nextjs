// AI Integration Router - Conditional routing based on AI usage
import { ConversationState, StepResponse } from '../types/survey.types';
import { processStep } from '../services/stepProcessor';

export async function handleAiIntegrationStep(
  userResponse: any,
  conversationState: ConversationState
): Promise<StepResponse> {
  
  // This handler acts as a router after the ai_integration question
  // The actual AI usage answer is already saved in collectedData.ai_integration
  const aiUsage = conversationState.collectedData?.ai_integration;
  
  console.log('🔀 AI Integration Router - AI Usage:', aiUsage);

  // Check if user uses AI (active or experimental)
  const usesAI = aiUsage === 'active' || aiUsage === 'experimental';

  if (usesAI) {
    // User uses AI → Ask for tools
    console.log('✅ User uses AI, showing tools question...');
    
    return await processStep('ai_tools_details', null, {
      ...conversationState,
      currentStep: 'ai_tools_details'
    });
  } else {
    // User doesn't use AI → Skip to time_wasters
    console.log('✅ User doesn\'t use AI, skipping to time_wasters...');
    
    return await processStep('time_wasters', null, {
      ...conversationState,
      currentStep: 'time_wasters'
    });
  }
}

