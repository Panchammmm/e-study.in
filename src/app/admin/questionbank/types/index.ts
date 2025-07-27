import { Question, CreateQuestionRequest, UpdateQuestionRequest } from '@/constants/types';

export interface QuestionBankProps {
  onBack: () => void;
  onSelectQuestions?: (questions: Question[]) => void;
  multiSelect?: boolean;
  preSelectedQuestions?: string[];
}

export interface QuestionFormState extends CreateQuestionRequest {
  // Additional form-specific state if needed
}

export interface QuestionBankState {
  editingQuestion: Question | null;
  searchText: string;
  viewMode: 'grid' | 'list';
  showAddQuestion: boolean;
  showFilters: boolean;
  isSearching: boolean;
  isUpdating: boolean;
  isCreating: boolean;
  operationError: string | null;
}

export interface QuestionActionHandlers {
  handleAddQuestion: () => Promise<void>;
  handleEditQuestion: (question: Question) => Promise<void>;
  handleDeleteQuestion: (questionId: string) => Promise<void>;
  handleDuplicateQuestion: (questionId: string) => Promise<void>;
  handleSearchChange: (value: string) => void;
  handleFilterChange: (key: string, value: string) => Promise<void>;
  handleTagFilter: (tag: string) => void;
  clearFilters: () => void;
}

export interface QuestionFilters {
  subjects: string[];
  topics: string[];
  allTags: string[];
}

export type ViewMode = 'grid' | 'list';
export type OperationType = 'create' | 'update' | 'delete' | 'duplicate';

// Re-export types from constants for convenience
export type { Question, CreateQuestionRequest, UpdateQuestionRequest };
