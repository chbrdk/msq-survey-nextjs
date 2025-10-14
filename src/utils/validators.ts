import { APPROVED_AGENCIES, type Agency } from '@/types';

/**
 * Validates if percentages sum to target value (default 100)
 */
export const validatePercentageSum = (
  values: number[],
  target: number = 100
): boolean => {
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.abs(sum - target) < 0.01;
};

/**
 * Validates if agency is in approved list
 */
export const validateAgency = (agency: string): agency is Agency => {
  return APPROVED_AGENCIES.includes(agency as Agency);
};

/**
 * Validates if a value is not empty
 */
export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

/**
 * Validates if a percentage is within valid range (0-100)
 */
export const validatePercentage = (value: number): boolean => {
  return value >= 0 && value <= 100;
};

/**
 * Validates min/max constraints
 */
export const validateMinMax = (
  value: number,
  min?: number,
  max?: number
): boolean => {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
};

/**
 * Validates pattern (regex)
 */
export const validatePattern = (value: string, pattern?: string): boolean => {
  if (!pattern) return true;
  const regex = new RegExp(pattern);
  return regex.test(value);
};


