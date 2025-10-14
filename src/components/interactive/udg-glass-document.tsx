'use client';

import { motion } from 'framer-motion';
import { Download, FileText, Check } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import type { DocumentComponentData } from '@/types';

interface UdgGlassDocumentProps {
  data: DocumentComponentData;
}

export const UdgGlassDocument = ({ data }: UdgGlassDocumentProps) => {
  const { surveyData } = useChatStore();

  const handleDownload = () => {
    const exportData = {
      timestamp: new Date().toLocaleString('de-DE'),
      surveyData,
    };

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
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between glass-effect rounded-xl p-4 border-2 border-green-500 bg-green-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-light text-gray-900">{data.title}</h2>
            <p className="text-sm text-gray-600">Workflow Documentation Complete</p>
          </div>
        </div>
        
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {data.sections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-effect rounded-xl p-6 border-2 border-gray-200"
          >
            <h3 className="text-md font-light text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" />
              {section.title}
            </h3>
            
            {section.type === 'table' && typeof section.content === 'object' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(section.content).map(([key, value]) => (
                      <tr key={key} className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-light text-gray-700">{key}</td>
                        <td className="py-2 px-3 text-gray-900">
                          {typeof value === 'object' ? JSON.stringify(value) : value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : section.type === 'list' && typeof section.content === 'object' ? (
              <ul className="space-y-2">
                {Object.entries(section.content).map(([key, value]) => (
                  <li key={key} className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span className="text-gray-700">
                      <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {typeof section.content === 'string' ? section.content : JSON.stringify(section.content, null, 2)}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {surveyData.agency && (
          <div className="glass-effect rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Agentur</p>
            <p className="text-sm font-light text-gray-900">{surveyData.agency}</p>
          </div>
        )}
        {surveyData.department && (
          <div className="glass-effect rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Abteilung</p>
            <p className="text-sm font-light text-gray-900">{surveyData.department}</p>
          </div>
        )}
        {surveyData.role && (
          <div className="glass-effect rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Rolle</p>
            <p className="text-sm font-light text-gray-900">{surveyData.role}</p>
          </div>
        )}
        {surveyData.jobLevel && (
          <div className="glass-effect rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Job Level</p>
            <p className="text-sm font-light text-gray-900">{surveyData.jobLevel}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

