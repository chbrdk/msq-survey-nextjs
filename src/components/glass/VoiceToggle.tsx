'use client';

/**
 * Voice Toggle Button
 * Allows users to enable/disable voice features
 */

import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoice } from '../../hooks/useVoice';

export function VoiceToggle() {
  const { isActive, isListening, isSpeaking, toggle, error } = useVoice();
  
  const getButtonState = () => {
    if (error) return 'error';
    if (isListening) return 'listening';
    if (isSpeaking) return 'speaking';
    if (isActive) return 'active';
    return 'inactive';
  };
  
  const state = getButtonState();
  
  const stateColors = {
    inactive: 'bg-white/40 hover:bg-white/60',
    active: 'bg-gradient-to-br from-sky-400/40 to-blue-500/40 hover:from-sky-400/60 hover:to-blue-500/60',
    listening: 'bg-gradient-to-br from-green-400/40 to-emerald-500/40',
    speaking: 'bg-gradient-to-br from-purple-400/40 to-indigo-500/40',
    error: 'bg-gradient-to-br from-red-400/40 to-rose-500/40'
  };
  
  return (
    <motion.button
      onClick={toggle}
      className={`
        relative w-14 h-14 rounded-2xl glass-gradient-border
        flex items-center justify-center
        transition-all duration-300
        ${stateColors[state]}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isActive ? 'Disable Voice' : 'Enable Voice'}
    >
      <AnimatePresence mode="wait">
        {isActive ? (
          <motion.div
            key="mic-on"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Mic className="w-6 h-6 text-white" strokeWidth={2} />
          </motion.div>
        ) : (
          <motion.div
            key="mic-off"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <MicOff className="w-6 h-6 text-gray-600" strokeWidth={2} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Pulsing animation when listening */}
      {isListening && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-green-400/30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
      
      {/* Error indicator */}
      {error && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}

