# API-Handler - Backend-Services Dokumentation

## 🎯 Übersicht

Das MSQ Survey System verwendet ein **Handler-basiertes Architektur-Pattern** mit 11 verschiedenen Handlern für die Verarbeitung der 18 Umfrage-Schritte.

## 🏗️ Handler-Architektur

### Handler-Typen

| Typ | Handler | Steps | Beschreibung |
|-----|---------|-------|--------------|
| **Static** | `staticHandler` | 11 Steps | Direkte Logik ohne AI |
| **Dynamic** | `roleHandler` | 1 Step | AI-basierte Rollen-Vorschläge |
| **Dynamic** | `toolsHandler` | 1 Step | AI-basierte Tool-Vorschläge |
| **Dynamic** | `painPointsHandler` | 1 Step | AI-basierte Pain-Point-Vorschläge |
| **Dynamic** | `automationHandler` | 1 Step | AI-basierte Automatisierungs-Ideen |
| **Dynamic** | `recapHandler` | 1 Step | AI-basierte Zusammenfassung |
| **Dynamic** | `aiIntegrationHandler` | 1 Step | Bedingte AI-Integration-Routing |
| **Iterative** | `deepDiveHandler` | 1 Step | Phasen-basierte Iteration |
| **Iterative** | `mapToolsHandler` | 1 Step | Tools-zu-Phasen-Mapping |
| **Iterative** | `phaseAllocationHandler` | 1 Step | Phasen-Zeitverteilung |

## 🔧 Static Handler

**Datei**: `src/server/handlers/staticHandler.ts`

Verarbeitet alle statischen Schritte ohne AI-Integration.

### Interface
```typescript
interface StaticHandler {
  handleStaticStep(
    stepId: string,
    userResponse: any,
    conversationState: ConversationState
  ): Promise<StepResponse>;
}
```

### Verarbeitete Steps
- **Step 0** (Intro): Willkommensnachricht
- **Step 1** (Agency): Agentur-Auswahl
- **Step 2** (Department): Abteilungs-Auswahl
- **Step 4** (Job Level): Job-Level-Auswahl
- **Step 5** (Work Distribution): Zeitverteilung
- **Step 6** (Work Focus): Arbeitsfokus
- **Step 7** (Phase Overview): Phasen-Übersicht
- **Step 8** (Phase Selection): Phasen-Auswahl
- **Step 13b** (AI Tools): AI-Tools-Details
- **Step 15** (Collaboration): Zusammenarbeit-Reibungen
- **Step 17** (Magic Wand): Automatisierungs-Wünsche

### Logik
```typescript
export async function handleStaticStep(
  stepId: string,
  userResponse: any,
  conversationState: ConversationState
): Promise<StepResponse> {
  // 1. Validate step definition
  const stepDef = STEP_DEFINITIONS[stepId];
  
  // 2. Update collected data
  const updatedCollectedData = userResponse !== null
    ? { ...conversationState.collectedData, [stepId]: userResponse }
    : conversationState.collectedData;
  
  // 3. Get next step
  const nextStepDef = STEP_DEFINITIONS[stepDef.nextStep];
  
  // 4. Handle dynamic next steps
  if (nextStepDef.type === 'dynamic') {
    return await processStep(stepDef.nextStep, null, updatedConversationState);
  }
  
  // 5. Return static response
  return {
    assistantMessage: nextStepDef.question!,
    component: nextStepDef.component,
    nextStep: stepDef.nextStep,
    conversationState: updatedConversationState
  };
}
```

---

## 🤖 Dynamic Handlers

### 1. Role Handler

**Datei**: `src/server/handlers/roleHandler.ts`

Generiert rollenspezifische Vorschläge basierend auf der Abteilung.

#### Interface
```typescript
interface RoleHandler {
  handleRoleStep(
    userResponse: any,
    conversationState: ConversationState
  ): Promise<StepResponse>;
}
```

#### Verwendung
- **Step 3** (Role): Rollen-Vorschläge basierend auf Department

#### AI-Prompt
```typescript
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
```

