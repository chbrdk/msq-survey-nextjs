// Survey Steps Enum
export enum SurveyStep {
  START = 'start',
  AGENCY = 'agency',
  DEPARTMENT = 'department',
  ROLE = 'role',
  JOB_LEVEL = 'job_level',
  PHASE_OVERVIEW = 'phase_overview',
  PHASE_ALLOCATION = 'phase_allocation',
  ACTIVITY_DEEP_DIVE = 'activity_deep_dive',
  TOOLS_LIST = 'tools_list',
  TOOLS_MAPPING = 'tools_mapping',
  PAIN_POINTS = 'pain_points',
  AUTOMATION = 'automation',
  COMPLETE = 'complete',
}

// Approved Agencies
export const APPROVED_AGENCIES = [
  'MSQ',
  'UDG',
  'MMT',
  '26DX',
  'SPACESHP',
  'THE GATE',
] as const;

export type Agency = typeof APPROVED_AGENCIES[number];

// Survey Data Structure
export interface SurveyData {
  agency?: Agency;
  department?: string;
  role?: string;
  jobLevel?: string;
  selectedPhases?: string[];
  phaseAllocation?: Record<string, number>;
  activityBreakdown?: Record<string, Record<string, number>>;
  tools?: string[];
  toolsMapping?: Record<string, string[]>;
  painPoints?: string[];
  automationOpportunities?: string[];
}


