'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Send } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { cn } from '@/lib/utils';
import type { TableComponentData, ValidationRules } from '@/types';
import { validatePercentageSum } from '@/utils/validators';

interface UdgGlassPercentageTableProps {
  data: TableComponentData;
  validation?: ValidationRules;
}

export const UdgGlassPercentageTable = ({ data, validation }: UdgGlassPercentageTableProps) => {
  const [values, setValues] = useState<Record<string, number>>({});
  const [rows, setRows] = useState(data.rows || []);
  const [error, setError] = useState<string | null>(null);
  const { sendResponse, isLoading } = useChatStore();

  // Update rows when data changes
  useEffect(() => {
    if (data.rows) {
      setRows(data.rows);
    }
  }, [data.rows]);

  // Initialize values with pre-filled data
  useEffect(() => {
    const initialValues: Record<string, number> = {};
    rows.forEach(row => {
      if (row.percentage !== undefined && row.percentage !== null) {
        initialValues[row.id] = row.percentage;
      } else {
        initialValues[row.id] = 0; // Explicitly set to 0 if not defined
      }
    });
    setValues(initialValues);
  }, [rows]);

  // Calculate total
  const total = Object.values(values).reduce((sum, val) => sum + (val || 0), 0);
  const targetSum = validation?.sumTo || 100;
  const isValid = validation?.sumTo
    ? validatePercentageSum(Object.values(values), targetSum)
    : true;

  useEffect(() => {
    // Clear error when values change and become valid
    if (isValid && error) {
      setError(null);
    }
  }, [isValid, error]);

  const handleChange = (id: string, inputValue: string) => {
    const numValue = parseFloat(inputValue) || 0;
    
    // Clamp value between 0 and targetSum
    const clampedValue = Math.max(0, Math.min(targetSum, numValue));
    
    setValues((prev) => ({ ...prev, [id]: clampedValue }));
    setError(null);
  };

  const handleAddPhase = (phaseName: string) => {
    const newRow = {
      id: `phase-${Date.now()}`,
      phase: phaseName,
      percentage: 0
    };
    setRows([...rows, newRow]);
    setValues(prev => ({ ...prev, [newRow.id]: 0 }));
  };

  const handleSubmit = () => {
    if (!isValid) {
      setError(
        `The total must equal ${targetSum}%. Currently: ${total.toFixed(1)}%`
      );
      return;
    }

    // Check if all rows have values
    const missingRows = rows.filter((row) => !values[row.id] && values[row.id] !== 0);
    if (validation?.required && missingRows.length > 0) {
      setError('Please fill in all fields');
      return;
    }

    // Send response with row data
    const response = rows.map(row => ({
      phase: row.phase || row.activity,
      percentage: values[row.id] || 0
    }));

    sendResponse(response);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {(data.question || data.title) && (
        <p className="text-gray-700 font-light mb-4">{data.question || data.title}</p>
      )}

      {/* Add Phase Dropdown */}
      {data.additionalOptions && (
        <div className="mb-4">
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleAddPhase(e.target.value);
                e.target.value = '';
              }
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading}
          >
            <option value="">{data.additionalOptions.label}</option>
            {data.additionalOptions.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="glass-effect rounded-xl overflow-hidden border-2 border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-light text-gray-700">
                {data.columns?.[0]?.label || 'Phase'}
              </th>
              <th className="px-4 py-3 text-right text-sm font-light text-gray-700">
                {data.columns?.[1]?.label || 'Your Time %'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((row, index) => (
              <motion.tr
                key={row.id || `row-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-gray-900">
                  {row.phase || row.activity}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <input
                      type="number"
                      min="0"
                      max={targetSum}
                      step="0.1"
                      placeholder="0"
                      value={values[row.id] || ''}
                      onChange={(e) => handleChange(row.id, e.target.value)}
                      disabled={isLoading}
                      className={cn(
                        'w-24 px-3 py-2 text-right rounded-lg',
                        'border-2 transition-all duration-200',
                        'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        values[row.id] ? 'border-gray-300' : 'border-gray-200'
                      )}
                    />
                    <span className="text-sm text-gray-500 w-6">%</span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 border-t-2 border-gray-300">
            <tr>
              <td className="px-4 py-3 text-sm font-light text-gray-900">
                Total
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <span
                    className={cn(
                      'text-sm font-light px-3 py-1 rounded-lg',
                      isValid
                        ? 'text-green-700 bg-green-100'
                        : 'text-red-700 bg-red-100'
                    )}
                  >
                    {total.toFixed(1)}%
                  </span>
                  {isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || isLoading}
        className={cn(
          'w-full py-3 px-6 rounded-xl font-light',
          'bg-primary-500 text-white',
          'hover:bg-primary-600 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2'
        )}
      >
        <Send className="w-4 h-4" />
        Continue
      </button>
    </motion.div>
  );
};


