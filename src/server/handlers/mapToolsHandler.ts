// Map Tools Handler - Iterates over selected phases and asks which tools are used per phase
import { ConversationState, StepResponse } from '../types/survey.types';
import { manifest } from '../config/manifest';

export async function handleMapToolsStep(
  userResponse: any,
  conversationState: ConversationState
): Promise<StepResponse> {
  
  const collectedData = conversationState.collectedData || {};
  // Check both possible keys (selected_phases OR phase_selection)
  const selectedPhases = collectedData.selected_phases || collectedData.phase_selection || [];
  const toolsList = collectedData.collect_tools || [];
  
  // Get current iteration index
  const iterationState = conversationState.iterationState || { currentIndex: 0, totalPhases: selectedPhases.length };
  const currentIndex = iterationState.currentIndex || 0;
  
  // If user provided response, save it and move to next phase
  if (userResponse && userResponse !== null && userResponse !== '_auto_continue_') {
    const currentPhaseKey = selectedPhases[currentIndex];
    
    // Save tool mapping for current phase
    const updatedData = {
      ...collectedData,
      tool_phase_mapping: {
        ...collectedData.tool_phase_mapping,
        [currentPhaseKey]: userResponse
      }
    };
    
    // Move to next phase
    const nextIndex = currentIndex + 1;
    
    // Check if iteration is complete
    if (nextIndex >= selectedPhases.length) {
      console.log('✅ Tool mapping iteration complete! Moving to ai_integration...');
      
      // Recursively call processStep to get the next step's component
      const { processStep } = await import('../services/stepProcessor');
      return await processStep('ai_integration', null, {
        ...conversationState,
        currentStep: 'ai_integration',
        collectedData: updatedData,
        iterationState: undefined  // Clear iteration state
      });
    }
    
    // Continue to next phase
    const nextPhaseKey = selectedPhases[nextIndex];
    const nextPhaseName = manifest.validation_rules.workflow_phases.values.find(p => p.value === nextPhaseKey)?.label || nextPhaseKey;
    
    // Create multi-select options from tools list
    const toolOptions = Array.isArray(toolsList) 
      ? toolsList.map(t => ({ label: t, value: t }))
      : [];
    
    return {
      assistantMessage: `Great! Now for **${nextPhaseName}** - which of these tools do you use?`,
      component: {
        type: 'multi-select',
        props: {
          options: toolOptions,
          min: 0  // Optional - user can skip if not applicable
        }
      },
      nextStep: 'map_tools_start',
      conversationState: {
        ...conversationState,
        currentStep: 'map_tools_start',
        collectedData: updatedData,
        iterationState: {
          currentIndex: nextIndex,
          totalPhases: selectedPhases.length
        }
      }
    };
  }
  
  // First call - start iteration
  const firstPhaseKey = selectedPhases[currentIndex];
  const firstPhaseName = manifest.validation_rules.workflow_phases.values.find(p => p.value === firstPhaseKey)?.label || firstPhaseKey;
  
  // Create multi-select options from tools list
  const toolOptions = Array.isArray(toolsList) 
    ? toolsList.map(t => ({ label: t, value: t }))
    : [];
  
  if (toolOptions.length === 0) {
    // No tools collected, skip this phase
    return {
      assistantMessage: "Moving on to AI tools...",
      component: null,
      nextStep: 'ai_integration',
      conversationState: {
        ...conversationState,
        currentStep: 'ai_integration',
        iterationState: undefined
      }
    };
  }
  
  return {
    assistantMessage: `Great list! Now let me understand which tools you use for which phases.\n\nFor **${firstPhaseName}**, which of these tools do you use?`,
    component: {
      type: 'multi-select',
      props: {
        options: toolOptions,
        min: 0
      }
    },
    nextStep: 'map_tools_start',
    conversationState: {
      ...conversationState,
      currentStep: 'map_tools_start',
      iterationState: {
        currentIndex: 0,
        totalPhases: selectedPhases.length
      }
    }
  };
}

