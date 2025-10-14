'use client';

import { motion } from 'framer-motion';
import { useChatStore } from '@/stores/chatStore';
import { FileText, CheckCircle, Check } from 'lucide-react';

export const QuickRecapSummary = () => {
  const { conversationState } = useChatStore();
  const collectedData = conversationState?.collectedData || {};

  const handleComplete = () => {
    // Trigger completion by setting isComplete to true
    useChatStore.setState({ isComplete: true });
  };

  // Extract key information from collected data
  const dataEntries = Object.entries(collectedData).filter(([key, value]) => 
    value && key !== 'userId' && key !== 'timestamp'
  );

  // Helper function to render value based on type
  const renderValue = (value: any) => {
    // Array of objects (e.g., percentage allocations)
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      return (
        <div className="space-y-1.5 mt-2">
          {value.map((item, idx) => {
            // Check if it's a percentage allocation
            if ('phase' in item && 'percentage' in item) {
              return (
                <div key={idx} className="flex items-center justify-between text-xs bg-white/40 rounded-lg px-2 py-1.5">
                  <span className="font-light text-gray-800">{item.phase}</span>
                  <span className="font-semibold text-gray-900">{item.percentage}%</span>
                </div>
              );
            }
            // Generic object
            return (
              <div key={idx} className="text-xs bg-white/40 rounded-lg px-2 py-1.5">
                {Object.entries(item).map(([k, v], i) => (
                  <div key={i} className="flex gap-2">
                    <span className="font-semibold text-gray-700">{k}:</span>
                    <span className="font-light text-gray-900">{String(v)}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      );
    }

    // Simple array
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {value.map((item, idx) => (
            <span key={idx} className="text-xs bg-white/40 rounded-lg px-2 py-1 font-light">
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    // Object
    if (typeof value === 'object' && value !== null) {
      return (
        <div className="space-y-1 mt-1 text-xs">
          {Object.entries(value).map(([k, v], idx) => (
            <div key={idx} className="flex gap-2">
              <span className="font-semibold text-gray-700">{k}:</span>
              <span className="font-light text-gray-900">{String(v)}</span>
            </div>
          ))}
        </div>
      );
    }

    // Simple value
    return <span className="text-sm font-light text-gray-900">{String(value)}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="glass-avatar w-10 h-10">
          <FileText className="w-5 h-5 text-gray-700" />
        </div>
        <h2 className="text-2xl font-light text-gray-900">Quick Recap</h2>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {dataEntries.map(([key, value], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl p-4 space-y-2 shadow-sm"
          >
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                {/* Key */}
                <p className="text-base font-semibold text-black uppercase tracking-wide">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                {/* Value */}
                <div className="mt-1">
                  {renderValue(value)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats & Complete Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: dataEntries.length * 0.05 + 0.2 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6"
      >
        {/* Stats Badge */}
        <div className="glass-pill inline-flex items-center gap-2">
          <span className="text-sm text-gray-700 font-light">
            {dataEntries.length} responses collected
          </span>
        </div>

        {/* Complete Survey Button */}
        <motion.button
          className="group relative overflow-hidden px-8 py-4 text-base font-light rounded-2xl glass-gradient-border-selected"
          style={{
            backgroundImage: 'linear-gradient(-225deg, #CBBACC 0%, #2580B3 100%)',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleComplete}
        >
          <span className="relative z-10 flex items-center gap-2 text-white">
            <Check className="w-5 h-5" />
            Complete Survey
          </span>
          {/* Shimmer Effect */}
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
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

