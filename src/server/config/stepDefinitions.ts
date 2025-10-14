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
  
  // ==================== PHASE 1: INTRODUCTION ====================
  
  // 1. GREETING AGENCY (Static)
  greeting_agency: {
    type: 'static',
    question: "Hi! I'm conducting workflow documentation interviews to better understand how our teams work. This will take about 15-20 minutes.\n\nWhich agency do you work for?",
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
    nextStep: 'time_in_role'
  },
  
  // 5. TIME IN ROLE (Static)
  time_in_role: {
    type: 'static',
    question: "How long have you been in your current role?",
    component: {
      type: 'button-group',
      props: {
        options: manifest.validation_rules.time_in_role.values.map(t => ({ label: t, value: t })),
        multiple: false,
        columns: 2
      }
    },
    nextStep: 'work_type_distribution'
  },
  
  // 6. WORK TYPE DISTRIBUTION (Static)
  work_type_distribution: {
    type: 'static',
    question: "Can you estimate what percentage of your time is spent on these categories?\n\n(These should add up to approximately 100%)",
    component: {
      type: 'percentage-table',
      props: {
        items: manifest.validation_rules.billability_categories.values
      }
    },
    nextStep: 'primary_focus'
  },
  
  // 7. PRIMARY FOCUS (Static)
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
    nextStep: 'phase_selection'
  },
  
  // ==================== PHASE 2: PHASE OVERVIEW ====================
  
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
    nextStep: 'map_tools_start'
  },
  
  // 12. MAP TOOLS TO PHASES (Iteration Controller)
  map_tools_start: {
    type: 'iterative',
    handler: 'map-tools-handler',
    iterateOver: 'selected_phases',
    nextStep: 'ai_integration'
  },
  
  // 13. AI INTEGRATION (Static)
  ai_integration: {
    type: 'static',
    question: "Quick one — do you use AI tools in your work?",
    component: {
      type: 'button-group',
      props: {
        options: manifest.validation_rules.ai_usage_options.values,
        multiple: false,
        columns: 1
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
    question: "Quick one — which of these collaboration frictions do you experience?",
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

