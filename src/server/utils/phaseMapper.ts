// Phase Mapper - Maps steps to their respective phases
export function getPhaseForStep(stepId: string): string {
  // Intro phase
  if (stepId === 'intro') {
    return 'intro';
  }
  
  // Introduction phase
  if ([
    'greeting_agency',
    'department',
    'role',
    'job_level',
    'work_type_distribution',
    'primary_focus'
  ].includes(stepId)) {
    return 'introduction';
  }
  
  // Phase Overview
  if ([
    'phase_overview_intro',
    'phase_selection',
    'phase_time_allocation'
  ].includes(stepId)) {
    return 'phase_overview';
  }
  
  // Deep Dive
  if ([
    'deep_dive_start'
  ].includes(stepId)) {
    return 'deep_dive';
  }
  
  // Tool Mapping
  if ([
    'collect_tools',
    'map_tools_start',
    'ai_integration',
    'ai_tools_details'
  ].includes(stepId)) {
    return 'tool_mapping';
  }
  
  // Inefficiencies
  if ([
    'time_wasters',
    'collaboration_friction',
    'automation_identification',
    'magic_wand_automation'
  ].includes(stepId)) {
    return 'inefficiencies';
  }
  
  // Validation
  if ([
    'quick_recap',
    'complete'
  ].includes(stepId)) {
    return 'validation';
  }
  
  // Default
  return 'introduction';
}

