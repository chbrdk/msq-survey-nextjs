# Step Definitions - Umfrage-Schritte Dokumentation

## 🎯 Übersicht

Das MSQ Survey System umfasst **18 Umfrage-Schritte** in **6 Phasen**, die systematisch Workflow-Informationen sammeln und AI-gestützte Vorschläge generieren.

## 📊 Step-Übersicht

| Step | Phase | Typ | Handler | Beschreibung |
|------|-------|-----|---------|--------------|
| 0 | Intro | Static | staticHandler | Willkommensnachricht |
| 1 | Phase 1 | Static | staticHandler | Agentur-Auswahl |
| 2 | Phase 1 | Static | staticHandler | Abteilungs-Auswahl |
| 3 | Phase 1 | Dynamic | roleHandler | Rollen-Vorschläge (AI) |
| 4 | Phase 1 | Static | staticHandler | Job-Level-Auswahl |
| 5 | Phase 1 | Static | staticHandler | Zeitverteilung |
| 6 | Phase 1 | Static | staticHandler | Arbeitsfokus |
| 7 | Phase 2 | Static | staticHandler | Phasen-Übersicht |
| 8 | Phase 2 | Static | staticHandler | Phasen-Auswahl |
| 9 | Phase 2 | Dynamic | phaseAllocationHandler | Phasen-Zeitverteilung (AI) |
| 10 | Phase 3 | Iterative | deepDiveHandler | Deep Dive Start |
| 11 | Phase 4 | Dynamic | toolsHandler | Tool-Vorschläge (AI) |
| 12 | Phase 4 | Iterative | mapToolsHandler | Tools-zu-Phasen-Mapping |
| 13 | Phase 4 | Dynamic | aiIntegrationHandler | AI-Integration-Routing |
| 13b | Phase 4 | Static | staticHandler | AI-Tools-Details |
| 14 | Phase 5 | Dynamic | painPointsHandler | Pain-Point-Vorschläge (AI) |
| 15 | Phase 5 | Static | staticHandler | Zusammenarbeit-Reibungen |
| 16 | Phase 5 | Dynamic | automationHandler | Automatisierungs-Ideen (AI) |
| 17 | Phase 5 | Static | staticHandler | Magic Wand Automatisierung |
| 18 | Phase 6 | Dynamic | recapHandler | Zusammenfassung (AI) |

## 🏗️ Phasen-Struktur

### Phase 1: Introduction (Steps 0-6)
**Zweck**: Grundlegende Benutzer-Informationen sammeln

```typescript
const phase1Steps = [
  'intro',           // 0. Willkommensnachricht
  'greeting_agency', // 1. Agentur-Auswahl
  'department',      // 2. Abteilungs-Auswahl
  'role',            // 3. Rollen-Vorschläge (AI)
  'job_level',       // 4. Job-Level-Auswahl
  'work_type_distribution', // 5. Zeitverteilung
  'primary_focus'    // 6. Arbeitsfokus
];
```

### Phase 2: Phase Overview (Steps 7-9)
**Zweck**: Workflow-Phasen identifizieren und Zeitverteilung

```typescript
const phase2Steps = [
  'phase_overview_intro', // 7. Phasen-Übersicht
  'phase_selection',      // 8. Phasen-Auswahl
  'phase_time_allocation' // 9. Phasen-Zeitverteilung (AI)
];
```

### Phase 3: Deep Dive (Step 10)
**Zweck**: Detaillierte Phasen-Analyse

```typescript
const phase3Steps = [
  'deep_dive_start' // 10. Deep Dive Start (Iterativ)
];
```

### Phase 4: Tool Mapping (Steps 11-13b)
**Zweck**: Tools identifizieren und AI-Integration bewerten

```typescript
const phase4Steps = [
  'collect_tools',    // 11. Tool-Vorschläge (AI)
  'map_tools_start',  // 12. Tools-zu-Phasen-Mapping (Iterativ)
  'ai_integration',   // 13. AI-Integration-Routing (AI)
  'ai_tools_details'  // 13b. AI-Tools-Details
];
```

### Phase 5: Inefficiencies (Steps 14-17)
**Zweck**: Pain Points identifizieren und Automatisierungspotentiale

