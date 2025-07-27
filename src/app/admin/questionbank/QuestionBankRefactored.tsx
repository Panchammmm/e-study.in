'use client';

import React from 'react';
import { QuestionBankContainer } from './containers';
import { QuestionBankProps } from './types';

/**
 * Main Question Bank component - Refactored and modularized
 * 
 * This is the new modular version of the question bank that replaces
 * the monolithic EnhancedQuestionBank.tsx component. It provides the
 * same functionality but with better organization, maintainability,
 * and extensibility.
 * 
 * Features:
 * - Modular component architecture
 * - Separation of concerns (UI, data, actions)
 * - Enhanced TypeScript support
 * - Better error handling and loading states
 * - Comprehensive search and filtering
 * - Question CRUD operations
 * - Bulk upload functionality
 * - Multi-selection support for exam integration
 */
export const QuestionBankRefactored: React.FC<QuestionBankProps> = (props) => {
  return <QuestionBankContainer {...props} />;
};

export default QuestionBankRefactored;
