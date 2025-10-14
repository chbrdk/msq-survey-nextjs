/**
 * Web Speech API Service (Browser-native)
 * Fallback for TTS when OpenAI Realtime API is not available
 */

import { useVoiceStore } from '../stores/voiceStore';

export class WebSpeechService {
  private synthesis: SpeechSynthesis;
  private recognition: any | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  
  constructor() {
    this.synthesis = window.speechSynthesis;
    
    // Initialize Speech Recognition if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      if (this.recognition) {
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
    }
    
    // Load voices
    this.loadVoices();
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => this.loadVoices();
    }
  }
  
  private loadVoices(): void {
    this.voices = this.synthesis.getVoices();
  }
  
  /**
   * Text-to-Speech using Web Speech API
   */
  async speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Cancel any ongoing speech
        this.synthesis.cancel();
        
        useVoiceStore.getState().setSpeaking(true);
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Select a good English voice
        const englishVoice = this.voices.find(voice => 
          voice.lang.startsWith('en') && voice.name.includes('Google')
        ) || this.voices.find(voice => voice.lang.startsWith('en'));
        
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
        
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onend = () => {
          useVoiceStore.getState().setSpeaking(false);
          resolve();
        };
        
        utterance.onerror = (event) => {
          useVoiceStore.getState().setSpeaking(false);
          console.error('Speech synthesis error:', event);
          reject(new Error(event.error));
        };
        
        this.synthesis.speak(utterance);
        
      } catch (error) {
        useVoiceStore.getState().setSpeaking(false);
        reject(error);
      }
    });
  }
  
  /**
   * Speech-to-Text using Web Speech API
   */
  async listen(timeout: number = 30000): Promise<string> {
    if (!this.recognition) {
      throw new Error('Speech Recognition is not supported in this browser');
    }
    
    return new Promise((resolve, reject) => {
      try {
        useVoiceStore.getState().setListening(true);
        useVoiceStore.getState().resetTranscript();
        
        let finalTranscript = '';
        let timeoutId: ReturnType<typeof setTimeout>;
        
        this.recognition!.onresult = (event: any) => {
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Update store with interim results
          const currentTranscript = finalTranscript + interimTranscript;
          useVoiceStore.getState().setTranscript(currentTranscript);
        };
        
        this.recognition!.onend = () => {
          clearTimeout(timeoutId);
          useVoiceStore.getState().setListening(false);
          
          if (finalTranscript) {
            resolve(finalTranscript.trim());
          } else {
            reject(new Error('No speech detected'));
          }
        };
        
        this.recognition!.onerror = (event: any) => {
          clearTimeout(timeoutId);
          useVoiceStore.getState().setListening(false);
          
          if (event.error === 'no-speech') {
            reject(new Error('No speech detected'));
          } else if (event.error === 'not-allowed') {
            reject(new Error('Microphone access denied'));
          } else {
            reject(new Error(`Speech recognition error: ${event.error}`));
          }
        };
        
        // Set timeout
        timeoutId = setTimeout(() => {
          this.recognition!.stop();
        }, timeout);
        
        // Start recognition
        this.recognition!.start();
        
      } catch (error) {
        useVoiceStore.getState().setListening(false);
        reject(error);
      }
    });
  }
  
  /**
   * Stop speaking
   */
  stop(): void {
    this.synthesis.cancel();
    useVoiceStore.getState().setSpeaking(false);
  }
  
  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
    useVoiceStore.getState().setListening(false);
  }
}

// Singleton instance
let webSpeechInstance: WebSpeechService | null = null;

export function getWebSpeechService(): WebSpeechService {
  if (!webSpeechInstance) {
    webSpeechInstance = new WebSpeechService();
  }
  return webSpeechInstance;
}