```typescript
const phase5Steps = [
  'time_wasters',           // 14. Pain-Point-Vorschläge (AI)
  'collaboration_friction', // 15. Zusammenarbeit-Reibungen
  'automation_identification', // 16. Automatisierungs-Ideen (AI)
  'magic_wand_automation'   // 17. Magic Wand Automatisierung
];
```

### Phase 6: Validation (Step 18)
**Zweck**: Zusammenfassung und Validierung

```typescript
const phase6Steps = [
  'quick_recap' // 18. Zusammenfassung (AI)
];
```

## 📋 Detaillierte Step-Definitionen

### Step 0: Intro (Static)

```typescript
intro: {
  type: 'static',
  question: "Welcome! 👋 Before we start, here's what this survey is all about:",
  component: {
    type: 'info-message',
    props: {
      message: "**Welcome to the MSQ Workflow Survey**\n\nThank you for taking 10-15 minutes to help us work smarter across our agencies.\n\n**Our Objective**\n\nWe're mapping workflows across all MSQ agencies to identify where AI and automation can eliminate repetitive tasks – freeing up more time for the strategic and creative work that drives real value for our clients and makes our jobs more fulfilling.\n\n**What We're Looking For**\n\nThis survey is designed to understand the reality of your day-to-day work:\n\n• Which tasks take up most of your time\n• Where you face bottlenecks or repetitive processes\n• What administrative work pulls you away from higher-value activities\n\n**Important to Know**\n\n• This is completely focused on understanding workflows, not individual performance\n• Your responses will directly shape how we integrate AI tools to support your work\n• The survey uses adaptive questioning to be relevant to your specific role\n\n**By sharing your experience, you're helping us build solutions that will:**\n\n• Eliminate time-consuming administrative tasks\n• Reduce project bottlenecks\n• Give you back time to focus on creative and strategic work\n\nYour perspective is crucial to making this initiative successful. Let's build a more efficient and enjoyable workplace together.",
      requiresAcknowledgement: true
    }
  },
  nextStep: 'greeting_agency'
}
```

**Features:**
- **Info-Message**: Willkommensnachricht mit Kontext
- **Acknowledgment**: Benutzer muss bestätigen
- **Rich Text**: Markdown-Formatierung
- **Motivation**: Erklärt den Zweck der Umfrage

---

### Step 1: Greeting Agency (Static)

```typescript
greeting_agency: {
  type: 'static',
  question: "Which agency do you work for?",
  component: {
    type: 'button-group',
    props: {
      options: manifest.validation_rules.agencies.values.map(a => ({ label: a, value: a })),
      multiple: false,
      columns: 2
    }
  },
  nextStep: 'department'
}
```

**Features:**
- **Button Group**: Single-Select-Auswahl
- **Agency Options**: Aus manifest.validation_rules
- **2 Columns**: Responsive Layout
- **Immediate Submit**: Sofortige Weiterleitung

---

### Step 2: Department (Static)

```typescript
department: {
  type: 'static',
  question: "Great! Which team/department are you in?",
  component: {
    type: 'button-group',
    props: {
      options: manifest.validation_rules.departments.values.map(d => ({ label: d, value: d })).concat([{ label: "Other", value: "other" }]),
      multiple: false,
      columns: 2
    }
  },
  nextStep: 'role'
}
```

**Features:**
- **Department Options**: Aus manifest.validation_rules
- **Other Option**: Freie Eingabe möglich
- **Context**: "Great!" zeigt Fortschritt
- **2 Columns**: Responsive Layout

---

### Step 3: Role (Dynamic - AI)

```typescript
role: {
  type: 'dynamic',
  handler: 'role-handler',
  nextStep: 'job_level'
}
```

**AI-Prompt:**
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

**Features:**
- **AI-Generated**: Rollen basierend auf Abteilung
- **Context-Aware**: Berücksichtigt Department
- **Industry-Specific**: Branchenübliche Titel
- **Fallback**: "Other" Option immer verfügbar

---

### Step 4: Job Level (Static)

```typescript
job_level: {
  type: 'static',
  question: "What's your current job level?",
  component: {
    type: 'button-group',
    props: {
      options: manifest.validation_rules.job_levels.values.map(l => ({ label: l, value: l })),
      multiple: false,
      columns: 1
    }
  },
  nextStep: 'work_type_distribution'
}
```

