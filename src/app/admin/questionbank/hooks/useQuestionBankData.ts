import { useEffect, useMemo } from 'react';
import {
  useQuestions,
  useFilteredQuestions,
  useQuestionsLoading,
  useQuestionsError,
  useQuestionActions,
  useQuestionFilters,
  useStoreInitialization
} from '@/store';

/**
 * Hook for managing question bank data and filters
 */
export const useQuestionBankData = () => {
  // Initialize stores
  useStoreInitialization();

  // Store hooks
  const questions = useQuestions();
  const filteredQuestions = useFilteredQuestions();
  const isLoading = useQuestionsLoading();
  const error = useQuestionsError();
  const { fetchQuestions, setFilters, resetFilters } = useQuestionActions();
  const { filters } = useQuestionFilters();

  // Derived data
  const subjects = useMemo(() => 
    [...new Set(questions.map(q => q.subject))], [questions]
  );
  
  const topics = useMemo(() => 
    [...new Set(questions.map(q => q.topic))], [questions]
  );
  
  const allTags = useMemo(() => 
    [...new Set(questions.flatMap(q => q.tags))], [questions]
  );

  // Debug logging
  useEffect(() => {
    console.log('QuestionBank Data Debug:', {
      questionsLength: questions.length,
      filteredQuestionsLength: filteredQuestions.length,
      isLoading,
      error,
      filters,
      strategy: questions.length === 0 ? 'NETWORK_FETCH' : 'LOCAL_FILTER',
      questions: questions.slice(0, 2),
    });
  }, [questions, filteredQuestions, isLoading, error, filters]);

  // Initial data load
  useEffect(() => {
    console.log('Component mounted, triggering fetchQuestions...');
    fetchQuestions().then(() => {
      console.log('fetchQuestions completed');
    }).catch(err => {
      console.error('fetchQuestions failed:', err);
    });
  }, [fetchQuestions]);

  return {
    // Data
    questions,
    filteredQuestions,
    subjects,
    topics,
    allTags,
    
    // State
    isLoading,
    error,
    filters,
    
    // Actions
    fetchQuestions,
    refreshQuestions: fetchQuestions, // Alias for refresh functionality
    setFilters,
    resetFilters,
  };
};
