import { ComponentConfig } from '../components/interactive/ComponentRenderer';

// Message Role
export type MessageRole = 'assistant' | 'user';

// Validation Rules
export interface ValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  sumTo?: number; // For percentage validation
}

// Component Data Types
export interface ButtonOption {
  id?: string;
  label: string;
  value?: string;
}

export interface ButtonComponentData {
  question?: string;
  options: (ButtonOption | string)[];  // Allow both object and string format
  allowMultiple?: boolean;
}

export interface InputComponentData {
  question: string;
  inputType: 'text' | 'number' | 'percentage';
  placeholder?: string;
  suffix?: string;
}

export interface TableRow {
  id: string;
  activity?: string;
  phase?: string;
  description?: string;
  percentage?: number;
  isCustom?: boolean;
  [key: string]: any;
}

export interface TableComponentData {
  question?: string;
  title?: string;
  columns?: Array<{
    key: string;
    label: string;
    type: 'text' | 'number';
    min?: number;
    max?: number;
  }>;
  rows: TableRow[];
  allowAddRow?: boolean;
  allowCustomEntries?: boolean;
  additionalOptions?: {
    type: 'dropdown';
    label: string;
    options: string[];
  };
}

export interface MultiSelectOption {
  id: string;
  label: string;
  description?: string;
}

export interface MultiSelectComponentData {
  question: string;
  options: MultiSelectOption[];
  min?: number;
  max?: number;
}

export interface DocumentComponentData {
  title: string;
  sections: Array<{
    title: string;
    content: string | Record<string, any>;
    type?: 'text' | 'table' | 'list';
  }>;
}

export interface InfoMessageComponentData {
  message: string;
  requiresAcknowledgement?: boolean;
}

export interface SmartMultiSelectComponentData {
  question: string;
  smartSuggestions?: boolean;
  suggestionsSource?: string;
  allowCustomInput?: boolean;
  addYourOwnButton?: boolean;
  suggestions?: string[];
}

export interface GuidedInputComponentData {
  guidedQuestions: string[];
  multiline?: boolean;
}

// Interactive Component Types
export type ComponentType = 'buttons' | 'input' | 'table' | 'multi-select' | 'slider' | 'document' | 'info-message' | 'smart-multi-select' | 'guided-input';

export type ComponentData =
  | ButtonComponentData
  | InputComponentData
  | TableComponentData
  | MultiSelectComponentData
  | DocumentComponentData
  | InfoMessageComponentData
  | SmartMultiSelectComponentData
  | GuidedInputComponentData;

export interface InteractiveComponent {
  type: ComponentType;
  data: ComponentData;
  validation?: ValidationRules;
}

// Manifest-based Component (new system)
export interface ManifestComponent {
  componentConfig: ComponentConfig;
  stepId?: string;
  phaseId?: string;
}

// Conversation State for manifest-based flow
export interface ConversationState {
  currentPhase: string;
  currentStep: string;
  collectedData: Record<string, any>;
  selectedPhases?: string[];
  phaseTimeAllocation?: Record<string, number>;
  validationHistory: Array<{
    stepId: string;
    validated: boolean;
    timestamp: number;
  }>;
  iterationState?: {
    currentIndex: number;
    totalPhases: number;
    iterationType?: 'deep_dive' | 'map_tools';
  };
}

// Message Structure
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  component?: InteractiveComponent;
  // New manifest-based fields
  manifestComponent?: ManifestComponent;
  conversationState?: ConversationState;
  isManifestBased?: boolean;
}

// API Response from n8n (legacy system)
export interface ApiResponse {
  message: string;
  component?: InteractiveComponent;
  nextStep?: string;
  progress?: number;
}

// API Response from n8n (manifest-based system)
export interface ManifestApiResponse {
  assistantMessage: string;
  component?: ComponentConfig;
  conversationState: ConversationState;
  validationError?: {
    message: string;
    field?: string;
  };
  isComplete?: boolean;
  finalDocument?: string;
}


