// API Service - adapted for Next.js API Routes
import axios, { AxiosError } from 'axios';
import type { ConversationState } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60 seconds - some OpenAI calls can take 40+ seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Initialize manifest-based conversation
 */
export const initializeManifestConversation = async () => {
  try {
    const response = await axiosInstance.post('/api/survey/init', {
      action: 'init',
      timestamp: Date.now(),
    });

    console.log('✅ Manifest conversation initialized:', response.data);
    
    // Store userId in localStorage
    if (response.data.userId) {
      localStorage.setItem('msq_survey_user_id', response.data.userId);
    }
    
    return response.data;
  } catch (error) {
    console.error('Failed to initialize manifest conversation:', error);
    throw error;
  }
};

/**
 * Send user message in manifest-based conversation
 */
export const sendManifestMessage = async (
  userId: string,
  userMessage: string,
  conversationState: ConversationState,
  userResponse?: any
) => {
  const payload = {
    userId,
    message: userMessage,
    conversationState,
    userResponse,
    timestamp: Date.now(),
  };

  console.log('🚀 Sending to Next.js API:', payload);

  try {
    const response = await axiosInstance.post('/api/survey/process', payload);
    
    console.log('✅ Response from Next.js API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Generate or retrieve user ID for session tracking
 */
const generateUserId = (): string => {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  const stored = localStorage.getItem('msq_survey_user_id');
  if (stored) {
    return stored;
  }

  const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('msq_survey_user_id', newId);
  return newId;
};

/**
 * Get current user ID
 */
export const getUserId = (): string => {
  return generateUserId();
};

/**
 * Clear user session (for testing/reset)
 */
export const clearUserSession = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('msq_survey_user_id');
  }
};

/**
 * Error handler helper
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      return `Server Error: ${axiosError.response.status} - ${axiosError.response.statusText}`;
    } else if (axiosError.request) {
      return 'No response from server. Please check your internet connection.';
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
};

