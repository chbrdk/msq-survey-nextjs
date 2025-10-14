// Recap Handler - AI-generated summary - ported from n8n-workflows/v3/recap-handler.js
import { ConversationState, StepResponse } from '../types/survey.types';
import { callOpenAI } from '../services/openaiService';

export async function handleRecapStep(
  userResponse: any,
  conversationState: ConversationState
): Promise<StepResponse> {
  
  const collectedData = conversationState.collectedData || {};

  console.log('🎯 Recap Handler - UserResponse:', userResponse);

  // If user already answered (confirmed or adjust), complete
  if (userResponse && userResponse !== null && userResponse !== '_auto_continue_') {
    console.log('✅ User confirmed recap - completing survey!');
    return {
      assistantMessage: "Perfect! Thank you so much for completing this workflow documentation interview! Your insights are incredibly valuable.\n\nYour workflow documentation has been generated and saved. Have a great day! 🎉",
      component: {
        type: 'info-message',
        props: {
          message: "✅ Survey Complete! Thank you for your time.",
          requiresAcknowledgement: false
        }
      },
      nextStep: 'complete',
      isComplete: true,
      conversationState: {
        ...conversationState,
        currentStep: 'complete',
        collectedData: {
          ...collectedData,
          recap_confirmation: userResponse
        }
      }
    };
  }

  // Build a simple recap from collected data
  const agency = collectedData.greeting_agency || 'your agency';
  const department = collectedData.department || 'your department';
  const role = collectedData.role || 'your role';
  const selectedPhases = collectedData.selected_phases || collectedData.phase_selection || [];
  const toolsList = collectedData.collect_tools || [];
  const painPoints = collectedData.time_wasters || [];
  
  // Format phases
  const phasesText = selectedPhases.length > 0 
    ? selectedPhases.slice(0, 3).join(', ')
    : 'not specified';
  
  // Format tools
  const toolsText = toolsList.length > 0
    ? toolsList.slice(0, 5).join(', ')
    : 'not specified';
  
  // Format pain points
  const painPointsText = Array.isArray(painPoints) && painPoints.length > 0
    ? painPoints.slice(0, 3).join(', ')
    : 'not specified';
  
  const recapMessage = `Perfect! Let me quickly recap to make sure I captured everything correctly:

• **Agency:** ${agency}
• **Department:** ${department}  
• **Role:** ${role}
• **Main Phases:** ${phasesText}
• **Top Tools:** ${toolsText}
• **Key Pain Points:** ${painPointsText}

Does that sound right?`;

  console.log('📝 Generated Recap:', recapMessage);
  
  return {
    assistantMessage: recapMessage,
    component: {
      type: 'button-group',
      props: {
        options: [
          { label: "Yes, that's correct ✅", value: "confirmed" },
          { label: "Need to adjust something", value: "adjust" }
        ],
        multiple: false,
        columns: 2
      }
    },
    nextStep: 'complete',
    conversationState: conversationState
  };
}

