/**
 * Hook for accessing the Voice Service singleton
 * Uses OpenAI WebRTC with fallback to Web Speech API
 */

import { useEffect, useRef } from 'react';
import { OpenAIWebRTCService } from '../services/openaiWebRTCService';
import { getWebSpeechService, WebSpeechService } from '../services/webSpeechService';
import { useVoiceStore } from '../stores/voiceStore';

type VoiceService = OpenAIWebRTCService | WebSpeechService;

export function useRealtimeService(): VoiceService {
  const serviceRef = useRef<VoiceService | null>(null);
  const { isVoiceEnabled } = useVoiceStore();
  
  useEffect(() => {
    if (isVoiceEnabled && !serviceRef.current) {
      try {
        // For Option A (Voice as UI layer): Use Web Speech API
        // This ensures:
        // - TTS just reads n8n questions (doesn't answer)
        // - STT just transcribes user input
        // - n8n controls the entire survey flow
        serviceRef.current = getWebSpeechService();
        console.log('✅ Using Web Speech API for Voice UI Layer');
        console.log('📋 Survey flow controlled by n8n, Voice is just input/output');
      } catch (error) {
        console.error('Failed to initialize voice service:', error);
        useVoiceStore.getState().setError((error as Error).message);
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (!isVoiceEnabled && serviceRef.current) {
        if ('disconnect' in serviceRef.current) {
          serviceRef.current.disconnect();
        } else if ('stop' in serviceRef.current) {
          serviceRef.current.stop();
          serviceRef.current.stopListening();
        }
      }
    };
  }, [isVoiceEnabled]);
  
  if (!serviceRef.current) {
    try {
      serviceRef.current = getWebSpeechService();
    } catch (error) {
      console.error('Error getting voice service:', error);
    }
  }
  
  return serviceRef.current!;
}

