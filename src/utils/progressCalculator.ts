/**
 * Calculate progress percentage based on current phase and step
 * Survey has 6 phases, each representing ~16.67% of progress
 */

export const SURVEY_PHASES = [
  'introduction',
  'phase_overview',
  'deep_dive',
  'tool_mapping',
  'inefficiencies',
  'validation',
] as const;

export type SurveyPhase = typeof SURVEY_PHASES[number];

// Define progress ranges and steps for each phase
// Total 18 steps distributed across 6 phases
const PHASE_PROGRESS_MAP: Record<SurveyPhase, { start: number; end: number; steps: string[] }> = {
  introduction: { 
    start: 0, 
    end: 38,  // 7 steps (~39% of survey)
    steps: ['greeting_agency', 'department', 'role', 'job_level', 'time_in_role', 'work_type_distribution', 'primary_focus']
  },
  phase_overview: { 
    start: 39, 
    end: 49,  // 2 steps (~10%)
    steps: ['phase_selection', 'phase_time_allocation']
  },
  deep_dive: { 
    start: 50, 
    end: 59,  // 1 iterative step (~10%)
    steps: ['deep_dive_start'] // Iterative - progress calculated differently
  },
  tool_mapping: { 
    start: 60, 
    end: 74,  // 3 steps (1 iterative) (~15%)
    steps: ['collect_tools', 'map_tools_start', 'ai_integration'] // map_tools_start is iterative
  },
  inefficiencies: { 
    start: 75, 
    end: 94,  // 4 steps (~20%)
    steps: ['time_wasters', 'collaboration_friction', 'automation_identification', 'magic_wand_automation']
  },
  validation: { 
    start: 95, 
    end: 100,  // 1 step (~5%)
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

  const phaseConfig = PHASE_PROGRESS_MAP[phase as SurveyPhase];
  if (!phaseConfig) {
    console.warn(`Unknown phase: ${phase}, defaulting to 0%`);
    return 0;
  }

  // For iterative steps (deep_dive, map_tools), calculate progress based on iteration
  if (currentStep && (currentStep === 'deep_dive_start' || currentStep === 'map_tools_start') && iterationState) {
    const phaseRange = phaseConfig.end - phaseConfig.start;
    const iterProgress = ((iterationState.currentIndex + 1) / iterationState.totalPhases) * phaseRange;
    const calculatedProgress = Math.round(phaseConfig.start + iterProgress);
    
    console.log(`🎯 Iteration Progress: Phase=${phase}, Step=${currentStep}, Iteration=${iterationState.currentIndex + 1}/${iterationState.totalPhases}, Progress=${calculatedProgress}%`);
    
    return calculatedProgress;
  }

  // If we have step information and steps are defined for this phase
  if (currentStep && phaseConfig.steps.length > 0) {
    const stepIndex = phaseConfig.steps.indexOf(currentStep);
    
    if (stepIndex !== -1) {
      // Calculate progress within the phase
      const phaseRange = phaseConfig.end - phaseConfig.start;
      const stepProgress = ((stepIndex + 1) / phaseConfig.steps.length) * phaseRange;
      const calculatedProgress = Math.round(phaseConfig.start + stepProgress);
      
      console.log(`🎯 Progress calculation: Phase=${phase}, Step=${currentStep} (${stepIndex + 1}/${phaseConfig.steps.length}), Progress=${calculatedProgress}%`);
      
      return calculatedProgress;
    }
  }

  // Default: return middle of the phase range for better UX
  const midPoint = Math.round((phaseConfig.start + phaseConfig.end) / 2);
  return midPoint;
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
    introduction: 'Introduction & Demographics',
    phase_overview: 'Phase Overview',
    deep_dive: 'Deep Dive',
    tool_mapping: 'Tool Mapping',
    inefficiencies: 'Inefficiencies & Improvements',
    validation: 'Validation & Review',
  };

  return phaseNames[phase as SurveyPhase] || 'Unknown Phase';
};

