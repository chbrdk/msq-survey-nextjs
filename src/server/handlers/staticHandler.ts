// Static Step Handler - ported from n8n-workflows/v3/static-handler.js
import { STEP_DEFINITIONS } from '../config/stepDefinitions';
import { ConversationState, StepResponse } from '../types/survey.types';
import { processStep } from '../services/stepProcessor';
import { getPhaseForStep } from '../utils/phaseMapper';

export async function handleStaticStep(
  stepId: string,
  userResponse: any,
  conversationState: ConversationState
): Promise<StepResponse> {
  
  const stepDef = STEP_DEFINITIONS[stepId];
  
  if (!stepDef || stepDef.type !== 'static') {
    throw new Error(`Invalid static step: ${stepId}. Type: ${stepDef?.type}`);
  }

  // Update collected data ONLY if userResponse is not null
  const updatedCollectedData = userResponse !== null && userResponse !== undefined && userResponse !== '_auto_continue_'
    ? { ...conversationState.collectedData, [stepId]: userResponse }
    : conversationState.collectedData;

  // Update conversation state with collected data
  const updatedConversationState = {
    ...conversationState,
    collectedData: updatedCollectedData
  };

  // Get next step definition
  const nextStepDef = STEP_DEFINITIONS[stepDef.nextStep];

  // If next step is dynamic, process it directly here instead of returning null
  if (!nextStepDef || nextStepDef.type === 'dynamic') {
    console.log(`🔄 Next step is dynamic (${stepDef.nextStep}), processing it now...`);
    
    // Update currentStep and process the dynamic step immediately
    const dynamicConversationState = {
      ...updatedConversationState,
      currentStep: stepDef.nextStep
    };
    
    // Call processStep recursively to handle the dynamic step
    return await processStep(stepDef.nextStep, null, dynamicConversationState);
  }

  // Return response with next step (static to static)
  // Update currentStep and currentPhase immediately since we're showing the next question
  return {
    assistantMessage: nextStepDef.question!,
    component: nextStepDef.component,
    nextStep: stepDef.nextStep,
    conversationState: {
      ...updatedConversationState,
      currentStep: stepDef.nextStep,
      currentPhase: getPhaseForStep(stepDef.nextStep)
    }
  };
}

