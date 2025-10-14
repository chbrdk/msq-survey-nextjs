// Step Processor (Master Switch) - ported from n8n-workflows/v3/workflow-v3.json Master Switch logic
import { STEP_DEFINITIONS } from '../config/stepDefinitions';
import { ConversationState, StepResponse } from '../types/survey.types';
import { handleStaticStep } from '../handlers/staticHandler';
import { handleRoleStep } from '../handlers/roleHandler';
import { handleToolsStep } from '../handlers/toolsHandler';
import { handlePainPointsStep } from '../handlers/painPointsHandler';
import { handleAutomationStep } from '../handlers/automationHandler';
import { handleRecapStep } from '../handlers/recapHandler';

export async function processStep(
  stepId: string,
  userResponse: any,
  conversationState: ConversationState
): Promise<StepResponse> {
  
  console.log(`📊 Processing step: ${stepId}`, { userResponse });

  const stepDef = STEP_DEFINITIONS[stepId];

  if (!stepDef) {
    throw new Error(`Unknown step: ${stepId}`);
  }

  let result: StepResponse;

  // Static steps
  if (stepDef.type === 'static') {
    result = await handleStaticStep(stepId, userResponse, conversationState);
  } else {
    // Dynamic steps - Switch based on handler
    switch (stepDef.handler) {
      case 'role-handler':
        result = await handleRoleStep(userResponse, conversationState);
        break;
      
      case 'tools-handler':
        result = await handleToolsStep(userResponse, conversationState);
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

  return result;
}

