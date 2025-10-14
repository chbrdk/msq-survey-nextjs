// Backend Survey Types
export interface ConversationState {
  currentPhase: string;
  currentStep: string;
  collectedData: Record<string, any>;
  validationHistory: any[];
  iterationState?: {
    currentIndex: number;
    totalPhases: number;
    iterationType?: 'deep_dive' | 'map_tools';
  };
}

export interface StepResponse {
  assistantMessage: string;
  component?: any;
  nextStep: string;
  conversationState: ConversationState;
  skipGPT?: boolean;
  isComplete?: boolean;
}

export interface GPTResponse {
  assistantMessage: string;
  component: any;
  nextStep: string;
}

