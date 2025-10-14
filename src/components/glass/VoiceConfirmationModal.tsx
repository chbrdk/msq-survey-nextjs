'use client';

/**
 * Voice Confirmation Modal
 * For confirming ambiguous or low-confidence voice inputs
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Keyboard } from 'lucide-react';

interface VoiceConfirmationModalProps {
  isOpen: boolean;
  transcript: string;
  parsedValue: string;
  confidence?: number;
  onConfirm: () => void;
  onRetry: () => void;
  onTypeInstead: () => void;
}

export function VoiceConfirmationModal({
  isOpen,
  transcript,
  parsedValue,
  confidence,
  onConfirm,
  onRetry,
  onTypeInstead
}: VoiceConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onRetry}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="glass-card glass-gradient-border p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title */}
              <h3 className="text-2xl font-light text-white mb-4">
                Confirm Your Answer
              </h3>
              
              {/* What was heard */}
              <div className="mb-6">
                <p className="font-semibold text-xs text-gray-300 uppercase tracking-wide mb-2">
                  You said:
                </p>
                <p className="font-light text-lg text-white bg-white/10 rounded-xl px-4 py-3">
                  "{transcript}"
                </p>
              </div>
              
              {/* Interpreted value */}
              <div className="mb-6">
                <p className="font-semibold text-xs text-gray-300 uppercase tracking-wide mb-2">
                  We understood:
                </p>
                <p className="font-light text-lg text-white bg-white/10 rounded-xl px-4 py-3">
                  {parsedValue}
                </p>
                
                {confidence !== undefined && (
                  <p className="font-light text-xs text-gray-400 mt-2">
                    Confidence: {Math.round(confidence * 100)}%
                  </p>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex flex-col gap-3">
                <motion.button
                  onClick={onConfirm}
                  className="glass-gradient-border-selected px-6 py-4 rounded-2xl font-light text-white flex items-center justify-center gap-2"
                  style={{
                    backgroundImage: 'linear-gradient(-225deg, #CBBACC 0%, #2580B3 100%)'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Check className="w-5 h-5" />
                  Yes, that's correct
                </motion.button>
                
                <motion.button
                  onClick={onRetry}
                  className="glass-gradient-border px-6 py-4 rounded-2xl font-light text-white bg-white/10 hover:bg-white/20 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <X className="w-5 h-5" />
                  No, try again
                </motion.button>
                
                <motion.button
                  onClick={onTypeInstead}
                  className="glass-gradient-border px-6 py-4 rounded-2xl font-light text-gray-300 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Keyboard className="w-5 h-5" />
                  Type instead
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

