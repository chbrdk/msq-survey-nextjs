'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Mic, ChevronRight } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { cn } from '@/lib/utils';
import type { ButtonComponentData } from '@/types';
import { useVoice } from '../../hooks/useVoice';
import { parseButtonChoice } from '../../utils/voiceParser';
import { VoiceConfirmationModal } from '../glass/VoiceConfirmationModal';

interface UdgGlassButtonGroupProps {
  data: ButtonComponentData;
}

export const UdgGlassButtonGroup = ({ data }: UdgGlassButtonGroupProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherValue, setOtherValue] = useState('');
  const [voiceMatched, setVoiceMatched] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceConfidence, setVoiceConfidence] = useState(0);
  const [isListeningLocal, setIsListeningLocal] = useState(false);
  const { sendResponse, isLoading } = useChatStore();
  const { isActive: isVoiceEnabled, listen } = useVoice();
  
  // Check for debug mode (voice features)
  const urlParams = new URLSearchParams(window.location.search);
  const isVoiceDebugMode = urlParams.get('debug') === 'true';
  const showVoiceFeatures = isVoiceEnabled && isVoiceDebugMode;

  // Safety check: ensure options exist
  if (!data || !data.options || !Array.isArray(data.options)) {
    console.error('Invalid button data:', data);
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        Error: No options available
      </div>
    );
  }

  // Normalize options to always be objects with value and label
  const normalizedOptions = data.options.map((option, index) => {
    if (typeof option === 'string') {
      return { id: option, value: option, label: option };
    }
    return {
      id: option.id || option.value || `option-${index}`,
      value: option.value || option.label,
      label: option.label
    };
  });

  const handleClick = (value: string) => {
    if (isLoading) return;

    // Check if "Other" option was clicked
    if (value === '_other_' || value.toLowerCase() === 'other') {
      setShowOtherInput(true);
      return;
    }

    if (data.allowMultiple) {
      const newSelected = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      setSelected(newSelected);
    } else {
      // Single select - immediately submit
      sendResponse(value);
    }
  };

  const handleOtherSubmit = () => {
    if (otherValue.trim()) {
      sendResponse(otherValue.trim());
    }
  };

  const handleSubmit = () => {
    if (selected.length > 0) {
      sendResponse(selected);
    }
  };

  const handleVoiceInput = async () => {
    if (!isVoiceEnabled || isListeningLocal) return;
    
    setIsListeningLocal(true);
    setVoiceMatched(null);
    
    try {
      const transcript = await listen();
      setVoiceTranscript(transcript);
      
      // Try to match the spoken input to an option
      const match = parseButtonChoice(
        transcript, 
        normalizedOptions.map(o => ({ label: o.label, value: o.value }))
      );
      
      if (match && match.confidence > 0.7) {
        // High confidence - auto-select with animation
        setVoiceMatched(match.value);
        
        if (data.allowMultiple) {
          setSelected([...selected, match.value]);
        } else {
          setSelected([match.value]);
          
          // Auto-submit after a brief animation delay
          setTimeout(() => {
            sendResponse(match.value);
          }, 800);
        }
      } else if (match) {
        // Low confidence - show confirmation
        setVoiceMatched(match.value);
        setVoiceConfidence(match.confidence);
        setShowConfirmation(true);
      } else {
        // No match found
        alert('Could not understand. Please try again or click an option.');
      }
    } catch (error) {
      console.error('Voice input error:', error);
    } finally {
      setIsListeningLocal(false);
    }
  };

  const handleVoiceConfirm = () => {
    if (voiceMatched) {
      if (data.allowMultiple) {
        setSelected([...selected, voiceMatched]);
      } else {
        sendResponse(voiceMatched);
      }
    }
    setShowConfirmation(false);
    setVoiceMatched(null);
  };

  const handleVoiceRetry = () => {
    setShowConfirmation(false);
    setVoiceMatched(null);
    handleVoiceInput();
  };

  const handleVoiceTypeInstead = () => {
    setShowConfirmation(false);
    setVoiceMatched(null);
  };

  return (
    <>
      {/* Voice Confirmation Modal */}
      <VoiceConfirmationModal
        isOpen={showConfirmation}
        transcript={voiceTranscript}
        parsedValue={normalizedOptions.find(o => o.value === voiceMatched)?.label || ''}
        confidence={voiceConfidence}
        onConfirm={handleVoiceConfirm}
        onRetry={handleVoiceRetry}
        onTypeInstead={handleVoiceTypeInstead}
      />
      
      <div className="space-y-4">
        {data.question && (
          <p className="text-gray-700 font-light">{data.question}</p>
        )}
        
        {/* Voice Button - Zentriert, prominent - Nur im Debug-Modus */}
        {showVoiceFeatures && !showOtherInput && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleVoiceInput}
            disabled={isLoading || isListeningLocal}
            className={cn(
              'w-full py-6 px-6 rounded-2xl font-light text-base',
              'flex items-center justify-center gap-3',
              'transition-all duration-300',
              isListeningLocal
                ? 'bg-green-400/40 text-white voice-listening'
                : 'bg-gradient-to-r from-blue-400/30 to-cyan-400/30 hover:from-blue-400/40 hover:to-cyan-400/40 text-gray-800',
              'glass-gradient-border-selected shadow-lg',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            whileHover={!isLoading && !isListeningLocal ? { scale: 1.02 } : {}}
            whileTap={!isLoading && !isListeningLocal ? { scale: 0.98 } : {}}
          >
            <Mic className={cn(
              "w-6 h-6",
              isListeningLocal && "animate-pulse"
            )} strokeWidth={2} />
            <span>{isListeningLocal ? 'Listening...' : 'Speak your answer'}</span>
          </motion.button>
        )}
        
        {/* Voice Hint - Nur im Debug-Modus */}
        {showVoiceFeatures && !showOtherInput && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs font-light text-gray-500 italic text-center flex items-center justify-center gap-1"
          >
            <Mic className="w-3 h-3" />
            Click the button above or just say your choice
          </motion.p>
        )}
      
      {/* Show Other Input if activated */}
      {showOtherInput ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Please specify:</p>
          <input
            type="text"
            value={otherValue}
            onChange={(e) => setOtherValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleOtherSubmit();
              }
            }}
            placeholder="Your answer..."
            className="w-full px-4 py-3 rounded-2xl focus:outline-none glass-card glass-gradient-border shadow-lg focus:glass-gradient-border-selected"
            autoFocus
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <button
              onClick={handleOtherSubmit}
              disabled={isLoading || !otherValue.trim()}
              className="px-6 py-3 rounded-2xl font-light bg-gradient-to-r from-sky-400/30 to-blue-500/30 hover:from-sky-400/40 hover:to-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all glass-gradient-border-selected"
            >
              Submit
            </button>
            <button
              onClick={() => {
                setShowOtherInput(false);
                setOtherValue('');
              }}
              disabled={isLoading}
              className="px-6 py-3 rounded-2xl font-light text-gray-700 bg-white/40 hover:bg-white/60 disabled:opacity-50 transition-all glass-gradient-border"
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {normalizedOptions.map((option, index) => {
          const isSelected = data.allowMultiple
            ? selected.includes(option.value)
            : false;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: index * 0.08,
                type: 'spring',
                stiffness: 200,
                damping: 20
              }}
              whileHover={{ 
                scale: 1.01,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleClick(option.value)}
              disabled={isLoading}
              className={cn(
                'relative w-full py-4 px-5 rounded-2xl text-left',
                'transition-all duration-300',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'group overflow-hidden',
                isSelected
                  ? 'glass-gradient-border-selected shadow-lg'
                  : 'glass-gradient-border bg-white/25 hover:shadow-md',
                voiceMatched === option.value && 'voice-matched'
              )}
              style={
                isSelected ? {
                  background: 'linear-gradient(135deg, rgba(186, 230, 253, 0.4) 0%, rgba(254, 243, 242, 0.4) 50%, rgba(219, 234, 254, 0.4) 100%)'
                } : undefined
              }
            >
              {/* Animated Gradient Background on Hover */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(135deg, rgba(186, 230, 253, 0.5) 0%, rgba(254, 243, 242, 0.5) 50%, rgba(219, 234, 254, 0.5) 100%)',
                  backgroundSize: '200% 200%',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* Glow Effect bei Selected */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -inset-1 -z-10 blur-xl rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(186, 230, 253, 0.4) 0%, rgba(254, 243, 242, 0.4) 50%, rgba(219, 234, 254, 0.4) 100%)'
                  }}
                />
              )}

              <div className="relative flex items-center gap-3">
                {/* Multi-Select: Checkmark Circle */}
                {data.allowMultiple && (
                  <motion.div
                    className={cn(
                      'w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 relative overflow-hidden',
                      isSelected
                        ? 'border-transparent shadow-md'
                        : 'bg-white/50 border-gray-300 group-hover:border-blue-300 group-hover:bg-white/70'
                    )}
                    whileHover={{ scale: 1.15 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    {/* Animated Fill Background */}
                    {isSelected && (
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          background: '#60a5fa',
                          borderRadius: '50%'
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          type: 'spring',
                          stiffness: 300,
                          damping: 20,
                          duration: 0.4
                        }}
                      />
                    )}

                    {/* Checkmark */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ 
                          delay: 0.15,
                          type: 'spring', 
                          stiffness: 400, 
                          damping: 15 
                        }}
                        className="relative z-10"
                      >
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </motion.div>
                )}
                
                {/* Label */}
                <span className={cn(
                  'font-light text-base flex-1',
                  isSelected ? 'text-gray-900' : 'text-gray-800 group-hover:text-gray-900'
                )}>
                  {option.label}
                </span>
                
                {/* Single-Select: Arrow at end */}
                {!data.allowMultiple && (
                  <motion.div
                    className="flex-shrink-0"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-900" strokeWidth={2} />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
        </div>
      )}

      {data.allowMultiple && !showOtherInput && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: data.options.length * 0.08 }}
          onClick={handleSubmit}
          disabled={selected.length === 0 || isLoading}
          whileHover={{ scale: selected.length > 0 ? 1.02 : 1 }}
          whileTap={{ scale: selected.length > 0 ? 0.98 : 1 }}
          className={cn(
            'relative w-full py-4 px-6 rounded-2xl font-light text-base overflow-hidden',
            'transition-all duration-300',
            selected.length > 0
              ? 'text-white shadow-xl glass-gradient-border-selected'
              : 'opacity-50 cursor-not-allowed text-gray-600 glass-gradient-border bg-white/25'
          )}
          style={
            selected.length > 0 ? {
              backgroundImage: 'linear-gradient(-225deg, #CBBACC 0%, #2580B3 100%)'
            } : undefined
          }
        >
          Continue ({selected.length} selected)
        </motion.button>
      )}
      </div>
    </>
  );
};


