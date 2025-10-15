'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, CheckCircle } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { cn } from '@/lib/utils';

interface InfoMessageComponentData {
  message: string;
  requiresAcknowledgement?: boolean;
}

interface UdgGlassInfoMessageProps {
  data: InfoMessageComponentData;
}

// Simple markdown formatter for **bold** and paragraphs
function formatMessage(text: string): JSX.Element[] {
  const paragraphs = text.split('\n\n');
  
  return paragraphs.map((para, idx) => {
    // Replace **text** with <strong>text</strong>
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    
    const formatted = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      
      // Handle bullet points (• or - at start of line)
      if (part.startsWith('•') || part.startsWith('-')) {
        return <span key={i} className="block pl-4">{part}</span>;
      }
      
      return <span key={i}>{part}</span>;
    });
    
    return (
      <p key={idx} className="mb-3 last:mb-0">
        {formatted}
      </p>
    );
  });
}

export const UdgGlassInfoMessage = ({ data }: UdgGlassInfoMessageProps) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const { sendResponse, isLoading } = useChatStore();

  const handleAcknowledge = () => {
    setAcknowledged(true);
    sendResponse({ acknowledged: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Info Box */}
      <div className="relative overflow-hidden rounded-2xl glass-card glass-gradient-border p-6">
        {/* Animated Gradient Background */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(135deg, rgba(186, 230, 253, 0.4) 0%, rgba(254, 243, 242, 0.4) 50%, rgba(219, 234, 254, 0.4) 100%)',
            backgroundSize: '200% 200%',
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Content */}
        <div className="relative flex gap-4">
          <div className="flex-shrink-0">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <Info className="w-8 h-8 text-blue-500" strokeWidth={2} />
            </motion.div>
          </div>
          
          <div className="flex-1">
            <div className="text-gray-800 font-light text-base leading-relaxed">
              {formatMessage(data.message)}
            </div>
          </div>
        </div>
      </div>

      {/* Acknowledge Button */}
      {data.requiresAcknowledgement && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={handleAcknowledge}
          disabled={acknowledged || isLoading}
          whileHover={!acknowledged && !isLoading ? { scale: 1.02 } : {}}
          whileTap={!acknowledged && !isLoading ? { scale: 0.98 } : {}}
          className={cn(
            'relative w-full py-4 px-6 rounded-2xl font-light text-base overflow-hidden',
            'transition-all duration-300 flex items-center justify-center gap-2',
            'glass-gradient-border-selected',
            acknowledged || isLoading
              ? 'opacity-60 cursor-not-allowed text-gray-600'
              : 'text-white shadow-xl'
          )}
          style={
            !acknowledged && !isLoading ? {
              backgroundImage: 'linear-gradient(-225deg, #CBBACC 0%, #2580B3 100%)'
            } : {
              background: 'linear-gradient(135deg, rgba(186, 230, 253, 0.3) 0%, rgba(219, 234, 254, 0.3) 100%)'
            }
          }
        >
          {acknowledged ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Got it</span>
            </>
          ) : (
            <>
              <span>Got it - Continue</span>
            </>
          )}

          {/* Shimmer Effect */}
          {!acknowledged && !isLoading && (
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
      )}
    </motion.div>
  );
};

