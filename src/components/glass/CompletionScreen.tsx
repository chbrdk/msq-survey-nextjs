'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TypewriterText } from './TypewriterText';

interface Firework {
  id: number;
  x: number;
  y: number;
  color: string;
  particles: {
    id: number;
    angle: number;
    velocity: number;
    scale: number;
  }[];
}

export const CompletionScreen = () => {
  const [fireworks, setFireworks] = useState<Firework[]>([]);

  // Generate fireworks continuously
  useEffect(() => {
    const colors = ['#7dd3fc', '#60a5fa', '#3b82f6', '#fb923c', '#fca5a5', '#CBBACC', '#2580B3', '#f59e0b', '#10b981'];
    
    const createFirework = () => {
      const newFirework: Firework = {
        id: Date.now() + Math.random(),
        x: 20 + Math.random() * 60, // 20-80% of screen width
        y: 20 + Math.random() * 40, // 20-60% of screen height
        color: colors[Math.floor(Math.random() * colors.length)],
        particles: []
      };

      // Create particles for this firework (burst effect)
      for (let i = 0; i < 30; i++) {
        newFirework.particles.push({
          id: i,
          angle: (i * 360) / 30,
          velocity: 2 + Math.random() * 2,
          scale: 0.5 + Math.random() * 0.5,
        });
      }

      setFireworks(prev => [...prev, newFirework]);

      // Remove firework after animation
      setTimeout(() => {
        setFireworks(prev => prev.filter(fw => fw.id !== newFirework.id));
      }, 2000);
    };

    // Initial burst
    setTimeout(createFirework, 300);
    setTimeout(createFirework, 500);
    setTimeout(createFirework, 800);

    // Continue creating fireworks
    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        createFirework();
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full flex items-center justify-center min-h-[500px] relative overflow-hidden"
    >
      {/* Fireworks Effect */}
      {fireworks.map((firework) => (
        <div
          key={firework.id}
          className="absolute pointer-events-none"
          style={{
            left: `${firework.x}%`,
            top: `${firework.y}%`,
          }}
        >
          {firework.particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: firework.color,
                scale: particle.scale,
              }}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
              }}
              animate={{
                x: Math.cos((particle.angle * Math.PI) / 180) * particle.velocity * 40,
                y: Math.sin((particle.angle * Math.PI) / 180) * particle.velocity * 40,
                opacity: 0,
                scale: 0,
              }}
              transition={{
                duration: 1.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 px-6 max-w-4xl">
        {/* Headline with TypewriterText - Extra Large & Colorful */}
        <div className="flex justify-center">
          <TypewriterText 
            text="Survey Completed!" 
            className="text-7xl md:text-8xl font-thin bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent leading-tight"
          />
        </div>

        {/* Body Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="space-y-6"
        >
          <p className="text-3xl text-gray-700 font-light leading-relaxed">
            Thank you for taking the time to complete this workflow documentation.
          </p>
          <p className="text-2xl text-gray-600 font-light">
            Your responses help us improve our processes. Have a great day! 🙏
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