**Features:**
- **Job Levels**: Aus manifest.validation_rules
- **Single Column**: Vertikale Anordnung
- **Hierarchical**: Seniority-basierte Auswahl

---

### Step 5: Work Type Distribution (Static)

```typescript
work_type_distribution: {
  type: 'static',
  question: "Can you estimate what percentage of your time is spent on these categories?\n",
  component: {
    type: 'percentage-table',
    props: {
      items: manifest.validation_rules.billability_categories.values
    }
  },
  nextStep: 'primary_focus'
}
```

**Features:**
- **Percentage Table**: Zeitverteilung auf Kategorien
- **Real-time Validation**: Summe muss 100% ergeben
- **Visual Feedback**: Farbkodierung bei Validierung
- **Auto-calculation**: Automatische Berechnung der Summe

---

### Step 6: Primary Focus (Static)

```typescript
primary_focus: {
  type: 'static',
  question: "Would you describe your work as primarily:",
  component: {
    type: 'button-group',
    props: {
      options: manifest.validation_rules.work_focus.values.map(w => ({ label: w, value: w })),
      multiple: false,
      columns: 1
    }
  },
  nextStep: 'phase_overview_intro'
}
```

**Features:**
- **Work Focus**: Strategisch vs. Operativ
- **Single Column**: Vertikale Anordnung
- **Context**: Übergang zu Phase 2

---

### Step 7: Phase Overview Intro (Static)

```typescript
phase_overview_intro: {
  type: 'static',
  question: "Now let's talk about your workflow phases:",
  component: {
    type: 'info-message',
    props: {
      message: "We've already mapped out your workflow based on focus groups with your agency teams. Now we want to hear from you directly - which phases are you involved in, and where does your time actually go?\n\nLater, we'll ask about the tools you use, so we can focus our efforts on the solutions that will genuinely help make your work easier and more effective.",
      requiresAcknowledgement: true
    }
  },
  nextStep: 'phase_selection'
}
```

**Features:**
- **Context Setting**: Erklärt Phase 2
- **Expectation Management**: Was kommt als nächstes
- **Acknowledgment**: Benutzer muss bestätigen

---

### Step 8: Phase Selection (Static)

```typescript
phase_selection: {
  type: 'static',
  question: "Which of these project phases are you actively involved in?\n\n(Select all that apply)",
  component: {
    type: 'multi-select',
    props: {
      options: manifest.validation_rules.workflow_phases.values,
      min: 1
    }
  },
  nextStep: 'phase_time_allocation'
}
```

**Features:**
- **Multi-Select**: Mehrere Phasen auswählbar
- **Minimum**: Mindestens eine Phase erforderlich
- **Workflow Phases**: Aus manifest.validation_rules

---

### Step 9: Phase Time Allocation (Dynamic - AI)

```typescript
phase_time_allocation: {
  type: 'dynamic',
  handler: 'phase-allocation-handler',
  nextStep: 'deep_dive_start'
}
```

**AI-Prompt:**
```typescript
const systemPrompt = `You are a workflow interviewer for marketing agencies.

USER CONTEXT:
- Selected Phases: ${JSON.stringify(selectedPhases)}
- Role: "${role}"
- Department: "${department}"

TASK: Create a time allocation question for the selected phases.

RETURN EXACTLY this JSON structure:
{
  "assistantMessage": "Great! Now let's understand how you distribute your time across these phases.",
  "component": {
    "type": "percentage-table",
    "props": {
      "question": "How do you distribute your time across these phases?",
      "items": ["Phase 1", "Phase 2", "Phase 3"],
      "total": 100
    }
  },
  "nextStep": "deep_dive_start"
}`;
```

**Features:**
- **Dynamic Items**: Basierend auf ausgewählten Phasen
- **Percentage Table**: Zeitverteilung auf Phasen
- **Context-Aware**: Berücksichtigt Rolle und Abteilung

---

### Step 10: Deep Dive Start (Iterative)

```typescript
deep_dive_start: {
  type: 'iterative',
  handler: 'deep-dive-handler',
  iterateOver: 'selected_phases',
  nextStep: 'collect_tools'
}
```

