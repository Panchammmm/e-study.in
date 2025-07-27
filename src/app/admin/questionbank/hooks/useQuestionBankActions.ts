import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useQuestionActions, useQuestionFilters } from '@/store';
import { Question } from '@/constants/types';
import { DEFAULT_NEW_QUESTION, SEARCH_DEBOUNCE_DELAY, TOAST_MESSAGES } from '../constants';
import { validateQuestion, parseErrorMessage } from '../utils';
import { QuestionFormState } from '../types';

/**
 * Hook for managing question bank actions and form state
 */
export const useQuestionBankActions = () => {
  const { createQuestion, updateQuestion, deleteQuestion, setFilters } = useQuestionActions();
  const { filters } = useQuestionFilters();

  // Form state
  const [newQuestion, setNewQuestion] = useState<QuestionFormState>(DEFAULT_NEW_QUESTION);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // UI state
  const [searchText, setSearchText] = useState(filters.search || '');
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  // Debounced search effect
  useEffect(() => {
    if (searchText !== filters.search) {
      setIsSearching(true);
    }

    const timeout = setTimeout(async () => {
      try {
        await setFilters({ search: searchText.trim() });
      } catch (error) {
        console.error('Filter error:', error);
      } finally {
        setIsSearching(false);
      }
    }, SEARCH_DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timeout);
      setIsSearching(false);
    };
  }, [searchText, setFilters, filters.search]);

  // Sync local search text with store filter
  useEffect(() => {
    setSearchText(filters.search || '');
  }, [filters.search]);

  /**
   * Handle search input change
   */
  const handleSearchChange = (value: string) => {
    console.log('Search change:', value);
    setSearchText(value);
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = async (key: string, value: string) => {
    console.log('Filter change:', { key, value, currentFilters: filters });
    const newFilters = { ...filters, [key]: value };
    console.log('New filters:', newFilters);

    try {
      await setFilters(newFilters);
    } catch (error) {
      console.error('Filter change error:', error);
    }
  };

  /**
   * Handle adding a new question
   */
  const handleAddQuestion = async (): Promise<boolean> => {
    try {
      setIsCreating(true);
      setOperationError(null);

      // Validate the question
      const validation = validateQuestion({
        content: newQuestion.content,
        options: newQuestion.options,
        correctOption: newQuestion.correctOption,
        subject: newQuestion.subject,
        topic: newQuestion.topic,
      });

      if (!validation.isValid) {
        validation.errors.forEach(error => {
          toast({
            title: 'Validation Error',
            description: error,
            variant: 'destructive'
          });
        });
        return false;
      }

      await createQuestion(newQuestion);

      toast({
        title: 'Success',
        description: TOAST_MESSAGES.SUCCESS.QUESTION_ADDED
      });

      // Reset form
      setNewQuestion(DEFAULT_NEW_QUESTION);
      return true;
    } catch (error: unknown) {
      console.error('Failed to add question:', error);
      
      const { type, title, message } = parseErrorMessage(error);
      setOperationError(type);

      toast({
        title,
        description: message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Handle editing a question
   */
  const handleEditQuestion = async (question: Question): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setOperationError(null);

      // Validate the question
      const validation = validateQuestion({
        content: question.content,
        options: question.options,
        correctOption: question.correctOption,
        subject: question.subject,
        topic: question.topic,
      });

      if (!validation.isValid) {
        validation.errors.forEach(error => {
          toast({
            title: 'Validation Error',
            description: error,
            variant: 'destructive'
          });
        });
        return false;
      }

      await updateQuestion(question.id, question);

      toast({
        title: 'Success',
        description: TOAST_MESSAGES.SUCCESS.QUESTION_UPDATED
      });

      setEditingQuestion(null);
      return true;
    } catch (error: unknown) {
      console.error('Failed to update question:', error);
      
      const { title, message } = parseErrorMessage(error);

      toast({
        title,
        description: message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handle deleting a question
   */
  const handleDeleteQuestion = async (questionId: string): Promise<boolean> => {
    try {
      await deleteQuestion(questionId);

      toast({
        title: 'Success',
        description: TOAST_MESSAGES.SUCCESS.QUESTION_DELETED
      });
      return true;
    } catch (error: unknown) {
      console.error('Failed to delete question:', error);
      
      const { title, message } = parseErrorMessage(error);

      toast({
        title,
        description: message,
        variant: 'destructive'
      });
      return false;
    }
  };

  /**
   * Handle duplicating a question
   */
  const handleDuplicateQuestion = async (questionId: string): Promise<boolean> => {
    try {
      // For now, we'll need to implement duplicate functionality in the store
      // This is a placeholder implementation
      console.log('Duplicate question:', questionId);
      
      toast({
        title: 'Info',
        description: 'Duplicate functionality will be available soon',
      });
      return true;
    } catch (error: unknown) {
      console.error('Failed to duplicate question:', error);
      
      const { title, message } = parseErrorMessage(error);

      toast({
        title,
        description: message,
        variant: 'destructive'
      });
      return false;
    }
  };

  /**
   * Handle tag filtering
   */
  const handleTagFilter = (tag: string) => {
    // Note: tag filtering might need to be implemented in the store filters
    console.log('Tag filter:', tag);
    toast({
      title: 'Info',
      description: 'Tag filtering will be available soon',
    });
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setFilters({
      subject: 'all',
      difficulty: 'all', 
      topic: 'all',
      search: ''
    });
    setSearchText('');
  };

  return {
    // Form state
    newQuestion,
    setNewQuestion,
    editingQuestion,
    setEditingQuestion,

    // UI state
    searchText,
    isSearching,
    isCreating,
    isUpdating,
    operationError,

    // Actions (individual)
    handleSearchChange,
    handleFilterChange,
    handleAddQuestion,
    handleEditQuestion,
    handleDeleteQuestion,
    handleDuplicateQuestion,
    handleTagFilter,
    clearFilters,
    clearOperationError: () => setOperationError(null),
    handleBulkUpload: async () => {
      // TODO: Implement bulk upload
      console.log('Bulk upload not implemented yet');
    },

    // Actions (grouped for convenience)
    handlers: {
      handleSearchChange,
      handleFilterChange,
      handleAddQuestion,
      handleEditQuestion,
      handleDeleteQuestion,
      handleDuplicateQuestion,
      handleTagFilter,
      clearFilters,
      clearOperationError: () => setOperationError(null),
      handleBulkUpload: async () => {
        // TODO: Implement bulk upload
        console.log('Bulk upload not implemented yet');
      },
    }
  };
};
