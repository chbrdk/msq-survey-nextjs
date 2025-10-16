# OpenAI Integration - AI-Service Dokumentation

## 🎯 Übersicht

Das MSQ Survey System integriert **OpenAI GPT-4** für 5 dynamische Umfrage-Schritte, die intelligente, kontextbasierte Vorschläge generieren.

## 🤖 OpenAI Service

### Service Interface

**Datei**: `src/server/services/openaiService.ts`

```typescript
interface OpenAIService {
  callOpenAI(
    systemPrompt: string,
    userPrompt: string
  ): Promise<GPTResponse>;
}

interface GPTResponse {
  assistantMessage: string;
  component?: ComponentConfig;
  nextStep: string;
}
```

### Service Implementation

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export async function callOpenAI(
  systemPrompt: string,
  userPrompt: string
): Promise<GPTResponse> {
  
  console.log('🤖 Calling OpenAI with prompt...');
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content;
  
  if (!content) {
    throw new Error('Empty response from OpenAI');
  }

  let parsedContent: any;
  
  try {
    parsedContent = JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to parse OpenAI response:', content);
    throw new Error('Invalid JSON response from OpenAI');
  }

  // Validate response format
  if (!parsedContent.assistantMessage) {
    console.error('❌ Invalid GPT response format:', parsedContent);
    throw new Error('Invalid GPT response format - missing assistantMessage');
  }

  console.log('✅ OpenAI response parsed successfully');

  return {
    assistantMessage: parsedContent.assistantMessage,
    component: parsedContent.component,
    nextStep: parsedContent.nextStep
  };
}
```

## 🎯 AI-Powered Steps

### 1. Role Handler (Step 3)

**Zweck**: Generiert rollenspezifische Vorschläge basierend auf der Abteilung.

#### System Prompt
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

#### User Prompt
```typescript
const userPrompt = `Department: ${department}. Suggest relevant roles.`;
```

#### Expected Response
```json
{
  "assistantMessage": "And what's your specific role or job title?",
  "component": {
    "type": "button-group",
    "props": {
      "options": [
        {"label": "Frontend Developer", "value": "frontend_developer"},
        {"label": "Backend Developer", "value": "backend_developer"},
        {"label": "Full Stack Developer", "value": "full_stack_developer"},
        {"label": "Technical Lead", "value": "technical_lead"},
        {"label": "DevOps Engineer", "value": "devops_engineer"},
        {"label": "Other", "value": "other"}
      ],
      "multiple": false,
      "columns": 2
    }
  },
  "nextStep": "job_level"
}
```

---

### 2. Tools Handler (Step 11)

**Zweck**: Generiert toolspezifische Vorschläge basierend auf Rolle und Abteilung.

#### System Prompt
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

#### User Prompt
```typescript
const userPrompt = `Role: ${role}, Department: ${department}. Suggest relevant tools they use daily.`;
```

---

### 3. Pain Points Handler (Step 14)

**Zweck**: Generiert pain-point-spezifische Vorschläge basierend auf Rolle und Abteilung.

#### System Prompt
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

### 4. Automation Handler (Step 16)

**Zweck**: Generiert automatisierungs-spezifische Vorschläge basierend auf Rolle und gesammelten Daten.

#### System Prompt
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

### 5. Recap Handler (Step 18)

**Zweck**: Generiert eine AI-basierte Zusammenfassung aller gesammelten Antworten.

#### System Prompt
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

## 🔧 Error Handling

### OpenAI API Errors

```typescript
try {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' }
  });
} catch (error) {
  if (error.code === 'insufficient_quota') {
    throw new Error('OpenAI API quota exceeded. Please try again later.');
  } else if (error.code === 'rate_limit_exceeded') {
    throw new Error('OpenAI API rate limit exceeded. Please try again in a moment.');
  } else if (error.code === 'invalid_api_key') {
    throw new Error('OpenAI API key is invalid. Please contact support.');
  } else {
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}
```

### Response Validation

```typescript
// Validate response format
if (!parsedContent.assistantMessage) {
  console.error('❌ Invalid GPT response format:', parsedContent);
  throw new Error('Invalid GPT response format - missing assistantMessage');
}

if (!parsedContent.component) {
  console.error('❌ Invalid GPT response format:', parsedContent);
  throw new Error('Invalid GPT response format - missing component');
}

if (!parsedContent.nextStep) {
  console.error('❌ Invalid GPT response format:', parsedContent);
  throw new Error('Invalid GPT response format - missing nextStep');
}
```

### Fallback Responses

```typescript
// Fallback for AI failures
const fallbackResponse = {
  assistantMessage: "I'm having trouble generating suggestions right now. Please select from the options below or add your own.",
  component: {
    type: 'button-group',
    props: {
      options: [
        { label: 'Option 1', value: 'option_1' },
        { label: 'Option 2', value: 'option_2' },
        { label: 'Other', value: 'other' }
      ],
      multiple: false,
      columns: 1
    }
  },
  nextStep: 'next_step'
};
```

## 📊 Performance Monitoring

### Response Time Tracking

```typescript
const startTime = Date.now();
const response = await callOpenAI(systemPrompt, userPrompt);
const duration = Date.now() - startTime;

console.log(`🤖 OpenAI response time: ${duration}ms`);

if (duration > 10000) {
  console.warn(`Slow OpenAI response: ${duration}ms`);
}
```

### Token Usage Tracking

```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ],
  response_format: { type: 'json_object' }
});

console.log(`🤖 OpenAI usage:`, {
  promptTokens: response.usage?.prompt_tokens,
  completionTokens: response.usage?.completion_tokens,
  totalTokens: response.usage?.total_tokens
});
```

## 🔄 Caching Strategy

### Response Caching

```typescript
// Cache AI responses for identical prompts
const responseCache = new Map();

const getCachedResponse = (systemPrompt: string, userPrompt: string) => {
  const cacheKey = `${systemPrompt}:${userPrompt}`;
  return responseCache.get(cacheKey);
};

const setCachedResponse = (systemPrompt: string, userPrompt: string, response: GPTResponse) => {
  const cacheKey = `${systemPrompt}:${userPrompt}`;
  responseCache.set(cacheKey, {
    response,
    timestamp: Date.now(),
    ttl: 3600000 // 1 hour
  });
};
```

### Cache Invalidation

```typescript
// Clean expired cache entries
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > value.ttl) {
      responseCache.delete(key);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanExpiredCache, 300000);
```

## 🎯 Prompt Engineering

### Prompt Optimization

```typescript
// Optimize prompts for better responses
const optimizePrompt = (basePrompt: string, context: any) => {
  return basePrompt
    .replace(/\${(\w+)}/g, (match, key) => context[key] || match)
    .replace(/\s+/g, ' ')
    .trim();
};
```

### Context Injection

```typescript
// Inject user context into prompts
const injectContext = (prompt: string, userContext: any) => {
  const contextString = Object.entries(userContext)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');
  
  return `${prompt}\n\nUSER CONTEXT:\n${contextString}`;
};
```

## 🔐 Security Considerations

### Input Sanitization

```typescript
// Sanitize user input before sending to OpenAI
const sanitizeInput = (input: string) => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML
    .replace(/[\r\n\t]/g, ' ') // Normalize whitespace
    .substring(0, 1000); // Limit length
};
```

### API Key Security

```typescript
// Validate API key
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
  throw new Error('Invalid OpenAI API key format');
}
```

---

**Nächste Schritte**: Siehe [MongoDB Service](mongodb-service.md) für detaillierte Dokumentation der Datenbank-Integration.