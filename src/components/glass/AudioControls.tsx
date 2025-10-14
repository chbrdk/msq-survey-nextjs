'use client';

/**
 * Audio Controls
 * Playback controls during TTS
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Square, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { useVoice } from '../../hooks/useVoice';

export function AudioControls() {
  const { isSpeaking } = useVoice();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(100);
  const [speed, setSpeed] = useState(1);
  
  const handleStop = () => {
    // TODO: Implement stop functionality
    console.log('Stop audio');
  };
  
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    // TODO: Implement pause/resume functionality
  };
  
  return (
    <AnimatePresence>
      {isSpeaking && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          onHoverStart={() => setIsExpanded(true)}
          onHoverEnd={() => setIsExpanded(false)}
          className="fixed top-24 right-6 z-40"
        >
          <motion.div
            className="glass-card glass-gradient-border p-3"
            animate={{ width: isExpanded ? '240px' : '60px' }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3">
              {/* Pause/Resume Button */}
              <motion.button
                onClick={handlePauseResume}
                className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                {isPaused ? (
                  <Play className="w-5 h-5 text-white" strokeWidth={2} />
                ) : (
                  <Pause className="w-5 h-5 text-white" strokeWidth={2} />
                )}
              </motion.button>
              
              {/* Expanded Controls */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex items-center gap-3 overflow-hidden"
                  >
                    {/* Stop Button */}
                    <motion.button
                      onClick={handleStop}
                      className="w-10 h-10 rounded-xl bg-white/20 hover:bg-red-400/30 flex items-center justify-center transition-colors"
                      whileTap={{ scale: 0.95 }}
                    >
                      <Square className="w-5 h-5 text-white" strokeWidth={2} />
                    </motion.button>
                    
                    {/* Volume Control */}
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-gray-300" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(parseInt(e.target.value))}
                        className="w-16 h-1 slider-thumb"
                      />
                    </div>
                    
                    {/* Speed Control */}
                    <select
                      value={speed}
                      onChange={(e) => setSpeed(parseFloat(e.target.value))}
                      className="px-2 py-1 rounded bg-white/20 text-white text-xs font-light border-none outline-none"
                    >
                      <option value="0.75">0.75x</option>
                      <option value="1">1x</option>
                      <option value="1.25">1.25x</option>
                      <option value="1.5">1.5x</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

