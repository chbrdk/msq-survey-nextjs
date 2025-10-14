// Tools Handler - AI-based tool suggestions - ported from n8n-workflows/v3/tools-handler.js
import { ConversationState, StepResponse } from '../types/survey.types';
import { callOpenAI } from '../services/openaiService';

export async function handleToolsStep(
  userResponse: any,
  conversationState: ConversationState
): Promise<StepResponse> {
  
  const collectedData = conversationState.collectedData || {};
  const role = collectedData.role || 'Unknown';
  const department = collectedData.department || 'Unknown';
  const jobLevel = collectedData.job_level || 'Unknown';

  // If user already answered, skip GPT and move to next step
  if (userResponse && userResponse !== null && userResponse !== '_auto_continue_') {
    return {
      assistantMessage: "Thanks! Moving on...",
      skipGPT: true,
      nextStep: 'ai_integration',
      conversationState: {
        ...conversationState,
        currentStep: 'ai_integration',
        collectedData: {
          ...collectedData,
          collect_tools: userResponse
        }
      }
    };
  }

  const systemPrompt = `You are a workflow interviewer for marketing agencies.

USER CONTEXT:
- Role: "${role}"
- Department: "${department}"
- Job Level: "${jobLevel}"

TASK: Suggest 10-15 SPECIFIC tools/software this person ACTUALLY uses in their daily work.

EXAMPLES by role:
- UX/UI Designer: Figma, Sketch, Adobe XD, InVision, Miro, FigJam, Photoshop, Illustrator, Zeplin, Abstract, Notion
- Frontend Developer: VS Code, GitHub, Figma, Chrome DevTools, Postman, Docker, Vercel, Netlify, npm, Slack
- Backend Developer: VS Code, GitHub, Docker, Postman, AWS, PostgreSQL, Redis, Jira, Slack, Notion
- Account Manager: Salesforce, HubSpot, Slack, Zoom, Google Meet, Gmail, Google Sheets, Notion, Asana, Teams
- Project Manager: Jira, Asana, Notion, Slack, Zoom, Google Sheets, Miro, Confluence, Teams, Monday.com
- Copywriter: Google Docs, Grammarly, Hemingway, Notion, Slack, WordPress, Contentful, Figma (for context)

BE SPECIFIC:
- Choose tools that ACTUALLY match the role
- Include both primary tools and collaboration tools
- Mix of design, dev, project management, communication tools
- Always include "Other" as last option

RETURN EXACTLY this JSON structure:
{
  "assistantMessage": "Thanks! Now let's talk about tools.\\n\\nWhich tools/software do you use regularly in your work?",
  "component": {
    "type": "multi-select",
    "props": {
      "options": [
        {"label": "Tool 1", "value": "tool_1"},
        {"label": "Tool 2", "value": "tool_2"},
        {"label": "Other", "value": "other"}
      ],
      "min": 1
    }
  },
  "nextStep": "ai_integration"
}`;

  const userPrompt = `Role: ${role}, Department: ${department}. Suggest relevant tools they use daily.`;
  
  const gptResponse = await callOpenAI(systemPrompt, userPrompt);
  
  return {
    assistantMessage: gptResponse.assistantMessage,
    component: gptResponse.component,
    nextStep: gptResponse.nextStep,
    conversationState: conversationState
  };
}

