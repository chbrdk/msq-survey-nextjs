'use client';

/**
 * Voice Waveform Component
 * Visualizes audio levels with animated bars
 */

import { motion } from 'framer-motion';

interface VoiceWaveformProps {
  isActive?: boolean;
  barCount?: number;
}

export function VoiceWaveform({ isActive = false, barCount = 5 }: VoiceWaveformProps) {
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {Array.from({ length: barCount }).map((_, index) => (
        <motion.div
          key={index}
          className="w-1 bg-gradient-to-t from-sky-400 to-blue-500 rounded-full"
          animate={isActive ? {
            height: ['8px', '24px', '12px', '20px', '8px'],
            opacity: [0.5, 1, 0.7, 1, 0.5]
          } : {
            height: '8px',
            opacity: 0.3
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.1,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

