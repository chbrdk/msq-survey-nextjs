'use client';

import { RotateCcw } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';

export const Header = () => {
  const { progress, resetChat, isInitialized } = useChatStore();

  const handleReset = () => {
    if (confirm('Do you really want to restart the survey? All previous answers will be lost.')) {
      resetChat();
      window.location.reload();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/MSQ_WhiteLogo_RGB_360px.svg" 
            alt="MSQ Logo" 
            className="h-8 w-auto"
          />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">MSQ Workflow Survey</h1>
            <p className="text-sm text-gray-500">Workflow Documentation</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Progress: <span className="font-semibold text-primary-600">{Math.round(progress)}%</span>
          </div>
          
          {/* Show reset button if initialized (even at 0% to escape stuck states) */}
          {isInitialized && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Restart survey"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Restart</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