#### Response Processing
```typescript
// If user already answered, skip GPT
if (userResponse && userResponse !== null && userResponse !== '_auto_continue_') {
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
const gptResponse = await callOpenAI(systemPrompt, userPrompt);
return {
  assistantMessage: gptResponse.assistantMessage,
  component: gptResponse.component,
  nextStep: gptResponse.nextStep,
  conversationState: conversationState
};
```

---

### 2. Tools Handler

**Datei**: `src/server/handlers/toolsHandler.ts`

Generiert toolspezifische Vorschläge basierend auf Rolle und Abteilung.

#### Interface
```typescript
interface ToolsHandler {
  handleToolsStep(
    userResponse: any,
    conversationState: ConversationState
  ): Promise<StepResponse>;
}
```

#### Verwendung
- **Step 11** (Collect Tools): Tool-Vorschläge basierend auf Role

#### AI-Prompt
```typescript
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
```

---

### 3. Pain Points Handler

**Datei**: `src/server/handlers/painPointsHandler.ts`

Generiert pain-point-spezifische Vorschläge basierend auf Rolle und Abteilung.

#### Interface
```typescript
interface PainPointsHandler {
  handlePainPointsStep(
    userResponse: any,
    conversationState: ConversationState
  ): Promise<StepResponse>;
}
```

#### Verwendung
- **Step 14** (Time Wasters): Pain-Point-Vorschläge basierend auf Role

#### AI-Prompt
```typescript
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
```

---

### 4. Automation Handler

**Datei**: `src/server/handlers/automationHandler.ts`

Generiert automatisierungs-spezifische Vorschläge basierend auf Rolle und gesammelten Daten.

#### Interface
```typescript
interface AutomationHandler {
  handleAutomationStep(
    userResponse: any,
    conversationState: ConversationState
  ): Promise<StepResponse>;
}
```

#### Verwendung
- **Step 16** (Automation Identification): Automatisierungs-Ideen basierend auf Role und Pain Points

#### AI-Prompt
```typescript
const systemPrompt = `You are a workflow interviewer for marketing agencies.

USER CONTEXT:
- Role: "${role}"
- Department: "${department}"
- Pain Points: ${JSON.stringify(painPoints)}
- Tools Used: ${JSON.stringify(tools)}

TASK: Suggest 8-10 SPECIFIC automation opportunities for this person's role and pain points.

FOCUS ON:
- Pain points that can be automated
- Tools they already use that can be enhanced
- Workflow bottlenecks that can be streamlined
- Repetitive tasks that can be eliminated

EXAMPLES by role:
- Designer: ["Auto-generate design variations", "Automated asset export", "Brand guideline enforcement", "Client feedback collection", "Design system updates", "File organization", "Other"]
- Developer: ["Automated testing", "Code review automation", "Deployment pipelines", "Documentation generation", "Dependency updates", "Performance monitoring", "Other"]
- Account Manager: ["Automated reporting", "Client communication templates", "Budget tracking alerts", "Meeting scheduling", "Follow-up reminders", "Status updates", "Other"]

BE SPECIFIC:
- Focus on their actual pain points
- Suggest realistic automation opportunities
- Use tools they already know
- Always include "Other / Add your own" as last option

RETURN EXACTLY this JSON structure:
{
  "assistantMessage": "Based on your role and the challenges you mentioned, here are some automation opportunities:",
  "component": {
    "type": "smart-multi-select",
    "props": {
      "question": "Which automation opportunities interest you most?",
      "options": [
        "Automation 1",
        "Automation 2",
        "Other / Add your own"
      ],
      "min": 1,
      "max": 5,
      "smartSuggestions": true,
      "allowCustomInput": true,
      "addYourOwnButton": true
    }
  },
  "nextStep": "magic_wand_automation"
}`;
```

---

### 5. Recap Handler

**Datei**: `src/server/handlers/recapHandler.ts`

Generiert eine AI-basierte Zusammenfassung aller gesammelten Antworten.

#### Interface
```typescript
interface RecapHandler {
  handleRecapStep(
    userResponse: any,
    conversationState: ConversationState
  ): Promise<StepResponse>;
}
```

