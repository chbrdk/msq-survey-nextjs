'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Send, Mic } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { cn } from '@/lib/utils';
import type { MultiSelectComponentData, MultiSelectOption } from '@/types';
import { useVoice } from '../../hooks/useVoice';
import { parseMultiSelect, isDoneCommand, parseButtonChoice } from '../../utils/voiceParser';
import { VoiceConfirmationModal } from '../glass/VoiceConfirmationModal';

interface UdgGlassMultiSelectProps {
  data: MultiSelectComponentData;
}

export const UdgGlassMultiSelect = ({ data }: UdgGlassMultiSelectProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isListeningLocal, setIsListeningLocal] = useState(false);
  const [voiceMatched, setVoiceMatched] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceMode] = useState<'batch' | 'sequential'>('batch');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherValue, setOtherValue] = useState('');
  const [customOptions, setCustomOptions] = useState<MultiSelectOption[]>([]);
  const { sendResponse, isLoading } = useChatStore();
  const { isActive: isVoiceEnabled, listen } = useVoice();
  
  // Check for debug mode (voice features)
  const urlParams = new URLSearchParams(window.location.search);
  const isVoiceDebugMode = urlParams.get('debug') === 'true';
  const showVoiceFeatures = isVoiceEnabled && isVoiceDebugMode;

  // Separate "Other" option from regular options
  const otherOption = data.options.find(opt => 
    opt.id === 'other' || opt.id === '_other_' || opt.label.toLowerCase() === 'other'
  );
  const regularOptions = data.options.filter(opt => 
    opt.id !== 'other' && opt.id !== '_other_' && opt.label.toLowerCase() !== 'other'
  );

  // Combine: regular options + custom options + "Other" at the end
  const allOptions = [
    ...regularOptions,
    ...customOptions,
    ...(otherOption ? [otherOption] : [])
  ];

  const handleToggle = (optionId: string) => {
    setError(null);
    
    // Check if "Other" option was clicked
    if (optionId === 'other' || optionId === '_other_' || optionId.toLowerCase() === 'other') {
      setShowOtherInput(true);
      return;
    }
    
    if (selected.includes(optionId)) {
      setSelected(selected.filter((id) => id !== optionId));
    } else {
      // Check max constraint
      if (data.max && selected.length >= data.max) {
        setError(`You can select maximum ${data.max} options`);
        return;
      }
      setSelected([...selected, optionId]);
    }
  };

  const handleAddOther = () => {
    if (otherValue.trim()) {
      const newId = `custom_${Date.now()}`;
      const newOption: MultiSelectOption = {
        id: newId,
        label: otherValue.trim()
      };
      
      // Add to custom options
      setCustomOptions([...customOptions, newOption]);
      
      // Auto-select the new option
      setSelected([...selected, newId]);
      
      // Reset
      setOtherValue('');
      setShowOtherInput(false);
    }
  };

  const handleSubmit = () => {
    // Check min constraint
    if (data.min && selected.length < data.min) {
      setError(`Please select at least ${data.min} option(s)`);
      return;
    }

    // Check max constraint
    if (data.max && selected.length > data.max) {
      setError(`You can select maximum ${data.max} options`);
      return;
    }

    if (selected.length === 0) {
      setError('Please select at least one option');
      return;
    }

    sendResponse(selected);
  };

  const isValid = 
    selected.length > 0 &&
    (!data.min || selected.length >= data.min) &&
    (!data.max || selected.length <= data.max);

  // Determine voice strategy based on option count
  const useSequentialMode = data.options.length > 5;

  // Batch Voice Input (for few options)
  const handleVoiceBatch = async () => {
    if (!isVoiceEnabled || isListeningLocal) return;
    
    setIsListeningLocal(true);
    setError(null);
    
    try {
      const transcript = await listen();
      setVoiceTranscript(transcript);
      
      // Parse multiple selections
      const matches = parseMultiSelect(
        transcript,
        data.options.map(o => ({ label: o.label, value: o.id }))
      );
      
      if (matches.length > 0) {
        const matchedIds = matches.map(m => m.value);
        setVoiceMatched(matchedIds);
        setSelected(matchedIds);
        
        // Show confirmation
        setShowConfirmation(true);
      } else {
        setError('Could not understand. Please try again or click options.');
      }
    } catch (error) {
      console.error('Voice input error:', error);
      setError('Voice input failed. Please try again.');
    } finally {
      setIsListeningLocal(false);
    }
  };

  // Sequential Voice Input (for many options)
  const handleVoiceSequential = async () => {
    if (!isVoiceEnabled || isListeningLocal) return;
    
    setIsListeningLocal(true);
    setError(null);
    const newSelections: string[] = [...selected];
    
    try {
      while (true) {
        const transcript = await listen(10000); // 10s timeout per item
        
        // Check if user said "done"
        if (isDoneCommand(transcript)) {
          break;
        }
        
        // Try to match to an option
        const match = parseButtonChoice(
          transcript,
          data.options.map(o => ({ label: o.label, value: o.id }))
        );
        
        if (match && !newSelections.includes(match.value)) {
          newSelections.push(match.value);
          setSelected([...newSelections]);
          setVoiceMatched([...newSelections]);
          
          // Brief pause to show selection
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Check if max reached
        if (data.max && newSelections.length >= data.max) {
          break;
        }
      }
      
      if (newSelections.length > selected.length) {
        // New items were added
        setSelected(newSelections);
      }
    } catch (error) {
      console.error('Voice sequential error:', error);
    } finally {
      setIsListeningLocal(false);
    }
  };

  const handleVoiceConfirm = () => {
    setShowConfirmation(false);
    setVoiceMatched([]);
    // Keep selected as is
  };

  const handleVoiceRetry = () => {
    setShowConfirmation(false);
    setVoiceMatched([]);
    setSelected([]);
    if (voiceMode === 'batch') {
      handleVoiceBatch();
    } else {
      handleVoiceSequential();
    }
  };

  const handleVoiceTypeInstead = () => {
    setShowConfirmation(false);
    setVoiceMatched([]);
    setSelected([]);
  };

  return (
    <>
      {/* Voice Confirmation Modal */}
      <VoiceConfirmationModal
        isOpen={showConfirmation}
        transcript={voiceTranscript}
        parsedValue={voiceMatched.map(id => 
          data.options.find(o => o.id === id)?.label
        ).join(', ')}
        onConfirm={handleVoiceConfirm}
        onRetry={handleVoiceRetry}
        onTypeInstead={handleVoiceTypeInstead}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div>
          <p className="text-gray-700 font-light">{data.question}</p>
          {(data.min || data.max) && (
            <p className="text-sm text-gray-500 mt-1">
              {data.min && data.max && data.min === data.max
                ? `Select exactly ${data.min} option(s)`
                : data.min && data.max
                ? `Select ${data.min}-${data.max} options`
                : data.min
                ? `At least ${data.min} option(s)`
                : `Maximum ${data.max} options`}
            </p>
          )}
        </div>
        
        {/* Voice Input Button - Nur im Debug-Modus */}
        {showVoiceFeatures && (
          <div className="space-y-2">
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={useSequentialMode ? handleVoiceSequential : handleVoiceBatch}
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
              <span>
                {isListeningLocal 
                  ? (useSequentialMode ? 'Listening... (say "done" when finished)' : 'Listening...') 
                  : 'Speak your selections'}
              </span>
            </motion.button>
            
            {/* Voice Hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-light text-gray-500 italic text-center flex items-center justify-center gap-1"
            >
              <Mic className="w-3 h-3" />
              {useSequentialMode 
                ? 'Say each option one by one, then say "done"' 
                : 'Say all your choices (e.g., "Option one, option two, and option three")'}
            </motion.p>
            
            {selected.length > 0 && (
              <p className="text-sm font-light text-center text-blue-600">
                {selected.length} of {data.options.length} selected
              </p>
            )}
          </div>
        )}

      {/* Options Grid */}
      <div className="grid grid-cols-1 gap-3">
          {allOptions.map((option, index) => {
            const isSelected = selected.includes(option.id);
            const isCustom = customOptions.some(co => co.id === option.id);

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
              onClick={() => handleToggle(option.id)}
              disabled={isLoading}
              className={cn(
                'relative w-full py-4 px-5 rounded-2xl text-left',
                'transition-all duration-300',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'group overflow-hidden',
                isSelected
                  ? 'glass-gradient-border-selected shadow-lg'
                  : 'glass-gradient-border bg-white/25 hover:shadow-md',
                voiceMatched.includes(option.id) && 'voice-matched'
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
                {/* Checkbox - Rund, näher am Rand */}
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

                <span
                  className={cn(
                    'font-light text-base flex-1',
                    isSelected ? 'text-gray-900' : 'text-gray-800 group-hover:text-gray-900'
                  )}
                >
                  {option.label}
                </span>

                {/* Custom Badge */}
                {isCustom && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-light">
                    Custom
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Add Other Input - appears below list */}
      <AnimatePresence>
        {showOtherInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 p-5 rounded-2xl glass-card glass-gradient-border-selected shadow-xl">
              <p className="text-sm text-gray-800 font-light">Add your own option:</p>
              <input
                type="text"
                value={otherValue}
                onChange={(e) => setOtherValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading && otherValue.trim()) {
                    handleAddOther();
                  }
                }}
                placeholder="Type your option..."
                className="w-full px-4 py-3 rounded-2xl focus:outline-none glass-card glass-gradient-border shadow-lg focus:glass-gradient-border-selected font-light"
                autoFocus
                disabled={isLoading}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddOther}
                  disabled={isLoading || !otherValue.trim()}
                  className="flex-1 px-6 py-3 rounded-2xl font-light bg-gradient-to-r from-sky-400/30 to-blue-500/30 hover:from-sky-400/40 hover:to-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all glass-gradient-border-selected"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowOtherInput(false);
                    setOtherValue('');
                  }}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-2xl font-light text-gray-700 bg-white/40 hover:bg-white/60 disabled:opacity-50 transition-all glass-gradient-border"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}

      {/* Submit Button */}
      <motion.button
        onClick={handleSubmit}
        disabled={!isValid || isLoading}
        whileHover={{ scale: isValid ? 1.02 : 1 }}
        whileTap={{ scale: isValid ? 0.98 : 1 }}
        className={cn(
          'relative w-full py-4 px-6 rounded-2xl font-light text-base overflow-hidden',
          'transition-all duration-300 flex items-center justify-center gap-2',
          isValid
            ? 'text-white shadow-xl glass-gradient-border-selected'
            : 'opacity-50 cursor-not-allowed text-gray-600 glass-gradient-border bg-white/25'
        )}
        style={
          isValid ? {
            backgroundImage: 'linear-gradient(-225deg, #CBBACC 0%, #2580B3 100%)'
          } : undefined
        }
      >
        <Send className="w-4 h-4" />
        Continue ({selected.length} selected)
      </motion.button>
      </motion.div>
    </>
  );
};


