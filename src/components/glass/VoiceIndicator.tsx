'use client';

/**
 * Voice Indicator
 * Shows current voice status with animations
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Mic } from 'lucide-react';
import { useVoice } from '../../hooks/useVoice';
import { VoiceWaveform } from './VoiceWaveform';

export function VoiceIndicator() {
  const { isSpeaking, isListening, transcript } = useVoice();
  
  const shouldShow = isSpeaking || isListening;
  
  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="glass-card glass-gradient-border px-6 py-4 min-w-[280px] max-w-md">
            {/* Status Header */}
            <div className="flex items-center gap-3 mb-3">
              {isSpeaking ? (
                <>
                  <VoiceWaveform isActive={true} barCount={5} />
                  <span className="font-light text-sm text-white">
                    Speaking...
                  </span>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    <Mic className="w-5 h-5 text-green-400" strokeWidth={2} />
                  </motion.div>
                  <span className="font-light text-sm text-white">
                    Listening...
                  </span>
                </>
              )}
            </div>
            
            {/* Live Transcript */}
            {isListening && transcript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 pt-2 border-t border-white/20"
              >
                <p className="font-light text-xs text-gray-300 mb-1">
                  Transcript:
                </p>
                <motion.p
                  className="font-light text-sm text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {transcript}
                </motion.p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

