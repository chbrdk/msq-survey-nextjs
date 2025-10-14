// Deep Dive Handler - Iterates over selected phases and asks for activity breakdown
import { ConversationState, StepResponse } from '../types/survey.types';
import { manifest } from '../config/manifest';

export async function handleDeepDiveStep(
  userResponse: any,
  conversationState: ConversationState
): Promise<StepResponse> {
  
  const collectedData = conversationState.collectedData || {};
  // Check both possible keys (selected_phases OR phase_selection)
  const selectedPhases = collectedData.selected_phases || collectedData.phase_selection || [];
  const phaseTimeAllocationArray = collectedData.phase_time_allocation || [];
  
  // Convert phase_time_allocation array to object: { phaseKey: percentage }
  const phaseTimeAllocation: Record<string, number> = {};
  if (Array.isArray(phaseTimeAllocationArray)) {
    phaseTimeAllocationArray.forEach((item: any) => {
      // Find the phase key by matching the label
      const phaseMatch = manifest.validation_rules.workflow_phases.values.find(
        p => p.label === item.phase
      );
      if (phaseMatch) {
        phaseTimeAllocation[phaseMatch.value] = item.percentage || 0;
      }
    });
  }
  
  // Get current iteration index from conversationState
  const iterationState = conversationState.iterationState;
  const isFirstCall = !iterationState; // First call when transitioning from phase_time_allocation
  const currentIndex = iterationState?.currentIndex || 0;
  
  // If user provided response AND this is not the first call, save it and move to next phase
  if (userResponse && userResponse !== null && userResponse !== '_auto_continue_' && !isFirstCall) {
    const currentPhaseKey = selectedPhases[currentIndex];
    
    // Save activity breakdown for current phase
    const updatedData = {
      ...collectedData,
      phase_activities: {
        ...collectedData.phase_activities,
        [currentPhaseKey]: userResponse
      }
    };
    
    // Move to next phase
    const nextIndex = currentIndex + 1;
    
    // Check if iteration is complete
    if (nextIndex >= selectedPhases.length) {
      console.log('✅ Deep dive iteration complete! Moving to collect_tools...');
      
      // Recursively call processStep to get the next step's component
      const { processStep } = await import('../services/stepProcessor');
      return await processStep('collect_tools', null, {
        ...conversationState,
        currentStep: 'collect_tools',
        collectedData: updatedData,
        iterationState: undefined  // Clear iteration state
      });
    }
    
    // Continue to next phase
    const nextPhaseKey = selectedPhases[nextIndex];
    const nextPhaseName = manifest.validation_rules.workflow_phases.values.find(p => p.value === nextPhaseKey)?.label || nextPhaseKey;
    const nextPercentage = phaseTimeAllocation[nextPhaseKey] || 0;
    
    // Get activities for next phase
    const activities = (manifest.activity_definitions as any)[nextPhaseKey] || [];
    const activityOptions = activities.map((a: any) => ({
      label: a.activity,
      key: a.activity.toLowerCase().replace(/[^a-z0-9]+/g, '_')
    }));
    
    return {
      assistantMessage: `Great! That covers ${manifest.validation_rules.workflow_phases.values.find(p => p.value === currentPhaseKey)?.label}.\n\nNow let's dive into **${nextPhaseName}** (you spend ${nextPercentage}% of your time here).\n\nWhat percentage of time within ${nextPhaseName} goes to each of these activities?`,
      component: {
        type: 'percentage-table',
        props: {
          items: activityOptions
        }
      },
      nextStep: 'deep_dive_start',
      conversationState: {
        ...conversationState,
        currentStep: 'deep_dive_start',
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
  const firstPercentage = phaseTimeAllocation[firstPhaseKey] || 0;
  
  // Get activities for first phase
  const activities = (manifest.activity_definitions as any)[firstPhaseKey] || [];
  const activityOptions = activities.map((a: any) => ({
    label: a.activity,
    key: a.activity.toLowerCase().replace(/[^a-z0-9]+/g, '_')
  }));
  
  return {
    assistantMessage: `Let's dive into **${firstPhaseName}** now (you said ${firstPercentage}% of your time).\n\nWithin ${firstPhaseName}, what percentage of time goes to each of these activities?`,
    component: {
      type: 'percentage-table',
      props: {
        items: activityOptions
      }
    },
    nextStep: 'deep_dive_start',
    conversationState: {
      ...conversationState,
      currentStep: 'deep_dive_start',
      iterationState: {
        currentIndex: 0,
        totalPhases: selectedPhases.length
      }
    }
  };
}

