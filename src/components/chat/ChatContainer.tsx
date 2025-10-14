'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';
import { ProgressBar } from '../layout/ProgressBar';
import { MessageList } from './MessageList';
import { InteractiveArea } from './InteractiveArea';

export const ChatContainer = () => {
  const { messages, isLoading, isInitialized, initializeChat, resetChat } = useChatStore();

  useEffect(() => {
    // Check for ?reset=true query param to clear localStorage
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reset') === 'true') {
      console.log('🧹 Auto-clearing localStorage due to ?reset=true');
      resetChat();
      // Remove query param from URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    if (!isInitialized) {
      initializeChat();
    }
  }, [isInitialized, initializeChat, resetChat]);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <ProgressBar />
      
      <MessageList messages={messages} isLoading={isLoading} />
      
      <InteractiveArea />
      
      <Footer />
    </div>
  );
};


