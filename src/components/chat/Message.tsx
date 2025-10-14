'use client';

import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import type { Message as MessageType } from '@/types';
import { formatTimestamp } from '@/utils/formatters';
import { ComponentRenderer } from '@/components/interactive/ComponentRenderer';

interface MessageProps {
  message: MessageType;
  onInteraction?: (data: any) => void;
  showComponent?: boolean;
}

export const Message = ({ message, onInteraction, showComponent = true }: MessageProps) => {
  const isUser = message.role === 'user';
  const hasManifestComponent = message.isManifestBased && message.manifestComponent && showComponent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-primary-500 text-white'
            : 'bg-gray-200 text-gray-700'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-primary-500 text-white rounded-tr-none'
              : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        
        {/* Manifest-based Interactive Component (NEW) */}
        {hasManifestComponent && (
          <div className="mt-3 w-full">
            <ComponentRenderer
              config={message.manifestComponent!.componentConfig}
              onInteraction={onInteraction}
            />
          </div>
        )}
        
        <span className="text-xs text-gray-400 mt-1 px-2">
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
};


