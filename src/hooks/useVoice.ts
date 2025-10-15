/**
 * Main hook for voice functionality
 * Provides a simple interface for components to use voice features
 */

import { useEffect } from 'react';
import { useVoiceStore } from '../stores/voiceStore';
import { useRealtimeService } from './useRealtimeService';

export interface VoiceHook {
  // State
  isActive: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  status: 'idle' | 'speaking' | 'listening';
  transcript: string;
  error: string | null;
  
  // Actions
  speak: (text: string) => Promise<void>;
  listen: (timeout?: number) => Promise<string>;
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  clearError: () => void;
}

export function useVoice(): VoiceHook {
  const {
    isVoiceEnabled,
    isSpeaking,
    isListening,
    currentTranscript,
    error,
    enableVoice,
    disableVoice,
    toggleVoice,
    setError
  } = useVoiceStore();
  
  const realtimeService = useRealtimeService();
  
  // Auto-connect when voice is enabled
  useEffect(() => {
    if (isVoiceEnabled && realtimeService && 'connect' in realtimeService) {
      // Only connect for OpenAI WebRTC service
      (async () => {
        try {
          await realtimeService.connect();
          console.log('🎤 Voice connection established and ready!');
        } catch (error) {
          console.error('Failed to connect voice service:', error);
          setError((error as Error).message);
        }
      })();
    }
  }, [isVoiceEnabled, realtimeService, setError]);
  
  const speak = async (text: string): Promise<void> => {
    if (!isVoiceEnabled) {
      throw new Error('Voice is not enabled');
    }
    
    if (!realtimeService) {
      throw new Error('Voice service not available (SSR or initialization failed)');
    }
    
    try {
      await realtimeService.speak(text);
    } catch (error) {
      console.error('Error speaking:', error);
      setError((error as Error).message);
      throw error;
    }
  };
  
  const listen = async (timeout?: number): Promise<string> => {
    if (!isVoiceEnabled) {
      throw new Error('Voice is not enabled');
    }
    
    if (!realtimeService) {
      throw new Error('Voice service not available (SSR or initialization failed)');
    }
    
    try {
      return await realtimeService.listen(timeout);
    } catch (error) {
      console.error('Error listening:', error);
      setError((error as Error).message);
      throw error;
    }
  };
  
  const status: 'idle' | 'speaking' | 'listening' = 
    isSpeaking ? 'speaking' : 
    isListening ? 'listening' : 
    'idle';
  
  return {
    isActive: isVoiceEnabled,
    isSpeaking,
    isListening,
    status,
    transcript: currentTranscript,
    error,
    speak,
    listen,
    enable: enableVoice,
    disable: disableVoice,
    toggle: toggleVoice,
    clearError: () => setError(null)
  };
}

