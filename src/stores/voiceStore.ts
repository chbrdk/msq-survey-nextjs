import { create } from 'zustand';

export interface VoiceState {
  isVoiceEnabled: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  currentTranscript: string;
  isPushToTalkActive: boolean;
  voiceMode: 'push-to-talk' | 'auto';
  currentAudioUrl: string | null;
  error: string | null;
  
  // Actions
  enableVoice: () => void;
  disableVoice: () => void;
  toggleVoice: () => void;
  setSpeaking: (speaking: boolean) => void;
  setListening: (listening: boolean) => void;
  setTranscript: (transcript: string) => void;
  setError: (error: string | null) => void;
  togglePushToTalk: () => void;
  setVoiceMode: (mode: 'push-to-talk' | 'auto') => void;
  resetTranscript: () => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  isVoiceEnabled: false,
  isSpeaking: false,
  isListening: false,
  currentTranscript: '',
  isPushToTalkActive: false,
  voiceMode: 'auto',
  currentAudioUrl: null,
  error: null,
  
  enableVoice: () => set({ isVoiceEnabled: true, error: null }),
  disableVoice: () => set({ isVoiceEnabled: false, isSpeaking: false, isListening: false }),
  toggleVoice: () => set((state) => ({ 
    isVoiceEnabled: !state.isVoiceEnabled,
    isSpeaking: false,
    isListening: false,
    error: null
  })),
  setSpeaking: (speaking) => set({ isSpeaking: speaking }),
  setListening: (listening) => set({ isListening: listening }),
  setTranscript: (transcript) => set({ currentTranscript: transcript }),
  setError: (error) => set({ error }),
  togglePushToTalk: () => set((state) => ({ isPushToTalkActive: !state.isPushToTalkActive })),
  setVoiceMode: (mode) => set({ voiceMode: mode }),
  resetTranscript: () => set({ currentTranscript: '' }),
}));