**Iteration-Logik:**
```typescript
// Process each selected phase
for (const phase of selectedPhases) {
  if (!completedPhases.includes(phase)) {
    return {
      assistantMessage: `Let's dive deeper into the ${phase} phase...`,
      component: {
        type: 'guided-input',
        props: {
          question: `What specific tasks do you do in the ${phase} phase?`,
          hints: [`Think about your daily activities in ${phase}`],
          examples: [`Example: In ${phase}, I typically...`]
        }
      },
      nextStep: 'deep_dive_start',
      conversationState: {
        ...conversationState,
        currentPhase: phase,
        iterationState: {
          currentPhase: phase,
          completedPhases: [...completedPhases]
        }
      }
    };
  }
}
```

**Features:**
- **Iterative**: Wiederholt für jede ausgewählte Phase
- **Context-Aware**: Spezifische Fragen pro Phase
- **Progress Tracking**: Verfolgt abgeschlossene Phasen

---

### Step 11: Collect Tools (Dynamic - AI)

```typescript
collect_tools: {
  type: 'dynamic',
  handler: 'tools-handler',
  nextStep: 'ai_integration'
}
```

**AI-Prompt:**
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

**Features:**
- **Role-Specific**: Tools basierend auf Rolle
- **Multi-Select**: Mehrere Tools auswählbar
- **Industry Examples**: Branchenspezifische Beispiele
- **Minimum**: Mindestens ein Tool erforderlich

---

### Step 12: Map Tools Start (Iterative)

```typescript
map_tools_start: {
  type: 'iterative',
  handler: 'map-tools-handler',
  iterateOver: 'selected_phases',
  nextStep: 'ai_integration'
}
```

**Iteration-Logik:**
```typescript
// Map tools to each selected phase
for (const phase of selectedPhases) {
  if (!completedPhases.includes(phase)) {
    return {
      assistantMessage: `Which tools do you use in the ${phase} phase?`,
      component: {
        type: 'multi-select',
        props: {
          question: `Select tools used in ${phase}:`,
          options: selectedTools,
          min: 1
        }
      },
      nextStep: 'map_tools_start',
      conversationState: {
        ...conversationState,
        currentPhase: phase,
        iterationState: {
          currentPhase: phase,
          completedPhases: [...completedPhases]
        }
      }
    };
  }
}
```

**Features:**
- **Tool-Phase Mapping**: Verknüpft Tools mit Phasen
- **Iterative**: Wiederholt für jede Phase
- **Context-Aware**: Spezifische Tools pro Phase

---

### Step 13: AI Integration (Dynamic - AI)

```typescript
ai_integration: {
  type: 'dynamic',
  handler: 'ai-integration-handler',
  question: "Do you use AI tools in your work?",
  component: {
    type: 'button-group',
    props: {
      options: manifest.validation_rules.ai_usage_options.values,
      multiple: false,
      columns: 1
    }
  },
  nextStep: 'ai_tools_details'
}
```

**Routing-Logik:**
```typescript
// Route based on AI usage
if (aiUsage === 'active' || aiUsage === 'experimental') {
  // User uses AI → Ask for tools
  return {
    assistantMessage: "Which AI tools do you currently use?",
    component: aiToolsComponent,
    nextStep: 'time_wasters'
  };
} else {
  // User doesn't use AI → Skip to time_wasters
  return await processStep('time_wasters', null, conversationState);
}
```

**Features:**
- **Conditional Routing**: Verschiedene Wege basierend auf Antwort
- **AI Usage Options**: Aus manifest.validation_rules
- **Smart Skipping**: Überspringt irrelevante Fragen

---

### Step 13b: AI Tools Details (Static)

```typescript
ai_tools_details: {
  type: 'static',
  question: "Which AI tools do you currently use?\n\n(Select from suggestions or add your own)",
  component: {
    type: 'smart-multi-select',
    props: {
      suggestions: [
        "ChatGPT", "Claude", "Midjourney", "Dall-E", "GitHub Copilot",
        "Cursor", "Notion AI", "Grammarly", "Jasper", "Copy.ai",
        "Runway", "ElevenLabs", "Synthesia", "Other - Add your own"
      ],
      placeholder: "Type an AI tool name...",
      min: 1
    }
  },
  nextStep: 'time_wasters'
}
```

**Features:**
- **Smart Multi-Select**: Vorschläge + Custom Input
- **AI Tools**: Aktuelle AI-Tools
- **Custom Input**: Freie Eingabe möglich
- **Minimum**: Mindestens ein Tool erforderlich

---

### Step 14: Time Wasters (Dynamic - AI)

```typescript
time_wasters: {
  type: 'dynamic',
  handler: 'pain-points-handler',
  nextStep: 'collaboration_friction'
}
```

**AI-Prompt:**
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

**Features:**
- **Role-Specific**: Pain Points basierend auf Rolle
- **Smart Multi-Select**: Vorschläge + Custom Input
- **Min/Max**: 1-5 Auswahlen
- **Custom Input**: Freie Eingabe möglich

---

### Step 15: Collaboration Friction (Static)

```typescript
collaboration_friction: {
  type: 'static',
  question: "Which of these collaboration frictions do you experience?",
  component: {
    type: 'button-group',
    props: {
      options: manifest.validation_rules.collaboration_friction_options.values,
      multiple: false,
      columns: 1
    }
  },
  nextStep: 'automation_identification'
}
```

**Features:**
- **Collaboration Issues**: Vordefinierte Reibungspunkte
- **Single Select**: Eine Hauptauswahl
- **Context**: Übergang zu Automatisierung

---

### Step 16: Automation Identification (Dynamic - AI)

```typescript
automation_identification: {
  type: 'dynamic',
  handler: 'automation-handler',
  nextStep: 'magic_wand_automation'
}
```

**AI-Prompt:**
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

**Features:**
- **Context-Aware**: Basierend auf Pain Points und Tools
- **Realistic**: Praktische Automatisierungs-Ideen
- **Role-Specific**: Angepasst an die Rolle
- **Smart Multi-Select**: Vorschläge + Custom Input

---

### Step 17: Magic Wand Automation (Static)

```typescript
magic_wand_automation: {
  type: 'static',
  question: "If you could wave a magic wand and automate any three things in your role, what would they be?\n\n(Pick up to 3)",
  component: {
    type: 'multi-select',
    props: {
      options: manifest.validation_rules.automation_wishes.values,
      min: 1,
      max: 3
    }
  },
  nextStep: 'quick_recap'
}
```

**Features:**
- **Magic Wand**: Kreative Automatisierungs-Wünsche
- **Multi-Select**: 1-3 Auswahlen
- **Wishful Thinking**: Unbegrenzte Möglichkeiten
- **Context**: Übergang zur Zusammenfassung

---

### Step 18: Quick Recap (Dynamic - AI)

```typescript
quick_recap: {
  type: 'dynamic',
  handler: 'recap-handler',
  nextStep: 'complete'
}
```

**AI-Prompt:**
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

**Features:**
- **Personalized Summary**: Individuelle Zusammenfassung
- **Document Component**: Formatierte Ausgabe
- **Actionable**: Konkrete nächste Schritte
- **Complete**: Markiert Umfrage-Ende

---

## 🔄 Step-Flow-Logik

### Static Step Flow
```
User Response → Static Handler → Update Data → Next Step → Component
```

### Dynamic Step Flow
```
User Response → Dynamic Handler → AI Call → Parse Response → Next Step → Component
```

### Iterative Step Flow
```
User Response → Iterative Handler → Check Phase → Process Phase → Next Iteration or Next Step
```

## 📊 Progress Calculation

### Phase Weights
```typescript
const phaseWeights = {
  'intro': 0,
  'phase1': 20,
  'phase2': 40,
  'phase3': 60,
  'phase4': 80,
  'phase5': 90,
  'phase6': 100
};
```

### Step Progress
```typescript
const stepProgress = getStepProgress(currentStep, currentPhase);
const phaseProgress = phaseWeights[currentPhase] || 0;
const totalProgress = Math.min(phaseProgress + stepProgress, 100);
```

---

**Nächste Schritte**: Siehe [Phase Management](phase-management.md) für detaillierte Dokumentation der Phasen-Verwaltung.