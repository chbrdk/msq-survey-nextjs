/**
 * Hook for accessing the Voice Service singleton
 * Uses OpenAI Realtime API (WebRTC) with fallback to Web Speech API
 */

import { useEffect, useRef } from 'react';
import { getOpenAIWebRTCService, OpenAIWebRTCService } from '../services/openaiWebRTCService';
import { getWebSpeechService, WebSpeechService } from '../services/webSpeechService';

type VoiceService = OpenAIWebRTCService | WebSpeechService;

// Global singleton - shared across all components
let globalVoiceService: VoiceService | null = null;

function initializeVoiceService(): VoiceService | null {
  // Only initialize in browser, not during SSR
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!globalVoiceService) {
    try {
      // Use Web Speech API for survey flow
      // This gives us simple TTS/STT without GPT taking over the conversation
      globalVoiceService = getWebSpeechService();
      console.log('✅ Voice Service initialized: Web Speech API (Browser TTS/STT)');
      console.log('📋 Survey flow controlled by backend, Voice is UI layer only');
    } catch (error) {
      console.error('Failed to initialize Web Speech API:', error);
      throw error;
    }
  }
  return globalVoiceService;
}

export function useRealtimeService(): VoiceService | null {
  const serviceRef = useRef<VoiceService | null>(null);
  
  // Initialize service only once per component, and only in browser
  useEffect(() => {
    if (!serviceRef.current && typeof window !== 'undefined') {
      serviceRef.current = initializeVoiceService();
    }
  }, []);
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Don't disconnect the global service when individual components unmount
      // Service stays alive for the entire session
      if (serviceRef.current) {
        console.log('🔄 Component unmounted, but keeping voice service active');
      }
    };
  }, []);
  
  return serviceRef.current;
}


