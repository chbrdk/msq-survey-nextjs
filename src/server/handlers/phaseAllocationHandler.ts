// Phase Time Allocation Handler - Builds percentage table from selected phases
import { ConversationState, StepResponse } from '../types/survey.types';
import { manifest } from '../config/manifest';

export async function handlePhaseAllocationStep(
  userResponse: any,
  conversationState: ConversationState
): Promise<StepResponse> {
  
  const collectedData = conversationState.collectedData || {};
  // Check both possible keys (selected_phases OR phase_selection)
  const selectedPhases = collectedData.selected_phases || collectedData.phase_selection || [];
  
  console.log('🎯 Phase Allocation Handler - Selected Phases:', selectedPhases);
  
  // If user provided response, save and move to next step
  if (userResponse && userResponse !== null) {
    console.log('✅ Phase allocation complete! Moving to deep_dive_start...');
    
    // Recursively call processStep to get the deep_dive component
    const { processStep } = await import('../services/stepProcessor');
    return await processStep('deep_dive_start', null, {
      ...conversationState,
      currentStep: 'deep_dive_start',
      collectedData: {
        ...collectedData,
        phase_time_allocation: userResponse
      }
    });
  }
  
  // Build percentage table from selected phases
  const phaseItems = selectedPhases.map((phaseKey: string) => {
    const phaseDef = manifest.validation_rules.workflow_phases.values.find(p => p.value === phaseKey);
    return {
      label: phaseDef?.label || phaseKey,
      key: phaseKey,
      description: phaseDef?.description || ''
    };
  });
  
  console.log('🎯 Built Phase Items:', phaseItems);
  
  return {
    assistantMessage: "Perfect! Now, thinking about a typical week, what percentage of your time goes to each of these phases?\n\n(Should add up to 100%)",
    component: {
      type: 'percentage-table',
      props: {
        items: phaseItems
      }
    },
    nextStep: 'deep_dive_start',
    conversationState: conversationState
  };
}

