import { create } from 'zustand';
import type { Message, InteractiveComponent, SurveyData, ConversationState } from '@/types';
import { 
  initializeManifestConversation,
  sendManifestMessage,
  getUserId,
  handleApiError 
} from '@/services/api';
import { calculateProgress } from '@/utils/progressCalculator';

interface ChatState {
  // State
  messages: Message[];
  currentComponent: InteractiveComponent | null;
  isLoading: boolean;
  error: string | null;
  surveyData: SurveyData;
  progress: number;
  currentStep: string;
  isInitialized: boolean;
  
  // Manifest-based state
  conversationState: ConversationState | null;
  userId: string;
  currentPhase?: string;
  isComplete: boolean;

  // Actions
  addMessage: (message: Message) => void;
  sendResponse: (value: any) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateSurveyData: (data: Partial<SurveyData>) => void;
  initializeChat: () => Promise<void>;
  resetChat: () => void;
  goBack: () => void;
  canGoBack: () => boolean;
  
  // Auto-save
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
}

const STORAGE_KEY = 'msq-survey-progress';
const STORAGE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial State
  messages: [],
  currentComponent: null,
  isLoading: false,
  error: null,
  surveyData: {},
  progress: 0,
  currentStep: 'start',
  isInitialized: false,
  conversationState: null,
  userId: getUserId(),
  isComplete: false,

  // Add message to chat
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
      currentComponent: message.component || (message.manifestComponent ? message.manifestComponent.componentConfig : null),
      // Update conversation state if message has it
      conversationState: message.conversationState || state.conversationState,
    }));
  },

  // Send user response to backend (Manifest-based)
  sendResponse: async (value) => {
    const state = get();
    const { userId, conversationState, addMessage, setLoading, setError } = state;

    console.log('📤 [MANIFEST] sendResponse called with:', { value, conversationState });

    // Clear current component while waiting for response
    set({ currentComponent: null });
    
    setLoading(true);
    setError(null);

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: typeof value === 'string' ? value : JSON.stringify(value),
      timestamp: Date.now(),
      isManifestBased: true,
    };
    addMessage(userMessage);

    try {
      // Call manifest n8n webhook
      const response = await sendManifestMessage(
        userId,
        typeof value === 'string' ? value : JSON.stringify(value),
        conversationState || {
          currentPhase: 'introduction',
          currentStep: 'greeting_agency',
          collectedData: {},
          validationHistory: [],
        },
        value
      );

      console.log('📥 [MANIFEST] Received from n8n:', response);

      // Check for validation errors
      if (response.validationError) {
        setError(response.validationError.message);
      }

      // Check if survey is complete
      if (response.isComplete) {
        // Handle survey completion
        console.log('✅ Survey completed!');
        set({ isComplete: true });
      }

      // Add AI response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.assistantMessage,
        timestamp: Date.now(),
        isManifestBased: true,
        manifestComponent: response.component ? {
          componentConfig: response.component,
          stepId: response.conversationState.currentStep,
          phaseId: response.conversationState.currentPhase,
        } : undefined,
        conversationState: response.conversationState,
      };
      addMessage(aiMessage);

      // Update conversation state and calculate progress based on phase AND step
      // If survey is complete, set progress to 100%
      const newProgress = response.isComplete || response.conversationState.currentStep === 'complete'
        ? 100
        : calculateProgress(
            response.conversationState.currentPhase,
            response.conversationState.currentStep,
            response.conversationState.iterationState
          );
      
      set({
        conversationState: response.conversationState,
        currentStep: response.conversationState.currentStep,
        currentPhase: response.conversationState.currentPhase,
        surveyData: response.conversationState.collectedData,
        progress: newProgress,
        isComplete: response.isComplete || false,
      });

      console.log(`📊 Progress updated: ${newProgress}% (Phase: ${response.conversationState.currentPhase}, Step: ${response.conversationState.currentStep})`);

      // Auto-save after successful response
      get().saveToLocalStorage();

    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      console.error('[MANIFEST] Error sending response:', error);
    } finally {
      setLoading(false);
    }
  },

  // Set loading state
  setLoading: (loading) => set({ isLoading: loading }),

  // Set error
  setError: (error) => set({ error }),

  // Update survey data
  updateSurveyData: (data) =>
    set((state) => ({
      surveyData: { ...state.surveyData, ...data },
    })),

  // Initialize chat with first message (Manifest-based)
  initializeChat: async () => {
    const { addMessage, setLoading, setError, isInitialized, isLoading } = get();

    // Prevent multiple simultaneous calls
    if (isInitialized || isLoading) {
      console.log('⚠️ [MANIFEST] initializeChat already running or completed');
      return;
    }

    // Try to load from localStorage first
    const loaded = get().loadFromLocalStorage();
    if (loaded) {
      set({ isInitialized: true });
      console.log('✅ [MANIFEST] Loaded from localStorage');
      return;
    }

    setLoading(true);
    try {
      const response = await initializeManifestConversation();

      console.log('📥 [MANIFEST] Init response:', response);

      const initialMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.assistantMessage,
        timestamp: Date.now(),
        isManifestBased: true,
        manifestComponent: response.component ? {
          componentConfig: response.component,
          stepId: response.conversationState.currentStep,
          phaseId: response.conversationState.currentPhase,
        } : undefined,
        conversationState: response.conversationState,
      };
      addMessage(initialMessage);

      // Calculate initial progress based on phase and step
      // If survey is complete, set progress to 100%
      const initialProgress = response.isComplete || response.conversationState.currentStep === 'complete'
        ? 100
        : calculateProgress(
            response.conversationState.currentPhase,
            response.conversationState.currentStep,
            response.conversationState.iterationState
          );
      
      set({
        progress: initialProgress,
        currentStep: response.conversationState.currentStep,
        currentPhase: response.conversationState.currentPhase,
        conversationState: response.conversationState,
        isInitialized: true,
        isComplete: response.isComplete || false,
      });
      
      console.log(`✅ [MANIFEST] Chat initialized - Phase: ${response.conversationState.currentPhase}, Step: ${response.conversationState.currentStep}, Progress: ${initialProgress}%`);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      console.error('[MANIFEST] Error initializing chat:', error);
    } finally {
      setLoading(false);
    }
  },

  // Reset chat
  resetChat: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({
      messages: [],
      currentComponent: null,
      isLoading: false,
      error: null,
      surveyData: {},
      progress: 0,
      currentStep: 'start',
      isInitialized: false,
      conversationState: null,
      userId: getUserId(),
      isComplete: false,
    });
  },

  // Go back to previous step
  goBack: () => {
    const { messages, conversationState } = get();
    
    // Can't go back if there are no messages or only 1 message (the initial greeting)
    if (messages.length <= 1) {
      console.log('⚠️ Cannot go back - no previous steps');
      return;
    }

    // Remove last 2 messages (last assistant message and last user message)
    const newMessages = messages.slice(0, -2);
    
    // Get the previous assistant message (which becomes the current one)
    const previousMessage = newMessages[newMessages.length - 1];
    
    if (!previousMessage || !previousMessage.conversationState) {
      console.log('⚠️ Cannot go back - no valid previous state');
      return;
    }

    // Restore state from previous message
    const previousProgress = calculateProgress(
      previousMessage.conversationState.currentPhase,
      previousMessage.conversationState.currentStep,
      previousMessage.conversationState.iterationState
    );

    set({
      messages: newMessages,
      conversationState: previousMessage.conversationState,
      currentStep: previousMessage.conversationState.currentStep,
      currentPhase: previousMessage.conversationState.currentPhase,
      surveyData: previousMessage.conversationState.collectedData,
      progress: previousProgress,
      currentComponent: previousMessage.manifestComponent?.componentConfig || null,
      error: null,
    });

    console.log(`⬅️ Went back to step: ${previousMessage.conversationState.currentStep}`);
    
    // Save to localStorage
    get().saveToLocalStorage();
  },

  // Check if we can go back
  canGoBack: () => {
    const { messages, isLoading, isComplete } = get();
    
    // Can't go back if loading, completed, or less than 2 messages
    // (initial greeting + at least one user response)
    return !isLoading && !isComplete && messages.length > 1;
  },

  // Save to localStorage
  saveToLocalStorage: () => {
    if (typeof window === 'undefined') return;
    
    const { messages, surveyData, progress, currentStep, conversationState, userId, isComplete } = get();
    const data = {
      messages,
      surveyData,
      progress,
      currentStep,
      conversationState,
      userId,
      isComplete,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // Load from localStorage
  loadFromLocalStorage: () => {
    if (typeof window === 'undefined') return false;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return false;

      const data = JSON.parse(saved);
      const now = Date.now();

      // Check if data is expired
      if (now - data.timestamp > STORAGE_EXPIRY) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
        }
        return false;
      }

      // Restore state
      const lastMessage = data.messages[data.messages.length - 1];
      
      // Recalculate progress from conversation state if available
      // If survey is complete, set progress to 100%
      const savedProgress = data.isComplete || data.currentStep === 'complete'
        ? 100
        : data.conversationState 
          ? calculateProgress(
              data.conversationState.currentPhase,
              data.conversationState.currentStep,
              data.conversationState.iterationState
            )
          : data.progress || 0;
      
      set({
        messages: data.messages || [],
        surveyData: data.surveyData || {},
        progress: savedProgress,
        currentStep: data.currentStep || 'start',
        currentPhase: data.conversationState?.currentPhase,
        conversationState: data.conversationState || null,
        userId: data.userId || getUserId(),
        currentComponent: lastMessage?.component || null,
        isComplete: data.isComplete || false,
      });
      
      console.log(`📂 Loaded from localStorage - Phase: ${data.conversationState?.currentPhase}, Step: ${data.conversationState?.currentStep}, Progress: ${savedProgress}%`);

      return true;
    } catch (error) {
      console.error('[MANIFEST] Error loading from localStorage:', error);
      return false;
    }
  },
}));

// Auto-save every 30 seconds
if (typeof window !== 'undefined') {
  setInterval(() => {
    const store = useChatStore.getState();
    if (store.messages.length > 0 && !store.isLoading) {
      store.saveToLocalStorage();
    }
  }, 30000);
}

