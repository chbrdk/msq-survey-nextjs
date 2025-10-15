'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, AlertCircle, Sparkles, Zap, RotateCcw, Mic, X } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { cn } from '@/lib/utils';
import type { TableComponentData, ValidationRules } from '@/types';
import { validatePercentageSum } from '@/utils/validators';
import { useVoice } from '../../hooks/useVoice';
import { extractPercentage } from '../../utils/voiceParser';

interface GlassPercentageAllocatorProps {
  data: TableComponentData;
  validation?: ValidationRules;
}

export const GlassPercentageAllocator = ({
  data,
  validation,
}: GlassPercentageAllocatorProps) => {
  const [values, setValues] = useState<Record<string, number>>({});
  const [rows, setRows] = useState(data.rows || []);
  const [error, setError] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [isVoiceGuiding, setIsVoiceGuiding] = useState(false);
  const [currentVoicePhaseIndex, setCurrentVoicePhaseIndex] = useState(0);
  const { sendResponse, isLoading } = useChatStore();
  const { isActive: isVoiceEnabled, listen } = useVoice();
  
  // Check for debug mode (voice features)
  const urlParams = new URLSearchParams(window.location.search);
  const isVoiceDebugMode = urlParams.get('debug') === 'true';
  const showVoiceFeatures = isVoiceEnabled && isVoiceDebugMode;

  const targetSum = validation?.sumTo || 100;
  const total = Object.values(values).reduce((sum, val) => sum + (val || 0), 0);
  const isValid = validation?.sumTo
    ? validatePercentageSum(Object.values(values), targetSum)
    : true;
  const remaining = targetSum - total;

  // Initialize values
  useEffect(() => {
    if (data.rows) {
      setRows(data.rows);
    }
  }, [data.rows]);

  useEffect(() => {
    const initialValues: Record<string, number> = {};
    rows.forEach((row) => {
      initialValues[row.id] = row.percentage || 0;
    });
    setValues(initialValues);
  }, [rows]);

  useEffect(() => {
    if (isValid && error) {
      setError(null);
    }
  }, [isValid, error]);

  const handleIncrement = (id: string, step: number = 5) => {
    setValues((prev) => {
      const current = prev[id] || 0;
      const newValue = Math.min(targetSum, current + step);
      return { ...prev, [id]: newValue };
    });
  };

  const handleDecrement = (id: string, step: number = 5) => {
    setValues((prev) => {
      const current = prev[id] || 0;
      const newValue = Math.max(0, current - step);
      return { ...prev, [id]: newValue };
    });
  };

  const handleSliderChange = (id: string, value: number) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleAutoBalance = () => {
    const count = rows.length;
    const equalShare = Math.floor(targetSum / count);
    const remainder = targetSum - equalShare * count;

    const newValues: Record<string, number> = {};
    rows.forEach((row, index) => {
      newValues[row.id] = equalShare + (index === 0 ? remainder : 0);
    });
    setValues(newValues);
  };

  const handleAddCustom = () => {
    if (!customInput.trim()) return;
    
    const newRow = {
      id: `custom-${Date.now()}`,
      phase: customInput.trim(),
      activity: customInput.trim(),
      percentage: 0,
      isCustom: true
    };
    setRows([...rows, newRow]);
    setValues(prev => ({ ...prev, [newRow.id]: 0 }));
    setCustomInput('');
  };

  const handleRemoveRow = (id: string) => {
    setRows(rows.filter(row => row.id !== id));
    setValues(prev => {
      const newValues = { ...prev };
      delete newValues[id];
      return newValues;
    });
  };

  const handleReset = () => {
    const resetValues: Record<string, number> = {};
    rows.forEach((row) => {
      resetValues[row.id] = 0;
    });
    setValues(resetValues);
  };

  const handleSubmit = () => {
    if (!isValid) {
      setError(
        `Total must equal ${targetSum}%. Currently: ${total.toFixed(1)}%`
      );
      return;
    }

    const response = rows.map((row) => ({
      phase: row.phase || row.activity,
      percentage: values[row.id] || 0,
    }));

    sendResponse(response);
  };

  // Guided Voice Flow for Percentage Allocation
  const handleVoiceGuidedInput = async () => {
    if (!isVoiceEnabled || isVoiceGuiding) return;
    
    setIsVoiceGuiding(true);
    setError(null);
    const newValues: Record<string, number> = {};
    
    try {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        setCurrentVoicePhaseIndex(i);
        
        // Listen for percentage
        const transcript = await listen(15000); // 15s timeout per phase
        const percentage = extractPercentage(transcript);
        
        if (percentage !== null && percentage >= 0 && percentage <= 100) {
          newValues[row.id] = percentage;
          setValues(prev => ({ ...prev, [row.id]: percentage }));
          
          // Animate slider movement
          await new Promise(resolve => setTimeout(resolve, 600));
        } else {
          setError(`Could not understand percentage for "${row.phase || row.activity}". Using 0%.`);
          newValues[row.id] = 0;
          setValues(prev => ({ ...prev, [row.id]: 0 }));
        }
      }
      
      // Check if total equals target
      const finalTotal = Object.values(newValues).reduce((a, b) => a + b, 0);
      
      if (Math.abs(finalTotal - targetSum) > 0.1) {
        setError(`Total is ${finalTotal}%. Would you like to adjust manually or auto-balance?`);
      } else {
        // Perfect! Auto-submit
        setTimeout(() => handleSubmit(), 1000);
      }
      
    } catch (error) {
      console.error('Voice guided input error:', error);
      setError('Voice input stopped. You can continue manually.');
    } finally {
      setIsVoiceGuiding(false);
      setCurrentVoicePhaseIndex(-1);
    }
  };

  // Calculate progress percentage for circular indicator
  const progressPercentage = Math.min((total / targetSum) * 100, 100);
  const isOverLimit = total > targetSum;

  return (
    <div className="space-y-4">
      {/* Voice Guided Input Button - Nur im Debug-Modus */}
      {showVoiceFeatures && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleVoiceGuidedInput}
          disabled={isLoading || isVoiceGuiding}
          className={cn(
            'w-full py-6 px-6 rounded-2xl font-light text-base mb-4',
            'flex items-center justify-center gap-3',
            'transition-all duration-300',
            isVoiceGuiding
              ? 'bg-green-400/40 text-white voice-listening'
              : 'bg-gradient-to-r from-purple-400/30 to-indigo-400/30 hover:from-purple-400/40 hover:to-indigo-400/40 text-gray-800',
            'glass-gradient-border-selected shadow-lg',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          whileHover={!isLoading && !isVoiceGuiding ? { scale: 1.02 } : {}}
          whileTap={!isLoading && !isVoiceGuiding ? { scale: 0.98 } : {}}
        >
          <Mic className={cn(
            "w-6 h-6",
            isVoiceGuiding && "animate-pulse"
          )} strokeWidth={2} />
          <span>
            {isVoiceGuiding 
              ? `Listening... (${currentVoicePhaseIndex + 1}/${rows.length})` 
              : 'Voice Guided Input'}
          </span>
        </motion.button>
      )}
      
      {/* Voice Hint - Nur im Debug-Modus */}
      {showVoiceFeatures && !isVoiceGuiding && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs font-light text-gray-500 italic text-center flex items-center justify-center gap-1 mb-4"
        >
          <Mic className="w-3 h-3" />
          I'll ask you for each phase one by one
        </motion.p>
      )}
      
      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <button
          onClick={handleReset}
          disabled={isLoading || total === 0 || isVoiceGuiding}
          className="glass-button text-xs text-gray-700 flex items-center gap-2 px-3 py-1.5 disabled:opacity-30"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
        <button
          onClick={handleAutoBalance}
          disabled={isLoading || isVoiceGuiding}
          className="glass-button text-xs text-gray-700 flex items-center gap-2 px-3 py-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Distribute Evenly
        </button>
      </div>

      {/* Add Custom Entry */}
      {data.allowCustomEntries !== false && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustom();
              }
            }}
            placeholder="Add your own activity..."
            disabled={isLoading || isVoiceGuiding}
            className="flex-1 px-4 py-2 rounded-xl backdrop-blur-lg bg-white/60 border border-white/40 shadow-sm text-sm font-light text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 disabled:opacity-50"
          />
          <button
            onClick={handleAddCustom}
            disabled={!customInput.trim() || isLoading || isVoiceGuiding}
            className={cn(
              'px-4 py-2 rounded-xl backdrop-blur-lg font-light text-sm',
              'bg-blue-500/80 text-white shadow-md',
              'hover:bg-blue-600/80 hover:shadow-lg hover:scale-105',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
              'active:scale-95 transition-all duration-200',
              'flex items-center gap-2'
            )}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </motion.div>
      )}

      {/* Phase Cards */}
      <div className="space-y-3">
        {rows.map((row, index) => {
          const value = values[row.id] || 0;
          const barPercentage = (value / targetSum) * 100;

          return (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "glass-card p-4 space-y-3",
                isVoiceGuiding && currentVoicePhaseIndex === index
                  ? "glass-gradient-border-selected voice-active"
                  : "glass-gradient-border"
              )}
            >
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-light text-gray-900 flex-1">
                    {row.phase || row.activity}
                  </h3>
                  <div className="flex items-center gap-3">
                    <motion.div
                      key={value}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-light text-gray-900"
                    >
                      {value}%
                    </motion.div>
                    {row.isCustom && (
                      <button
                        onClick={() => handleRemoveRow(row.id)}
                        disabled={isLoading || isVoiceGuiding}
                        className="text-red-500 hover:text-red-700 hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove this activity"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
                {/* Description */}
                {row.description && (
                  <p className="text-sm text-gray-600 font-light">
                    {row.description}
                  </p>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                {/* Minus Button */}
                <button
                  onClick={() => handleDecrement(row.id, 5)}
                  disabled={isLoading || value === 0}
                  className={cn(
                    'w-10 h-10 flex items-center justify-center rounded-full',
                    'backdrop-blur-lg bg-white/60 glass-gradient-border-minus',
                    'shadow-md hover:shadow-lg hover:bg-white/80 hover:scale-110',
                    'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100',
                    'active:scale-95 transition-all duration-200'
                  )}
                >
                  <Minus className="w-4 h-4 text-red-600" strokeWidth={2} />
                </button>

                {/* Slider with Gradient Track */}
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max={targetSum}
                    step="1"
                    value={value}
                    onChange={(e) =>
                      handleSliderChange(row.id, parseInt(e.target.value))
                    }
                    disabled={isLoading}
                    className="w-full h-3 rounded-full appearance-none cursor-pointer slider-thumb shadow-inner"
                    style={{
                      background: `linear-gradient(to right, 
                        rgba(186, 230, 253, 0.8) 0%,
                        rgba(252, 165, 165, 0.8) ${barPercentage / 2}%,
                        rgba(96, 165, 250, 0.8) ${barPercentage}%, 
                        rgba(255, 255, 255, 0.4) ${barPercentage}%, 
                        rgba(255, 255, 255, 0.4) 100%)`,
                    }}
                  />
                </div>

                {/* Plus Button */}
                <button
                  onClick={() => handleIncrement(row.id, 5)}
                  disabled={isLoading || total >= targetSum}
                  className={cn(
                    'w-10 h-10 flex items-center justify-center rounded-full',
                    'backdrop-blur-lg bg-white/60 glass-gradient-border-plus',
                    'shadow-md hover:shadow-lg hover:bg-white/80 hover:scale-110',
                    'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100',
                    'active:scale-95 transition-all duration-200'
                  )}
                >
                  <Plus className="w-4 h-4 text-green-600" strokeWidth={2} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card glass-gradient-border-error p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar mit Submit Button */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl glass-card",
        isValid ? "glass-gradient-border-selected" : "glass-gradient-border"
      )}>
        {/* Background Progress Fill */}
        <motion.div
          className={cn(
            'absolute inset-0',
            isOverLimit
              ? 'bg-gradient-to-r from-red-500/30 via-red-400/30 to-red-500/30'
              : isValid
              ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500'
              : ''
          )}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progressPercentage / 100 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={!isValid && !isOverLimit ? {
            transformOrigin: 'left',
            background: 'linear-gradient(to right, rgb(59 130 246 / 20%), rgb(168 85 247 / 20%), rgb(236 72 72 / 20%))'
          } : { transformOrigin: 'left' }}
        />

        {/* Button Content */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          className={cn(
            'relative w-full py-4 px-6 font-light text-base',
            'flex items-center justify-between',
            'transition-all duration-300',
            !isValid && 'opacity-75 cursor-not-allowed'
          )}
        >
          {/* Left Side - Total Percentage */}
          <div className="flex items-center gap-3">
            <motion.div
              key={total}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className={cn(
                'text-3xl font-light',
                isOverLimit
                  ? 'text-red-700'
                  : isValid
                  ? 'text-white drop-shadow-lg'
                  : 'text-gray-900'
              )}
            >
              {total}%
            </motion.div>
            <div className={cn(
              'text-sm font-light',
              isValid ? 'text-white/90' : 'text-gray-600'
            )}>
              {remaining > 0 ? (
                <span>{remaining}% left</span>
              ) : remaining < 0 ? (
                <span className="text-red-100">{Math.abs(remaining)}% over limit</span>
              ) : (
                <span>Perfect allocation!</span>
              )}
            </div>
          </div>

          {/* Right Side - Action Button */}
          <motion.div
            whileHover={{ scale: isValid ? 1.05 : 1 }}
            whileTap={{ scale: isValid ? 0.95 : 1 }}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-xl',
              isValid
                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg border border-white/30'
                : 'bg-gray-300 text-gray-600'
            )}
          >
            {isValid ? (
              <>
                <Zap className="w-5 h-5" />
                Continue
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5" />
                Complete to continue
              </>
            )}
          </motion.div>
        </button>
      </div>
    </div>
  );
};

