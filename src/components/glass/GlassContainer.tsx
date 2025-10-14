'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { GlassHeader } from './GlassHeader';
import { GlassCenteredView } from './GlassCenteredView';
import { ParticleBackground } from './ParticleBackground';
import { HistoryPanel } from './HistoryPanel';
import { VoiceIndicator } from './VoiceIndicator';
import { AudioControls } from './AudioControls';

export const GlassContainer = () => {
  const { messages, isLoading, isInitialized, initializeChat, resetChat, error } =
    useChatStore();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isVoiceDebugMode, setIsVoiceDebugMode] = useState(false);
  
  // Check for debug mode (voice features only in debug) - nur im Browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setIsVoiceDebugMode(urlParams.get('debug') === 'true');
    }
  }, []);

  useEffect(() => {
    // Check for ?reset=true query param to clear localStorage - nur im Browser
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('reset') === 'true') {
        console.log('🧹 Auto-clearing localStorage due to ?reset=true');
        resetChat();
        // Remove query param from URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    if (!isInitialized) {
      initializeChat();
    }
  }, [isInitialized, initializeChat, resetChat]);

  // Filtere die letzte Assistant-Nachricht mit Component
  const currentMessage = messages
    .filter((m) => m.role === 'assistant' && m.manifestComponent)
    .pop();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background mit Gradient */}
      <div className="fixed inset-0 animate-gradient" style={{
        backgroundImage: 'linear-gradient(135deg, #e0f2fe 0%, #fef3f2 50%, #dbeafe 100%)'
      }} />

      {/* Particle Background */}
      <ParticleBackground />

      {/* Glassmorphism Header */}
      <GlassHeader
        onHistoryToggle={() => setIsHistoryOpen(!isHistoryOpen)}
        isHistoryOpen={isHistoryOpen}
      />

      {/* Zentrierter Hauptbereich */}
      <GlassCenteredView
        message={currentMessage}
        isLoading={isLoading}
        error={error}
      />

      {/* History Panel */}
      <HistoryPanel isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      
      {/* Voice Features - Nur im Debug-Modus */}
      {isVoiceDebugMode && (
        <>
          {/* Voice Indicator */}
          <VoiceIndicator />
          
          {/* Audio Controls */}
          <AudioControls />
        </>
      )}
    </div>
  );
};

