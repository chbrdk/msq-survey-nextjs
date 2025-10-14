// Pain Points Handler - AI-based pain point suggestions - ported from n8n-workflows/v3/pain-points-handler.js
import { ConversationState, StepResponse } from '../types/survey.types';
import { callOpenAI } from '../services/openaiService';

export async function handlePainPointsStep(
  userResponse: any,
  conversationState: ConversationState
): Promise<StepResponse> {
  
  const collectedData = conversationState.collectedData || {};
  const role = collectedData.role || 'Unknown';
  const department = collectedData.department || 'Unknown';

  // If user already answered, skip GPT
  if (userResponse && userResponse !== null && userResponse !== '_auto_continue_') {
    return {
      assistantMessage: "Got it. Moving on...",
      skipGPT: true,
      nextStep: 'collaboration_friction',
      conversationState: {
        ...conversationState,
        currentStep: 'collaboration_friction',
        collectedData: {
          ...collectedData,
          time_wasters: userResponse
        }
      }
    };
  }

  const systemPrompt = `You are a workflow interviewer for marketing agencies.

USER CONTEXT:
- Role: "${role}"
- Department: "${department}"

TASK: Suggest 6-8 SPECIFIC time wasters / pain points this person commonly faces.

EXAMPLES by role:
- Designer: ["Too many design revisions", "Waiting for feedback/approvals", "File version control issues", "Asset handover delays", "Inconsistent brand guidelines", "Last-minute changes", "Other"]
- Developer: ["Unclear requirements", "Last-minute scope changes", "Manual deployment", "Cross-browser testing", "Code review delays", "Technical debt", "Other"]
- Account Manager: ["Status reporting", "Client communication overhead", "Budget tracking", "Resource allocation issues", "Managing expectations", "Internal coordination", "Other"]
- Project Manager: ["Resource planning", "Status update meetings", "Timeline estimation", "Cross-team dependencies", "Budget tracking", "Risk documentation", "Other"]
- Copywriter: ["Endless revisions", "Unclear briefs", "Brand guideline inconsistencies", "Approval delays", "Content migration", "SEO constraints", "Other"]

BE SPECIFIC:
- Choose pain points ACTUALLY relevant to this role
- Use language they would use
- Focus on operational/workflow issues
- Always include "Other / Add your own" as last option

RETURN EXACTLY this JSON structure:
{
  "assistantMessage": "Thanks — quick one: where do you see the biggest time wasters in your work?",
  "component": {
    "type": "smart-multi-select",
    "props": {
      "question": "Where do you see the biggest time wasters?",
      "options": [
        "Pain point 1",
        "Pain point 2",
        "Other / Add your own"
      ],
      "min": 1,
      "max": 5,
      "smartSuggestions": true,
      "allowCustomInput": true,
      "addYourOwnButton": true
    }
  },
  "nextStep": "collaboration_friction"
}`;

  const userPrompt = `Role: ${role}, Department: ${department}. Suggest pain points they likely face.`;
  
  const gptResponse = await callOpenAI(systemPrompt, userPrompt);
  
  return {
    assistantMessage: gptResponse.assistantMessage,
    component: gptResponse.component,
    nextStep: gptResponse.nextStep,
    conversationState: conversationState
  };
}

