'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mic } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { cn } from '@/lib/utils';
import type { InputComponentData, ValidationRules } from '@/types';
import { validateRequired, validatePercentage, validateMinMax, validatePattern } from '@/utils/validators';
import { useVoice } from '../../hooks/useVoice';
import { parseTextInput } from '../../utils/voiceParser';

interface UdgGlassInputProps {
  data: InputComponentData;
  validation?: ValidationRules;
}

export const UdgGlassInput = ({ data, validation }: UdgGlassInputProps) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isListeningLocal, setIsListeningLocal] = useState(false);
  const { sendResponse, isLoading } = useChatStore();
  const { isActive: isVoiceEnabled, listen } = useVoice();
  
  // Check for debug mode (voice features)
  const urlParams = new URLSearchParams(window.location.search);
  const isVoiceDebugMode = urlParams.get('debug') === 'true';
  const showVoiceFeatures = isVoiceEnabled && isVoiceDebugMode;

  const validate = (): boolean => {
    setError(null);

    if (validation?.required && !validateRequired(value)) {
      setError('This field is required');
      return false;
    }

    if (data.inputType === 'number' || data.inputType === 'percentage') {
      const numValue = parseFloat(value);

      if (isNaN(numValue)) {
        setError('Please enter a valid number');
        return false;
      }

      if (data.inputType === 'percentage' && !validatePercentage(numValue)) {
        setError('Value must be between 0 and 100');
        return false;
      }

      if (!validateMinMax(numValue, validation?.min, validation?.max)) {
        setError(`Value must be between ${validation?.min || 0} and ${validation?.max || 100}`);
        return false;
      }
    }

    if (validation?.pattern && !validatePattern(value, validation.pattern)) {
      setError('Invalid format');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const submitValue =
      data.inputType === 'number' || data.inputType === 'percentage'
        ? parseFloat(value)
        : value;

    sendResponse(submitValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  const handleVoiceInput = async () => {
    if (!isVoiceEnabled || isListeningLocal) return;
    
    setIsListeningLocal(true);
    setError(null);
    
    try {
      const transcript = await listen();
      const parsedValue = parseTextInput(transcript);
      setValue(parsedValue);
    } catch (error) {
      console.error('Voice input error:', error);
      setError('Voice input failed. Please try again or type instead.');
    } finally {
      setIsListeningLocal(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <p className="text-gray-700 font-light text-lg mb-2">{data.question}</p>

      <div className="flex gap-3">
        {/* Input Field with Glass Effect */}
        <motion.div 
          className="flex-1 relative group"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <input
            type={data.inputType === 'text' ? 'text' : 'number'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={data.placeholder}
            disabled={isLoading}
            className={cn(
              'w-full px-6 py-4 rounded-2xl font-light text-base',
              'backdrop-blur-xl bg-white/40 border border-white/60',
              'transition-all duration-300',
              'focus:outline-none focus:bg-white/50 focus:border-white/80 focus:shadow-lg',
              'placeholder:text-gray-400',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-red-400 bg-red-50/30' : '',
              isListeningLocal ? 'voice-listening' : '',
              'glass-gradient-border',
              showVoiceFeatures ? 'pr-14' : ''
            )}
            style={{
              boxShadow: error 
                ? '0 0 20px rgba(239, 68, 68, 0.2)' 
                : isListeningLocal
                ? '0 0 30px rgba(96, 165, 250, 0.4)'
                : value 
                ? '0 0 20px rgba(96, 165, 250, 0.15)' 
                : '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}
            step={data.inputType === 'percentage' ? '0.1' : undefined}
          />
          
          {/* Voice Input Button - Nur im Debug-Modus */}
          {showVoiceFeatures && (
            <motion.button
              onClick={handleVoiceInput}
              disabled={isLoading || isListeningLocal}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'w-10 h-10 rounded-xl',
                'flex items-center justify-center',
                'transition-all duration-300',
                isListeningLocal
                  ? 'bg-green-400/40 text-white voice-listening'
                  : 'bg-white/60 hover:bg-white/80 text-gray-700',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
              whileHover={!isLoading && !isListeningLocal ? { scale: 1.05 } : {}}
              whileTap={!isLoading && !isListeningLocal ? { scale: 0.95 } : {}}
            >
              <Mic className="w-5 h-5" strokeWidth={2} />
            </motion.button>
          )}
          
          {data.suffix && (
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 font-light">
              {data.suffix}
            </span>
          )}

          {/* Animated Focus Indicator */}
          {value && !error && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
              style={{ boxShadow: '0 0 10px rgba(96, 165, 250, 0.5)' }}
            />
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.button
          onClick={handleSubmit}
          disabled={!value || isLoading}
          whileHover={value && !isLoading ? { scale: 1.05 } : {}}
          whileTap={value && !isLoading ? { scale: 0.95 } : {}}
          className={cn(
            'group relative overflow-hidden px-8 py-4 rounded-2xl font-light text-base',
            'flex items-center gap-2',
            'transition-all duration-300 glass-gradient-border-selected',
            value && !isLoading
              ? 'text-white cursor-pointer'
              : 'text-gray-400 opacity-50 cursor-not-allowed'
          )}
          style={{
            backgroundImage: value && !isLoading
              ? 'linear-gradient(-225deg, #CBBACC 0%, #2580B3 100%)'
              : 'linear-gradient(135deg, rgba(186, 230, 253, 0.3) 0%, rgba(219, 234, 254, 0.3) 100%)',
          }}
        >
          <span className="relative z-10 flex items-center gap-2">
            <ArrowRight className={cn(
              "w-5 h-5 transition-transform duration-300",
              value && !isLoading && "group-hover:translate-x-1"
            )} />
            <span className="hidden sm:inline">Send</span>
          </span>

          {/* Shimmer Effect when enabled */}
          {value && !isLoading && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
                ease: 'linear',
              }}
            />
          )}
        </motion.button>
      </div>

      {/* Voice Hint - Nur im Debug-Modus */}
      {showVoiceFeatures && !value && !isListeningLocal && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs font-light text-gray-500 italic flex items-center gap-1"
        >
          <Mic className="w-3 h-3" />
          You can also speak your answer
        </motion.p>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card glass-gradient-border-error px-4 py-3 rounded-xl"
        >
          <p className="text-sm text-red-700 font-light">{error}</p>
        </motion.div>
      )}
    </motion.div>
  );
};


