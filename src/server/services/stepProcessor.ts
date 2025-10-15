// Step Processor with Phase Iteration Support
import { STEP_DEFINITIONS } from '../config/stepDefinitions';
import { ConversationState, StepResponse } from '../types/survey.types';
import { handleStaticStep } from '../handlers/staticHandler';
import { handleRoleStep } from '../handlers/roleHandler';
import { handleToolsStep } from '../handlers/toolsHandler';
import { handlePainPointsStep } from '../handlers/painPointsHandler';
import { handleAutomationStep } from '../handlers/automationHandler';
import { handleRecapStep } from '../handlers/recapHandler';
import { handleDeepDiveStep } from '../handlers/deepDiveHandler';
import { handleMapToolsStep } from '../handlers/mapToolsHandler';
import { handlePhaseAllocationStep } from '../handlers/phaseAllocationHandler';
import { handleAiIntegrationStep } from '../handlers/aiIntegrationHandler';
import { getPhaseForStep } from '../utils/phaseMapper';

export async function processStep(
  stepId: string,
  userResponse: any,
  conversationState: ConversationState
): Promise<StepResponse> {
  
  console.log(`📊 Processing step: ${stepId}`, { userResponse });

  const stepDef = STEP_DEFINITIONS[stepId];
  
  console.log(`📊 Step definition:`, { type: stepDef.type, handler: stepDef.handler });

  if (!stepDef) {
    throw new Error(`Unknown step: ${stepId}`);
  }

  let result: StepResponse;

  // Static steps
  if (stepDef.type === 'static') {
    result = await handleStaticStep(stepId, userResponse, conversationState);
  } 
  // Iterative steps
  else if (stepDef.type === 'iterative') {
    switch (stepDef.handler) {
      case 'deep-dive-handler':
        result = await handleDeepDiveStep(userResponse, conversationState);
        break;
      
      case 'map-tools-handler':
        result = await handleMapToolsStep(userResponse, conversationState);
        break;
      
      default:
        throw new Error(`Unknown iterative handler: ${stepDef.handler}`);
    }
  }
  // Dynamic steps
  else {
    switch (stepDef.handler) {
      case 'role-handler':
        result = await handleRoleStep(userResponse, conversationState);
        break;
      
      case 'tools-handler':
        result = await handleToolsStep(userResponse, conversationState);
        break;
      
      case 'phase-allocation-handler':
        result = await handlePhaseAllocationStep(userResponse, conversationState);
        break;
      
      case 'pain-points-handler':
        result = await handlePainPointsStep(userResponse, conversationState);
        break;
      
      case 'automation-handler':
        result = await handleAutomationStep(userResponse, conversationState);
        break;
      
      case 'recap-handler':
        result = await handleRecapStep(userResponse, conversationState);
        break;
      
      case 'ai-integration-handler':
        result = await handleAiIntegrationStep(userResponse, conversationState);
        break;
      
      default:
        throw new Error(`Unknown handler: ${stepDef.handler}`);
    }
  }

  // Post-processing: If response has no component but nextStep is static, add the component
  if (!result.component && result.nextStep) {
    const nextStepDef = STEP_DEFINITIONS[result.nextStep];
    
    if (nextStepDef && nextStepDef.type === 'static') {
      console.log(`🔧 Adding component from next static step: ${result.nextStep}`);
      result.component = nextStepDef.component;
      result.assistantMessage = nextStepDef.question || result.assistantMessage;
    }
  }

  // Ensure currentPhase is set correctly
  if (result.conversationState && !result.conversationState.currentPhase) {
    result.conversationState.currentPhase = getPhaseForStep(result.conversationState.currentStep);
  }

  return result;
}