#### Verwendung
- **Step 18** (Quick Recap): Zusammenfassung aller Antworten

#### AI-Prompt
```typescript
const systemPrompt = `You are a workflow interviewer for marketing agencies.

USER CONTEXT:
${JSON.stringify(collectedData, null, 2)}

TASK: Create a comprehensive, personalized summary of this person's workflow and automation opportunities.

INCLUDE:
1. Role and department context
2. Key pain points and challenges
3. Tools they currently use
4. Automation opportunities identified
5. Next steps and recommendations

TONE:
- Professional but conversational
- Actionable and specific
- Focused on their actual situation
- Encouraging and supportive

FORMAT:
- Use bullet points for clarity
- Include specific examples
- Keep it concise but comprehensive
- End with clear next steps

RETURN EXACTLY this JSON structure:
{
  "assistantMessage": "Here's your personalized workflow summary:",
  "component": {
    "type": "document",
    "props": {
      "title": "Your Workflow Analysis",
      "content": "## Your Role & Context\\n\\n**Role:** ${role}\\n**Department:** ${department}\\n\\n## Key Challenges\\n\\n- ${painPoint1}\\n- ${painPoint2}\\n\\n## Current Tools\\n\\n- ${tool1}\\n- ${tool2}\\n\\n## Automation Opportunities\\n\\n- ${automation1}\\n- ${automation2}\\n\\n## Next Steps\\n\\n1. ${nextStep1}\\n2. ${nextStep2}",
      "format": "markdown"
    }
  },
  "nextStep": "complete"
}`;
```

---

### 6. AI Integration Handler

**Datei**: `src/server/handlers/aiIntegrationHandler.ts`

Bedingte Routing-Logik für AI-Integration basierend auf der Antwort.

#### Interface
```typescript
interface AiIntegrationHandler {
  handleAiIntegrationStep(
    userResponse: any,
    conversationState: ConversationState
  ): Promise<StepResponse>;
}
```

#### Verwendung
- **Step 13** (AI Integration): Bedingte Weiterleitung basierend auf AI-Nutzung

#### Routing-Logik
```typescript
export async function handleAiIntegrationStep(
  userResponse: any,
  conversationState: ConversationState
): Promise<StepResponse> {
  // If first call, show question
  if (userResponse === null || userResponse === undefined || userResponse === '_auto_continue_') {
    const stepDef = STEP_DEFINITIONS.ai_integration;
    return {
      assistantMessage: stepDef.question!,
      component: stepDef.component,
      nextStep: 'ai_integration',
      conversationState: conversationState
    };
  }
  
  // User answered - route accordingly
  const aiUsage = userResponse;
  const usesAI = aiUsage === 'active' || aiUsage === 'experimental';
  
  if (usesAI) {
    // User uses AI → Ask for tools
    const stepDef = STEP_DEFINITIONS.ai_tools_details;
    return {
      assistantMessage: stepDef.question!,
      component: stepDef.component,
      nextStep: 'time_wasters',
      conversationState: {
        ...conversationState,
        currentStep: 'ai_tools_details',
        collectedData: {
          ...collectedData,
          ai_integration: aiUsage
        }
      }
    };
  } else {
    // User doesn't use AI → Skip to time_wasters
    return await processStep('time_wasters', null, {
      ...conversationState,
      currentStep: 'time_wasters',
      collectedData: {
        ...collectedData,
        ai_integration: aiUsage
      }
    });
  }
}
```

---

## 🔄 Iterative Handlers

### 1. Deep Dive Handler

**Datei**: `src/server/handlers/deepDiveHandler.ts`

Verarbeitet phasen-basierte Iterationen für detaillierte Phasen-Analyse.

#### Interface
```typescript
interface DeepDiveHandler {
  handleDeepDiveStep(
    userResponse: any,
    conversationState: ConversationState
  ): Promise<StepResponse>;
}
```

#### Verwendung
- **Step 10** (Deep Dive Start): Iteration über ausgewählte Phasen

