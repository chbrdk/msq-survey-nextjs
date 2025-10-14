'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Bot } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import type { Message } from '@/types';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryPanel = ({ isOpen, onClose }: HistoryPanelProps) => {
  const { messages, currentPhase } = useChatStore();

  // Gruppiere Messages nach Phasen - ordne User-Messages der Phase der vorherigen Bot-Message zu
  const groupedMessages: Record<string, Message[]> = {};
  let lastPhase = 'introduction';
  
  messages.forEach(message => {
    if (message.role === 'assistant') {
      // Bot-Message: Verwende die Phase aus der Message
      lastPhase = message.conversationState?.currentPhase || lastPhase;
    }
    
    // Füge Message zur aktuellen Phase hinzu (auch User-Messages)
    if (!groupedMessages[lastPhase]) {
      groupedMessages[lastPhase] = [];
    }
    groupedMessages[lastPhase].push(message);
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md glass-panel z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/40">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-light text-gray-900">
                  Conversation History
                </h2>
                <button
                  onClick={onClose}
                  className="glass-button p-2 hover:bg-white/60"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Current Phase: <span className="font-light">{currentPhase}</span>
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              {Object.entries(groupedMessages).map(([phase, phaseMessages]) => (
                <div key={phase} className="space-y-3">
                  <h3 className="text-sm font-light text-gray-700 uppercase tracking-wide">
                    {phase}
                  </h3>
                  <div className="space-y-2">
                    {phaseMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-2 items-start ${
                          message.role === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        {/* Mini Avatar */}
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            message.role === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {message.role === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                        </div>

                        {/* Message Content */}
                        <div
                          className={`flex-1 text-xs p-2 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-500/20 text-gray-900'
                              : 'bg-white/40 text-gray-800 border border-white/40'
                          }`}
                        >
                          <p className="line-clamp-3">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

