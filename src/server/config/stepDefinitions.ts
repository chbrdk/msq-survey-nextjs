// Complete Step Definitions with Phase Iteration Support
import { manifest } from './manifest';

export interface StepDefinition {
  type: 'static' | 'dynamic' | 'iterative';
  handler?: string;
  question?: string;
  component?: any;
  nextStep: string;
  iterateOver?: 'selected_phases';  // For iterative steps
  phaseKey?: string;  // Current phase being iterated
}

export const STEP_DEFINITIONS: Record<string, StepDefinition> = {
  
  // ==================== INTRO ====================
  
  // 0. WELCOME INTRO (Static)
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
  },
  
  // ==================== PHASE 1: INTRODUCTION ====================
  
  // 1. GREETING AGENCY (Static)
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
  },
  
  // 2. DEPARTMENT (Static)
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
  },
  
  // 3. ROLE (Dynamic - department-based AI suggestions)
  role: {
    type: 'dynamic',
    handler: 'role-handler',
    nextStep: 'job_level'
  },
  
  // 4. JOB LEVEL (Static)
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
  },
  
  // 5. WORK TYPE DISTRIBUTION (Static)
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
  },
  
  // 6. PRIMARY FOCUS (Static)
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
  },
  
  // ==================== PHASE 2: PHASE OVERVIEW ====================
  
  // 7. PHASE OVERVIEW INTRO (Static - Context before phase selection)
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
  },
  
  // 8. PHASE SELECTION (Static - Multi-Select)
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
  },
  
  // 9. PHASE TIME ALLOCATION (Dynamic - builds from selected_phases)
  phase_time_allocation: {
    type: 'dynamic',
    handler: 'phase-allocation-handler',
    nextStep: 'deep_dive_start'
  },
  
  // ==================== PHASE 3: DEEP DIVE (ITERATIVE) ====================
  
  // 10. DEEP DIVE START (Iteration Controller)
  deep_dive_start: {
    type: 'iterative',
    handler: 'deep-dive-handler',
    iterateOver: 'selected_phases',
    nextStep: 'collect_tools'
  },
  
  // ==================== PHASE 4: TOOL MAPPING ====================
  
  // 11. COLLECT TOOLS (Dynamic - AI-based)
  collect_tools: {
    type: 'dynamic',
    handler: 'tools-handler',
    nextStep: 'ai_integration'  // Skip map_tools_start, go directly to AI question
  },
  
  // 12. MAP TOOLS TO PHASES (Iteration Controller)
  map_tools_start: {
    type: 'iterative',
    handler: 'map-tools-handler',
    iterateOver: 'selected_phases',
    nextStep: 'ai_integration'
  },
  
  // 13. AI INTEGRATION (Dynamic - conditional routing based on AI usage)
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
    nextStep: 'ai_tools_details'  // Will be overridden by handler
  },
  
  // 13b. AI TOOLS DETAILS (Static - smart-multi-select with custom input)
  ai_tools_details: {
    type: 'static',
    question: "Which AI tools do you currently use?\n\n(Select from suggestions or add your own)",
    component: {
      type: 'smart-multi-select',
      props: {
        suggestions: [
          "ChatGPT",
          "Claude",
          "Midjourney",
          "Dall-E",
          "GitHub Copilot",
          "Cursor",
          "Notion AI",
          "Grammarly",
          "Jasper",
          "Copy.ai",
          "Runway",
          "ElevenLabs",
          "Synthesia",
          "Other - Add your own"
        ],
        placeholder: "Type an AI tool name...",
        min: 1
      }
    },
    nextStep: 'time_wasters'
  },
  
  // ==================== PHASE 5: INEFFICIENCIES ====================
  
  // 14. TIME WASTERS (Dynamic - AI-based)
  time_wasters: {
    type: 'dynamic',
    handler: 'pain-points-handler',
    nextStep: 'collaboration_friction'
  },
  
  // 15. COLLABORATION FRICTION (Static)
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
  },
  
  // 16. AUTOMATION IDENTIFICATION (Dynamic)
  automation_identification: {
    type: 'dynamic',
    handler: 'automation-handler',
    nextStep: 'magic_wand_automation'
  },
  
  // 17. MAGIC WAND AUTOMATION (Static)
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
  },
  
  // ==================== PHASE 6: VALIDATION ====================
  
  // 18. QUICK RECAP (Dynamic - AI summary)
  quick_recap: {
    type: 'dynamic',
    handler: 'recap-handler',
    nextStep: 'complete'
  }
  
};

