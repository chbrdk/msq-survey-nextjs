'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, AlertCircle } from 'lucide-react';
import type { Message } from '@/types';
import { TypewriterText } from './TypewriterText';
import { GlassComponentRenderer } from './GlassComponentRenderer';
import { CompletionScreen } from './CompletionScreen';
import { QuickRecapSummary } from './QuickRecapSummary';
import { VoiceConfirmationModal } from './VoiceConfirmationModal';
import { useChatStore } from '@/stores/chatStore';
import { useVoice } from '@/hooks/useVoice';
import { useVoiceFlow } from '@/hooks/useVoiceFlow';

interface GlassCenteredViewProps {
  message?: Message;
  isLoading: boolean;
  error: string | null;
}

export const GlassCenteredView = ({
  message,
  isLoading,
  error,
}: GlassCenteredViewProps) => {
  const [isTextComplete, setIsTextComplete] = useState(false);
  const { isComplete } = useChatStore();
  const { isActive: isVoiceActive, speak, isSpeaking } = useVoice();
  const {
    parsedResponse,
    showConfirmation,
    startListening,
    confirmResponse,
    retryVoiceInput,
    cancelVoiceInput
  } = useVoiceFlow();
  const lastSpokenMessageId = useRef<string | null>(null);
  const hasStartedListeningRef = useRef<boolean>(false);
  
  // Check if message is a "Quick Recap"
  const isQuickRecap = message?.content.toLowerCase().includes('quick recap') || 
                       message?.content.toLowerCase().includes('zusammenfassung');
  
  // Auto-speak new questions when voice is active
  useEffect(() => {
    const shouldSpeak = 
      isVoiceActive && 
      isTextComplete && 
      message?.id && 
      message.id !== lastSpokenMessageId.current &&
      !isSpeaking &&
      !isLoading &&
      !isComplete &&
      message.role === 'assistant';
    
    if (shouldSpeak) {
      lastSpokenMessageId.current = message.id;
      hasStartedListeningRef.current = false; // Reset listening flag
      console.log('🎤 Auto-speaking question:', message.content);
      
      speak(message.content).catch(error => {
        console.error('Failed to auto-speak:', error);
      });
    }
  }, [isVoiceActive, isTextComplete, message?.id, message?.content, message?.role, isSpeaking, isLoading, isComplete, speak]);
  
  // Auto-listen after speaking completes (for voice mode)
  useEffect(() => {
    const shouldListen = 
      isVoiceActive &&
      isTextComplete &&
      !isSpeaking &&
      !isLoading &&
      !isComplete &&
      message?.manifestComponent &&
      message.id === lastSpokenMessageId.current &&
      !hasStartedListeningRef.current &&
      !isQuickRecap; // Don't auto-listen for recap
    
    if (shouldListen) {
      hasStartedListeningRef.current = true;
      console.log('👂 Auto-listening for response...');
      
      // Small delay after speaking finishes
      setTimeout(() => {
        startListening();
      }, 1000);
    }
  }, [isVoiceActive, isTextComplete, isSpeaking, isLoading, isComplete, message?.manifestComponent, message?.id, isQuickRecap, startListening]);
  
  return (
    <div className="fixed inset-0 flex items-start justify-center px-6 pt-32 pb-20 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-3xl py-12">
      <AnimatePresence mode="wait">
        {/* Completion Screen */}
        {isComplete && !error && (
          <CompletionScreen />
        )}

        {error && !isComplete && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full"
          >
            <div className="relative">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-xl font-light text-red-800">Error</p>
                  <p className="text-lg text-red-700 mt-2">{error}</p>
                </div>
              </div>
              {/* Glow Effect für Error */}
              <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 rounded-3xl blur-2xl -z-10 animate-pulse" />
            </div>
          </motion.div>
        )}

        {/* Zentrale Loading Animation während API-Call */}
        {!error && isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="w-full flex flex-col items-center justify-center min-h-[400px] space-y-6"
          >
            <div className="relative flex items-center justify-center">
              {/* Ball Loader */}
              <div className="ball-loader" />
            </div>
            
            {/* Loading Text */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="text-lg text-gray-600 font-light text-center"
            >
              Just loading, thank you for being patient!
            </motion.p>
          </motion.div>
        )}

        {!error && !isLoading && !isComplete && message && (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1],
            }}
            onAnimationStart={() => setIsTextComplete(false)}
            className="w-full space-y-6"
          >
            {/* Bot Message Headline mit Glow Effect */}
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="glass-avatar">
                  <Bot className="w-7 h-7 text-gray-700" />
                </div>
                <div className="flex-1">
                  <TypewriterText 
                    text={message.content} 
                    speed={30}
                    onComplete={() => setIsTextComplete(true)}
                  />
                </div>
              </div>
              
              {/* Glow Effect hinter Bot Message */}
              <div 
                className="absolute -inset-4 rounded-3xl blur-2xl -z-10 animate-pulse" 
                style={{
                  background: 'linear-gradient(135deg, rgba(186, 230, 253, 0.5) 0%, rgba(254, 243, 242, 0.5) 50%, rgba(219, 234, 254, 0.5) 100%)'
                }}
              />
            </div>

            {/* Quick Recap Summary - Nach Bot Message */}
            {isQuickRecap && isTextComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <QuickRecapSummary />
              </motion.div>
            )}

            {/* Interactive Component - Only after Typewriter completion (not for Quick Recap) */}
            {message.manifestComponent && isTextComplete && !isQuickRecap && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                <GlassComponentRenderer
                  config={message.manifestComponent.componentConfig}
                />
              </motion.div>
            )}
          </motion.div>
        )}

        {!error && !isLoading && !isComplete && !message && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full text-center"
          >
            <div className="relative">
              <Bot className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <p className="text-2xl text-gray-600 font-light">Initialisierung...</p>
              {/* Glow Effect für Empty State */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 via-gray-400/10 to-gray-500/10 rounded-3xl blur-2xl -z-10 animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
      
      {/* Voice Confirmation Modal */}
      <VoiceConfirmationModal
        isOpen={showConfirmation}
        transcript={parsedResponse?.transcript || ''}
        parsedValue={JSON.stringify(parsedResponse?.data, null, 2)}
        confidence={parsedResponse?.confidence}
        onConfirm={confirmResponse}
        onRetry={retryVoiceInput}
        onTypeInstead={cancelVoiceInput}
      />
    </div>
  );
};

