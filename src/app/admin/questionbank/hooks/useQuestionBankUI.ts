import { useState, useCallback } from 'react';
import { ViewMode } from '../types';
import { Question } from '@/constants/types';

interface UseQuestionBankUIProps {
  multiSelect: boolean;
  preSelectedQuestions: string[];
  onSelectQuestions?: (questions: Question[]) => void;
}

/**
 * Hook for managing question bank UI state and interactions
 */
export const useQuestionBankUI = ({ 
  multiSelect, 
  preSelectedQuestions,
  onSelectQuestions 
}: UseQuestionBankUIProps) => {
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set(preSelectedQuestions)
  );

  // Selection management
  const toggleSelection = useCallback((questionId: string) => {
    if (!multiSelect) return;
    
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }, [multiSelect]);
  
  const selectAll = useCallback((questionIds: string[]) => {
    setSelectedQuestions(new Set(questionIds));
  }, []);
  
  const clearSelection = useCallback(() => {
    setSelectedQuestions(new Set());
  }, []);
  
  // Use selected questions
  const useSelectedQuestions = useCallback(() => {
    if (onSelectQuestions && selectedQuestions.size > 0) {
      // Convert question IDs to question objects
      // This would need to be implemented based on available data
      onSelectQuestions([]);
    }
  }, [onSelectQuestions, selectedQuestions.size]);

  // UI handlers
  const uiHandlers = {
    // View mode
    setViewMode,
    
    // Dialog management
    openAddDialog: () => setShowAddQuestion(true),
    closeAddDialog: () => setShowAddQuestion(false),
    
    openEditDialog: (question: Question) => {
      // For now, just log. This integration with actions hook will be refined
      console.log('Opening edit dialog for:', question.id);
    },
    closeEditDialog: () => {
      // This will be handled by the actions hook
    },
    
    openBulkUploadDialog: () => setShowBulkUpload(true),
    closeBulkUploadDialog: () => setShowBulkUpload(false),
    
    // Filters
    toggleFilters: () => setShowFilters(prev => !prev),
    
    // Selection management
    toggleSelection,
    selectAll,
    clearSelection,
    useSelectedQuestions
  };

  return {
    // State
    viewMode,
    showAddQuestion,
    showFilters,
    showBulkUpload,
    selectedQuestions,
    
    // Handlers
    uiHandlers
  };
};
