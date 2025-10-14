// Automation Handler - Guided input for automation opportunities - ported from n8n-workflows/v3/automation-handler.js
import { ConversationState, StepResponse } from '../types/survey.types';
import { callOpenAI } from '../services/openaiService';

export async function handleAutomationStep(
  userResponse: any,
  conversationState: ConversationState
): Promise<StepResponse> {
  
  const collectedData = conversationState.collectedData || {};

  // If user already answered, skip GPT
  if (userResponse && userResponse !== null && userResponse !== '_auto_continue_') {
    return {
      assistantMessage: "Great insights! Moving on...",
      skipGPT: true,
      nextStep: 'magic_wand_automation',
      conversationState: {
        ...conversationState,
        currentStep: 'magic_wand_automation',
        collectedData: {
          ...collectedData,
          automation_identification: userResponse
        }
      }
    };
  }

  // This is static-ish but using guided-input component
  const systemPrompt = `You are a workflow interviewer for marketing agencies.

TASK: Present 4 specific questions to identify automation opportunities.

RETURN EXACTLY this JSON structure:
{
  "assistantMessage": "Let's identify tasks that could be automated. Please answer these questions:",
  "component": {
    "type": "guided-input",
    "props": {
      "guidedQuestions": [
        "Which tasks do you find most repetitive or time-consuming?",
        "What activities feel like they take you away from your core work?",
        "Where do you spend time on manual data entry, copying/pasting, or reformatting?",
        "Which tasks require little judgment or creativity to complete?"
      ],
      "multiline": true
    }
  },
  "nextStep": "magic_wand_automation"
}`;

  const userPrompt = "Present automation identification questions.";
  
  const gptResponse = await callOpenAI(systemPrompt, userPrompt);
  
  return {
    assistantMessage: gptResponse.assistantMessage,
    component: gptResponse.component,
    nextStep: gptResponse.nextStep,
    conversationState: conversationState
  };
}

