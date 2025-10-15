// AI Integration Router - Conditional routing based on AI usage
import { ConversationState, StepResponse } from '../types/survey.types';
import { processStep } from '../services/stepProcessor';
import { STEP_DEFINITIONS } from '../config/stepDefinitions';

export async function handleAiIntegrationStep(
  userResponse: any,
  conversationState: ConversationState
): Promise<StepResponse> {
  
  const collectedData = conversationState.collectedData || {};
  
  // If this is the first call (no userResponse), show the question
  if (userResponse === null || userResponse === undefined || userResponse === '_auto_continue_') {
    console.log('🔀 AI Integration - Showing initial question...');
    
    const stepDef = STEP_DEFINITIONS.ai_integration;
    
    return {
      assistantMessage: stepDef.question!,
      component: stepDef.component,
      nextStep: 'ai_integration',
      conversationState: conversationState
    };
  }
  
  // User has answered - save the answer and route accordingly
  const aiUsage = userResponse;
  
  console.log('🔀 AI Integration Router - AI Usage:', aiUsage);

  // Check if user uses AI (active or experimental)
  const usesAI = aiUsage === 'active' || aiUsage === 'experimental';
  
  console.log('🔀 AI Integration Router - Uses AI:', usesAI, 'aiUsage:', aiUsage);

  if (usesAI) {
    // User uses AI → Ask for tools
    console.log('✅ User uses AI, showing tools question...');
    
    const stepDef = STEP_DEFINITIONS.ai_tools_details;
    
    return {
      assistantMessage: stepDef.question!,
      component: stepDef.component,
      nextStep: 'time_wasters',
      conversationState: {
        ...conversationState,
        currentStep: 'ai_tools_details',
        collectedData: {
          ...collectedData,
          ai_integration: aiUsage
        }
      }
    };
  } else {
    // User doesn't use AI → Skip to time_wasters
    console.log('✅ User doesn\'t use AI, skipping to time_wasters...');
    
    return await processStep('time_wasters', null, {
      ...conversationState,
      currentStep: 'time_wasters',
      collectedData: {
        ...collectedData,
        ai_integration: aiUsage
      }
    });
  }
}

