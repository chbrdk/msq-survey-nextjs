'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Send, HelpCircle } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { cn } from '@/lib/utils';

interface GuidedInputComponentData {
  guidedQuestions: string[];
  multiline?: boolean;
}

interface UdgGlassGuidedInputProps {
  data: GuidedInputComponentData;
}

export const UdgGlassGuidedInput = ({ data }: UdgGlassGuidedInputProps) => {
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);
  const { sendResponse, isLoading } = useChatStore();

  const handleResponseChange = (questionIndex: number, value: string) => {
    setResponses({
      ...responses,
      [questionIndex]: value
    });
  };

  const handleSubmit = () => {
    // Map responses to questions
    const structuredResponses = data.guidedQuestions.map((question, index) => ({
      question,
      answer: responses[index] || ''
    }));

    sendResponse({
      responses: structuredResponses,
      raw: responses
    });
  };

  const toggleQuestion = (index: number) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  const allAnswered = data.guidedQuestions.every((_, index) => 
    responses[index] && responses[index].trim() !== ''
  );

  const answeredCount = Object.keys(responses).filter(key => 
    responses[parseInt(key)]?.trim()
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4 rounded-2xl glass-card glass-gradient-border">
        <HelpCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-gray-800 font-light text-base leading-relaxed">
            Please answer each of the following questions. This helps us identify specific automation opportunities.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Progress: {answeredCount} of {data.guidedQuestions.length} answered
          </p>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {data.guidedQuestions.map((question, index) => {
          const isExpanded = expandedQuestion === index;
          const hasAnswer = responses[index]?.trim();

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'rounded-2xl overflow-hidden transition-all duration-300',
                'glass-card',
                isExpanded 
                  ? 'glass-gradient-border-selected shadow-lg' 
                  : hasAnswer
                  ? 'glass-gradient-border-selected'
                  : 'glass-gradient-border'
              )}
            >
              {/* Question Header */}
              <button
                onClick={() => toggleQuestion(index)}
                disabled={isLoading}
                className="w-full px-5 py-4 flex items-center justify-between gap-3 hover:bg-white/30 transition-colors duration-200"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <span className={cn(
                    'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-light',
                    hasAnswer
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}>
                    {index + 1}
                  </span>
                  <span className={cn(
                    'font-light text-base',
                    hasAnswer ? 'text-gray-900' : 'text-gray-700'
                  )}>
                    {question}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </motion.div>
              </button>

              {/* Answer Area */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200/50"
                  >
                    <div className="p-5">
                      <textarea
                        value={responses[index] || ''}
                        onChange={(e) => handleResponseChange(index, e.target.value)}
                        placeholder="Enter your answer here..."
                        rows={data.multiline ? 4 : 2}
                        disabled={isLoading}
                        className={cn(
                          'w-full px-4 py-3 rounded-xl',
                          'backdrop-blur-xl bg-white/40 border border-white/60',
                          'transition-all duration-300',
                          'focus:outline-none focus:bg-white/50 focus:border-white/80 focus:shadow-lg',
                          'placeholder:text-gray-400',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          'font-light text-base resize-none'
                        )}
                        autoFocus
                      />
                      
                      {/* Quick Navigation */}
                      <div className="flex gap-2 mt-3">
                        {index < data.guidedQuestions.length - 1 && (
                          <button
                            onClick={() => toggleQuestion(index + 1)}
                            disabled={isLoading}
                            className="text-sm px-4 py-2 rounded-lg font-light text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            Next Question
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Submit Button */}
      <motion.button
        onClick={handleSubmit}
        disabled={!allAnswered || isLoading}
        whileHover={{ scale: allAnswered ? 1.02 : 1 }}
        whileTap={{ scale: allAnswered ? 0.98 : 1 }}
        className={cn(
          'relative w-full py-4 px-6 rounded-2xl font-light text-base overflow-hidden',
          'transition-all duration-300 flex items-center justify-center gap-2',
          'glass-gradient-border-selected',
          allAnswered
            ? 'text-white shadow-xl'
            : 'opacity-50 cursor-not-allowed text-gray-600'
        )}
        style={
          allAnswered ? {
            backgroundImage: 'linear-gradient(-225deg, #CBBACC 0%, #2580B3 100%)'
          } : {
            background: 'linear-gradient(135deg, rgba(186, 230, 253, 0.3) 0%, rgba(219, 234, 254, 0.3) 100%)'
          }
        }
      >
        <Send className="w-4 h-4" />
        <span>
          {allAnswered 
            ? 'Submit Answers' 
            : `${data.guidedQuestions.length - answeredCount} question${data.guidedQuestions.length - answeredCount !== 1 ? 's' : ''} remaining`
          }
        </span>

        {/* Shimmer Effect */}
        {allAnswered && !isLoading && (
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
    </motion.div>
  );
};

