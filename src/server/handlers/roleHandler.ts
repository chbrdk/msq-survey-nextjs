// Role Handler - AI-based role suggestions - ported from n8n-workflows/v3/role-handler.js
import { ConversationState, StepResponse } from '../types/survey.types';
import { callOpenAI } from '../services/openaiService';

export async function handleRoleStep(
  userResponse: any,
  conversationState: ConversationState
): Promise<StepResponse> {
  
  const collectedData = conversationState.collectedData || {};
  const department = collectedData.department || 'General';

  console.log('🤖 Role Handler - UserResponse:', userResponse, 'Department:', department);

  // If we have a userResponse, the user already answered!
  // Just save and move to next step
  if (userResponse && userResponse !== null && userResponse !== '_auto_continue_') {
    console.log('✅ User answered role! Moving to next step...');
    
    return {
      assistantMessage: "Great! Moving on...",
      skipGPT: true,
      nextStep: 'job_level',
      conversationState: {
        ...conversationState,
        currentStep: 'job_level',
        collectedData: {
          ...collectedData,
          role: userResponse
        }
      }
    };
  }

  // Call GPT for role suggestions
  const systemPrompt = `You are a workflow interviewer for marketing agencies.

User is in department: "${department}"

TASK: Suggest 5-7 SPECIFIC job roles/titles common in this department.

EXAMPLES by department:
- Technology & Development: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Technical Lead", "DevOps Engineer", "QA Engineer", "Other"]
- UX/UI Design: ["UX Designer", "UI Designer", "Product Designer", "UX Researcher", "Design Lead", "Other"]
- Creative & Design: ["Art Director", "Graphic Designer", "Creative Director", "Motion Designer", "Designer", "Other"]
- Account Management: ["Account Manager", "Account Director", "Client Partner", "Account Executive", "Other"]
- Project/Delivery Management: ["Project Manager", "Scrum Master", "Delivery Manager", "Program Manager", "Other"]
- Content & Strategy: ["Content Strategist", "Copywriter", "Content Manager", "Brand Strategist", "Other"]

IMPORTANT:
- ALWAYS include "Other" as the last option
- Make roles specific to the department
- Use common industry titles
- Keep it to 5-7 options max

RETURN EXACTLY this JSON structure:
{
  "assistantMessage": "And what's your specific role or job title?",
  "component": {
    "type": "button-group",
    "props": {
      "options": [
        {"label": "Role 1", "value": "role_1"},
        {"label": "Role 2", "value": "role_2"},
        {"label": "Other", "value": "other"}
      ],
      "multiple": false,
      "columns": 2
    }
  },
  "nextStep": "job_level"
}`;

  const userPrompt = `Department: ${department}. Suggest relevant roles.`;
  
  const gptResponse = await callOpenAI(systemPrompt, userPrompt);
  
  return {
    assistantMessage: gptResponse.assistantMessage,
    component: gptResponse.component,
    nextStep: gptResponse.nextStep,
    conversationState: conversationState
  };
}

