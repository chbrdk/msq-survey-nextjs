'use client';

import { useEffect, useRef } from 'react';
import { Message } from './Message';
import type { Message as MessageType } from '@/types';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
}

export const MessageList = ({ messages, isLoading }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Find the index of the last assistant message with a component
  const lastComponentIndex = messages.reduce((lastIndex, message, index) => {
    if (message.role === 'assistant' && message.manifestComponent) {
      return index;
    }
    return lastIndex;
  }, -1);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
      <div className="max-w-4xl mx-auto">
        {messages.map((message, index) => (
          <Message 
            key={message.id} 
            message={message}
            showComponent={index === lastComponentIndex}
          />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-700">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div className="flex items-center px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};


