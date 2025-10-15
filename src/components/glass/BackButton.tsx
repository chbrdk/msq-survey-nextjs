'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';

export const BackButton = () => {
  const { goBack, canGoBack } = useChatStore();
  const showButton = canGoBack();

  const handleBack = () => {
    if (confirm('Do you really want to go back to the previous step?')) {
      goBack();
    }
  };

  return (
    <AnimatePresence>
      {showButton && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          onClick={handleBack}
          className="glass-button flex items-center gap-2 px-4 py-2 hover:scale-105 active:scale-95 transition-all duration-200"
          style={{ position: 'fixed', bottom: '1.5rem', left: '1.5rem', zIndex: 50 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Go back one step"
        >
          <ArrowLeft className="w-4 h-4 text-gray-700" strokeWidth={2} />
          <span className="text-sm font-light text-gray-700">one step back</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

