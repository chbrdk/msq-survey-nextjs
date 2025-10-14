'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

const gradientColors = [
  'from-[#7dd3fc] to-[#60a5fa]', // Sky Blue
  'from-[#fca5a5] to-[#fb923c]', // Coral/Peach
  'from-[#60a5fa] to-[#3b82f6]', // Blue
  'from-[#bae6fd] to-[#7dd3fc]', // Light Sky
  'from-[#fecaca] to-[#fca5a5]', // Light Coral
];

export const TypewriterText = ({ text, speed = 30, onComplete, className = "text-gray-900 leading-relaxed text-3xl font-light" }: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);

        // 30% Chance für Partikel bei jedem Buchstaben
        if (Math.random() > 0.7) {
          const newParticle: Particle = {
            id: Date.now() + Math.random(),
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 100,
            color: gradientColors[Math.floor(Math.random() * gradientColors.length)],
          };
          setParticles((prev) => [...prev, newParticle]);

          // Remove particle after 1s
          setTimeout(() => {
            setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
          }, 1000);
        }
      }, speed);

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, text, speed, onComplete, isComplete]);

  return (
    <div ref={containerRef} className="relative">
      <p className={className}>
        {displayedText}
        {!isComplete && (
          <span className="inline-block w-2 h-16 ml-2 animate-blink" style={{
            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
          }} />
        )}
      </p>

      {/* Fliegende Partikel */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              scale: 0,
              x: particle.x,
              y: particle.y,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`absolute w-2 h-2 bg-gradient-to-r ${particle.color} rounded-full pointer-events-none`}
            style={{
              left: '50%',
              top: '50%',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

