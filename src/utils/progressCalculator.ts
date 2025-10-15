/**
 * Calculate progress percentage based on current phase and step
 * Survey has 6 phases, each representing ~16.67% of progress
 */

export const SURVEY_PHASES = [
  'intro',
  'introduction',
  'phase_overview',
  'deep_dive',
  'tool_mapping',
  'inefficiencies',
  'validation',
] as const;

export type SurveyPhase = typeof SURVEY_PHASES[number];

// Static progress mapping - each step has a fixed percentage
const STEP_PROGRESS: Record<string, number> = {
  // Intro (0-5%)
  'intro': 5,
  
  // Introduction (6-35%)
  'greeting_agency': 10,
  'department': 15,
  'role': 20,
  'job_level': 25,
  'work_type_distribution': 30,
  'primary_focus': 35,
  
  // Phase Overview (36-45%)
  'phase_overview_intro': 36,
  'phase_selection': 40,
  'phase_time_allocation': 45,
  
  // Deep Dive (46-60%) - iterative steps will use dynamic calculation
  'deep_dive_start': 55,
  
  // Tool Mapping (61-75%)
  'collect_tools': 65,
  'map_tools_start': 70,
  'ai_integration': 72,
  'ai_tools_details': 74,
  
  // Inefficiencies (76-90%)
  'time_wasters': 80,
  'collaboration_friction': 84,
  'automation_identification': 87,
  'magic_wand_automation': 90,
  
  // Validation (91-100%)
  'quick_recap': 95,
  'complete': 100
};

// Keep phase ranges for phase names
const PHASE_PROGRESS_MAP: Record<SurveyPhase, { start: number; end: number; steps: string[] }> = {
  intro: {
    start: 0,
    end: 5,
    steps: ['intro']
  },
  introduction: { 
    start: 6, 
    end: 35,
    steps: ['greeting_agency', 'department', 'role', 'job_level', 'work_type_distribution', 'primary_focus']
  },
  phase_overview: { 
    start: 36, 
    end: 45,
    steps: ['phase_overview_intro', 'phase_selection', 'phase_time_allocation']
  },
  deep_dive: { 
    start: 46, 
    end: 60,
    steps: ['deep_dive_start']
  },
  tool_mapping: { 
    start: 61, 
    end: 75,
    steps: ['collect_tools', 'map_tools_start', 'ai_integration', 'ai_tools_details']
  },
  inefficiencies: { 
    start: 76, 
    end: 90,
    steps: ['time_wasters', 'collaboration_friction', 'automation_identification', 'magic_wand_automation']
  },
  validation: { 
    start: 91, 
    end: 100,
    steps: ['quick_recap', 'complete']
  },
};

/**
 * Calculate progress percentage based on current phase and step
 * @param phase - Current phase ID
 * @param currentStep - Current step ID (optional)
 * @param iterationState - Current iteration state (optional)
 * @returns Progress percentage (0-100)
 */
export const calculateProgress = (
  phase: string | undefined,
  currentStep?: string | undefined,
  iterationState?: { currentIndex: number; totalPhases: number }
): number => {
  if (!phase) return 0;

  // Use static step mapping first
  if (currentStep && STEP_PROGRESS[currentStep]) {
    // For iterative steps with iteration state, calculate within the step's range
    if ((currentStep === 'deep_dive_start' || currentStep === 'map_tools_start') && iterationState) {
      const phaseConfig = PHASE_PROGRESS_MAP[phase as SurveyPhase];
      if (phaseConfig) {
        const phaseRange = phaseConfig.end - phaseConfig.start;
        const iterProgress = ((iterationState.currentIndex + 1) / iterationState.totalPhases) * phaseRange;
        const calculatedProgress = Math.round(phaseConfig.start + iterProgress);
        
        console.log(`🎯 Iteration Progress: Step=${currentStep}, Iteration=${iterationState.currentIndex + 1}/${iterationState.totalPhases}, Progress=${calculatedProgress}%`);
        
        return calculatedProgress;
      }
    }
    
    // Use static progress for this step
    const progress = STEP_PROGRESS[currentStep];
    console.log(`🎯 Static Progress: Step=${currentStep}, Progress=${progress}%`);
    return progress;
  }

  // Fallback: use phase range
  const phaseConfig = PHASE_PROGRESS_MAP[phase as SurveyPhase];
  if (phaseConfig) {
    const midPoint = Math.round((phaseConfig.start + phaseConfig.end) / 2);
    console.log(`⚠️ No step info, using phase midpoint: Phase=${phase}, Progress=${midPoint}%`);
    return midPoint;
  }

  console.warn(`Unknown phase and step: ${phase}/${currentStep}, defaulting to 0%`);
  return 0;
};

/**
 * Calculate detailed progress including within-phase progress
 * @param phase - Current phase ID
 * @param currentStepOrder - Current step order within phase (optional)
 * @param totalStepsInPhase - Total steps in current phase (optional)
 * @returns Progress percentage (0-100)
 */
export const calculateDetailedProgress = (
  phase: string | undefined,
  currentStepOrder?: number,
  totalStepsInPhase?: number
): number => {
  if (!phase) return 0;

  const phaseConfig = PHASE_PROGRESS_MAP[phase as SurveyPhase];
  if (!phaseConfig) {
    console.warn(`Unknown phase: ${phase}, defaulting to 0%`);
    return 0;
  }

  // If we have step information, calculate within-phase progress
  if (currentStepOrder && totalStepsInPhase && totalStepsInPhase > 0) {
    const phaseRange = phaseConfig.end - phaseConfig.start;
    const stepProgress = (currentStepOrder / totalStepsInPhase) * phaseRange;
    return Math.round(phaseConfig.start + stepProgress);
  }

  // Otherwise, return the start of the phase range
  return phaseConfig.start;
};

/**
 * Get phase name for display
 */
export const getPhaseName = (phase: string | undefined): string => {
  const phaseNames: Record<SurveyPhase, string> = {
    intro: 'Welcome',
    introduction: 'Introduction & Demographics',
    phase_overview: 'Phase Overview',
    deep_dive: 'Deep Dive',
    tool_mapping: 'Tool Mapping',
    inefficiencies: 'Inefficiencies & Improvements',
    validation: 'Validation & Review',
  };

  return phaseNames[phase as SurveyPhase] || 'Unknown Phase';
};