#### Iteration-Logik
```typescript
export async function handleDeepDiveStep(
  userResponse: any,
  conversationState: ConversationState
): Promise<StepResponse> {
  const { selected_phases } = conversationState.collectedData;
  const { currentPhase, completedPhases = [] } = conversationState.iterationState || {};
  
  // Find next phase to process
  const nextPhase = selected_phases.find(phase => 
    !completedPhases.includes(phase)
  );
  
  if (nextPhase) {
    // Process next phase
    return {
      assistantMessage: `Let's dive deeper into the ${nextPhase} phase...`,
      component: {
        type: 'guided-input',
        props: {
          question: `What specific tasks do you do in the ${nextPhase} phase?`,
          hints: [`Think about your daily activities in ${nextPhase}`],
          examples: [`Example: In ${nextPhase}, I typically...`]
        }
      },
      nextStep: 'deep_dive_start',
      conversationState: {
        ...conversationState,
        currentPhase: nextPhase,
        iterationState: {
          currentPhase: nextPhase,
          completedPhases: [...completedPhases]
        }
      }
    };
  } else {
    // All phases completed
    return await processStep('collect_tools', null, conversationState);
  }
}
```

---

### 2. Map Tools Handler

**Datei**: `src/server/handlers/mapToolsHandler.ts`

Mappt Tools zu spezifischen Phasen.

#### Interface
```typescript
interface MapToolsHandler {
  handleMapToolsStep(
    userResponse: any,
    conversationState: ConversationState
  ): Promise<StepResponse>;
}
```

#### Verwendung
- **Step 12** (Map Tools Start): Iteration über Phasen für Tool-Mapping

---

### 3. Phase Allocation Handler

**Datei**: `src/server/handlers/phaseAllocationHandler.ts`

Verarbeitet Zeitverteilung auf ausgewählte Phasen.

#### Interface
```typescript
interface PhaseAllocationHandler {
  handlePhaseAllocationStep(
    userResponse: any,
    conversationState: ConversationState
  ): Promise<StepResponse>;
}
```

#### Verwendung
- **Step 9** (Phase Time Allocation): Zeitverteilung auf Phasen

---

## 🔧 Handler-Patterns

### Common Patterns

#### 1. Skip GPT Pattern
```typescript
// If user already answered, skip GPT and move to next step
if (userResponse && userResponse !== null && userResponse !== '_auto_continue_') {
  return {
    assistantMessage: "Got it. Moving on...",
    skipGPT: true,
    nextStep: 'next_step',
    conversationState: {
      ...conversationState,
      currentStep: 'next_step',
      collectedData: {
        ...collectedData,
        [currentStep]: userResponse
      }
    }
  };
}
```

#### 2. AI Call Pattern
```typescript
// Call GPT for suggestions
const gptResponse = await callOpenAI(systemPrompt, userPrompt);

return {
  assistantMessage: gptResponse.assistantMessage,
  component: gptResponse.component,
  nextStep: gptResponse.nextStep,
  conversationState: conversationState
};
```

#### 3. Iteration Pattern
```typescript
// Check if iteration is complete
if (allPhasesCompleted) {
  return await processStep('next_step', null, conversationState);
} else {
  // Process next iteration
  return {
    assistantMessage: `Processing ${nextPhase}...`,
    component: nextPhaseComponent,
    nextStep: currentStep,
    conversationState: {
      ...conversationState,
      iterationState: updatedIterationState
    }
  };
}
```

### Error Handling

```typescript
try {
  const result = await handleStep(userResponse, conversationState);
  return result;
} catch (error) {
  console.error(`Error in ${handlerName}:`, error);
  return {
    assistantMessage: "Sorry, something went wrong. Please try again.",
    component: {
      type: 'info-message',
      props: {
        message: "An error occurred. Please refresh and try again.",
        type: 'error'
      }
    },
    nextStep: conversationState.currentStep,
    conversationState: conversationState
  };
}
```

---

**Nächste Schritte**: Siehe [Step Processor](step-processor.md) für detaillierte Dokumentation der Kern-Verarbeitungslogik.