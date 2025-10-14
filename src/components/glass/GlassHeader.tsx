'use client';

import { RotateCcw, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { useChatStore } from '@/stores/chatStore';
import { useVoiceStore } from '@/stores/voiceStore';
import { VoiceToggle } from './VoiceToggle';
import { useState, useEffect } from 'react';

interface GlassHeaderProps {
  onHistoryToggle: () => void;
  isHistoryOpen: boolean;
}

export const GlassHeader = ({ onHistoryToggle, isHistoryOpen }: GlassHeaderProps) => {
  const { progress, resetChat, isInitialized } = useChatStore();
  const { isSpeaking } = useVoiceStore();
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isVoiceDebugMode, setIsVoiceDebugMode] = useState(false);

  // Check for debug mode - nur im Browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const debug = urlParams.get('debug') === 'true';
      setIsDebugMode(debug);
      setIsVoiceDebugMode(debug);
    }
  }, []);

  const handleReset = () => {
    if (
      confirm(
        'Do you really want to restart the survey? All previous answers will be lost.'
      )
    ) {
      resetChat();
      window.location.reload();
    }
  };

  return (
    <>
      {/* Sticky Logo - Links */}
      <div className="fixed top-6 left-6 z-50">
        <img
          src="/MSQ_WhiteLogo_RGB_360px.svg"
          alt="MSQ"
          className="h-12 w-auto"
        />
      </div>

      {/* Sticky Progress Indicator - Rechts */}
      <div className="fixed top-6 right-6 z-50 flex flex-col items-center">
        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-4">
          {/* Voice Toggle - Nur im Debug-Modus */}
          {isVoiceDebugMode && <VoiceToggle />}
          
          {/* Speaking Indicator */}
          {isSpeaking && (
            <div className="glass-button w-14 h-14 flex items-center justify-center">
              <div className="flex gap-1">
                <div className="w-1 h-6 bg-blue-500 rounded-full animate-pulse" />
                <div className="w-1 h-6 bg-blue-500 rounded-full animate-pulse delay-100" />
                <div className="w-1 h-6 bg-blue-500 rounded-full animate-pulse delay-200" />
              </div>
            </div>
          )}
          
          {/* History Toggle - Nur Icon */}
          <button
            onClick={onHistoryToggle}
            className={`glass-button w-14 h-14 flex items-center justify-center ${
              isHistoryOpen ? 'bg-white/70' : ''
            }`}
            title="Show history"
          >
            <History className="w-8 h-8 text-gray-700" strokeWidth={2} />
          </button>

          {/* Reset Button - Nur im Debug-Modus */}
          {isInitialized && isDebugMode && (
            <button
              onClick={handleReset}
              className="glass-button w-14 h-14 flex items-center justify-center"
              title="Restart survey (Debug mode)"
            >
              <RotateCcw className="w-8 h-8 text-gray-700" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Progress Number */}
        <div className="text-4xl font-thin text-gray-700 mb-3">
          {Math.round(progress)}%
        </div>
        
        {/* Vertical Line mit Progress Dot - startet unter der Number */}
        <div className="relative w-0.5 h-screen bg-gradient-to-b from-white/60 via-white/40 to-transparent">
          {/* Progress Dot */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full shadow-lg"
            style={{
              background: '#60a5fa'
            }}
            initial={{ top: 0 }}
            animate={{ top: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-full blur-sm animate-pulse" style={{
              background: 'rgba(96, 165, 250, 0.6)'
            }} />
          </motion.div>
        </div>
      </div>
    </>
  );
};

