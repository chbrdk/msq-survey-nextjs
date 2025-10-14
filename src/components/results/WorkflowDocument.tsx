'use client';

import { Download, FileText } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { motion } from 'framer-motion';

export const WorkflowDocument = () => {
  const { surveyData, messages } = useChatStore();

  const handleExport = () => {
    // Create a formatted document
    const exportData = {
      timestamp: new Date().toLocaleString('de-DE'),
      surveyData,
      conversationHistory: messages,
    };

    // Download as JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow-survey-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-xl p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary-500" />
          <h2 className="text-xl font-semibold text-gray-900">
            Workflow Dokumentation
          </h2>
        </div>
        
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Agency Info */}
      {surveyData.agency && (
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Agentur</h3>
          <p className="text-gray-900">{surveyData.agency}</p>
        </div>
      )}

      {/* Department Info */}
      {surveyData.department && (
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Abteilung</h3>
          <p className="text-gray-900">{surveyData.department}</p>
        </div>
      )}

      {/* Role Info */}
      {surveyData.role && (
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Rolle</h3>
          <p className="text-gray-900">{surveyData.role}</p>
        </div>
      )}

      {/* Job Level */}
      {surveyData.jobLevel && (
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Job Level</h3>
          <p className="text-gray-900">{surveyData.jobLevel}</p>
        </div>
      )}

      {/* Phase Allocation */}
      {surveyData.phaseAllocation && (
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Phasen-Aufteilung</h3>
          <div className="space-y-2 mt-3">
            {Object.entries(surveyData.phaseAllocation).map(([phase, percentage]) => (
              <div key={phase} className="flex justify-between items-center">
                <span className="text-gray-700">{phase}</span>
                <span className="font-semibold text-primary-600">{percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tools */}
      {surveyData.tools && surveyData.tools.length > 0 && (
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Verwendete Tools</h3>
          <div className="flex flex-wrap gap-2 mt-3">
            {surveyData.tools.map((tool, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pain Points */}
      {surveyData.painPoints && surveyData.painPoints.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Pain Points</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {surveyData.painPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

