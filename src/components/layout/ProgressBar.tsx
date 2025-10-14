'use client';

import { useChatStore } from '@/stores/chatStore';
import { motion } from 'framer-motion';

export const ProgressBar = () => {
  const progress = useChatStore((state) => state.progress);

  return (
    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
    </div>
  );
};


