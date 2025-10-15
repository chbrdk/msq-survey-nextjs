/**
 * Voice Flow Hook
 * Handles the complete voice-driven survey flow:
 * - Listens for voice input
 * - Parses responses
 * - Shows confirmation if needed
 * - Auto-submits valid responses
 */

import { useState, useCallback } from 'react';
import { useVoice } from './useVoice';
import { useChatStore } from '@/stores/chatStore';
import { parseVoiceResponse, type ParsedVoiceResponse } from '@/utils/voiceParser';

export interface VoiceFlowState {
  isListening: boolean;
  parsedResponse: ParsedVoiceResponse | null;
  showConfirmation: boolean;
  isProcessing: boolean;
}

export function useVoiceFlow() {
  const [state, setState] = useState<VoiceFlowState>({
    isListening: false,
    parsedResponse: null,
    showConfirmation: false,
    isProcessing: false
  });

  const { isActive: isVoiceActive, listen, speak } = useVoice();
  const { sendResponse, messages } = useChatStore();

  // Get current component config
  const currentMessage = messages
    .filter((m) => m.role === 'assistant' && m.manifestComponent)
    .pop();

  const componentType = currentMessage?.manifestComponent?.componentConfig?.type;
  const componentProps = currentMessage?.manifestComponent?.componentConfig?.props;

  /**
   * Start listening for voice input
   */
  const startListening = useCallback(async () => {
    if (!isVoiceActive) {
      console.warn('Voice not active');
      return;
    }

    setState(prev => ({ ...prev, isListening: true }));

    try {
      console.log('🎤 Listening for voice input...');
      const transcript = await listen(30000); // 30 second timeout
      
      console.log('📝 Received transcript:', transcript);

      if (!transcript || !transcript.trim()) {
        console.warn('Empty transcript received');
        setState(prev => ({ ...prev, isListening: false }));
        return;
      }

      // Parse the response based on component type
      if (!componentType || !componentProps) {
        console.warn('No component config available');
        setState(prev => ({ ...prev, isListening: false }));
        return;
      }

      const parsed = parseVoiceResponse(transcript, componentType, componentProps);

      if (!parsed) {
        console.warn('Failed to parse transcript');
        await speak("I didn't understand that. Could you please try again?");
        setState(prev => ({ ...prev, isListening: false }));
        return;
      }

      console.log('✅ Parsed response:', parsed);

      // If high confidence and no confirmation needed, auto-submit
      if (!parsed.requiresConfirmation && parsed.confidence > 0.8) {
        console.log('🚀 Auto-submitting high-confidence response');
        setState(prev => ({ ...prev, isListening: false, isProcessing: true }));
        
        await sendResponse(parsed.data);
        
        setState(prev => ({ ...prev, isProcessing: false }));
      } else {
        // Show confirmation modal
        console.log('❓ Showing confirmation modal');
        setState(prev => ({
          ...prev,
          isListening: false,
          parsedResponse: parsed,
          showConfirmation: true
        }));
      }

    } catch (error) {
      console.error('Voice listening error:', error);
      setState(prev => ({ ...prev, isListening: false }));
    }
  }, [isVoiceActive, listen, speak, sendResponse, componentType, componentProps]);

  /**
   * Confirm and submit the parsed response
   */
  const confirmResponse = useCallback(async () => {
    if (!state.parsedResponse) return;

    setState(prev => ({ ...prev, showConfirmation: false, isProcessing: true }));

    try {
      await sendResponse(state.parsedResponse.data);
    } catch (error) {
      console.error('Failed to send response:', error);
    }

    setState(prev => ({ ...prev, parsedResponse: null, isProcessing: false }));
  }, [state.parsedResponse, sendResponse]);

  /**
   * Retry voice input
   */
  const retryVoiceInput = useCallback(() => {
    setState(prev => ({ ...prev, showConfirmation: false, parsedResponse: null }));
    // Auto-restart listening
    setTimeout(() => startListening(), 500);
  }, [startListening]);

  /**
   * Cancel voice input and allow typing instead
   */
  const cancelVoiceInput = useCallback(() => {
    setState(prev => ({ ...prev, showConfirmation: false, parsedResponse: null }));
  }, []);

  return {
    ...state,
    startListening,
    confirmResponse,
    retryVoiceInput,
    cancelVoiceInput,
    isVoiceActive
  };
}

