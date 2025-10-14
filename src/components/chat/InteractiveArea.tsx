'use client';

import { useChatStore } from '@/stores/chatStore';
import { InteractiveComponent } from '../interactive/InteractiveComponent';
import { AlertCircle } from 'lucide-react';

export const InteractiveArea = () => {
  const { currentComponent, isLoading, error } = useChatStore();

  if (!currentComponent && !error) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto px-6 py-4">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Interactive Component */}
        {currentComponent && !isLoading && (
          <InteractiveComponent component={currentComponent} />
        )}
      </div>
    </div>
  );
};


