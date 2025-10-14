'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Send, Plus, Lightbulb } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { cn } from '@/lib/utils';

interface SmartMultiSelectComponentData {
  question: string;
  smartSuggestions?: boolean;
  suggestionsSource?: string;
  allowCustomInput?: boolean;
  addYourOwnButton?: boolean;
}

interface UdgGlassSmartMultiSelectProps {
  data: SmartMultiSelectComponentData;
  suggestions?: string[];
}

export const UdgGlassSmartMultiSelect = ({ 
  data, 
  suggestions = [] 
}: UdgGlassSmartMultiSelectProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const { sendResponse, isLoading } = useChatStore();

  // Combine suggestions with custom items
  const allOptions = [...suggestions, ...customItems];

  const handleToggle = (value: string) => {
    console.log('[SmartMultiSelect] handleToggle:', value);
    
    // Check if "Other / Add your own" was clicked
    const valueLower = value.toLowerCase();
    if (valueLower.includes('other') || valueLower.includes('add your own') || valueLower.includes('add own')) {
      console.log('[SmartMultiSelect] Opening custom input');
      setShowCustomInput(true);
      return;
    }
    
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const handleAddCustom = () => {
    if (customValue.trim()) {
      const newItem = customValue.trim();
      setCustomItems([...customItems, newItem]);
      setSelected([...selected, newItem]);
      setCustomValue('');
      setShowCustomInput(false);
    }
  };

  const handleSubmit = () => {
    if (selected.length > 0) {
      sendResponse(selected);
    }
  };

  const isValid = selected.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div>
        <p className="text-gray-700 font-light text-lg mb-2">{data.question}</p>
        {data.smartSuggestions && (
          <p className="text-sm text-blue-600 font-light flex items-center gap-1">
            <Lightbulb className="w-4 h-4" />
            Smart suggestions based on your role
          </p>
        )}
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 gap-3">
        {allOptions.map((option, index) => {
          const isSelected = selected.includes(option);
          const isCustom = customItems.includes(option);

          return (
            <motion.button
              key={`${option}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: index * 0.05,
                type: 'spring',
                stiffness: 200,
                damping: 20
              }}
              whileHover={{ 
                scale: 1.01,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleToggle(option)}
              disabled={isLoading}
              className={cn(
                'relative w-full py-4 px-5 rounded-2xl text-left',
                'transition-all duration-300',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'group overflow-hidden',
                isSelected
                  ? 'glass-gradient-border-selected shadow-lg'
                  : 'glass-gradient-border bg-white/25 hover:shadow-md'
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
                {/* Checkbox Circle */}
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

                {/* Label */}
                <span className={cn(
                  'font-light text-base flex-1',
                  isSelected ? 'text-gray-900' : 'text-gray-800 group-hover:text-gray-900'
                )}>
                  {option}
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

      {/* Add Your Own Input - appears below list */}
      <AnimatePresence>
        {showCustomInput && (
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
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading && customValue.trim()) {
                    handleAddCustom();
                  }
                }}
                placeholder="Type your option..."
                className="w-full px-4 py-3 rounded-2xl focus:outline-none glass-card glass-gradient-border shadow-lg focus:glass-gradient-border-selected font-light"
                autoFocus
                disabled={isLoading}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddCustom}
                  disabled={isLoading || !customValue.trim()}
                  className="flex-1 px-6 py-3 rounded-2xl font-light bg-gradient-to-r from-sky-400/30 to-blue-500/30 hover:from-sky-400/40 hover:to-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all glass-gradient-border-selected"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomValue('');
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
  );
};

