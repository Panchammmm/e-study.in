import { CreateQuestionRequest } from '@/constants/types';

// Default form state for new questions
export const DEFAULT_NEW_QUESTION: CreateQuestionRequest = {
  // Legacy fields
  content: '',
  questionImage: '',

  // 3-Layer system defaults
  layer1Type: 'none',
  layer1Text: '',
  layer1Image: '',
  layer2Type: 'none',
  layer2Text: '',
  layer2Image: '',
  layer3Type: 'none',
  layer3Text: '',
  layer3Image: '',

  // Options defaults
  options: ['', '', '', ''],
  optionImages: ['', '', '', ''],
  optionTypes: ['text', 'text', 'text', 'text'],
  correctOption: 0,

  // Marking system defaults
  positiveMarks: 1,
  negativeMarks: 1,

  // Explanation system defaults
  explanationType: 'none',
  explanationText: '',
  explanationImage: '',

  // Other defaults
  difficulty: 'EASY',
  subject: '',
  topic: '',
  tags: [],
};

// Search debounce delay in milliseconds
export const SEARCH_DEBOUNCE_DELAY = 400;

// View modes
export const VIEW_MODES = {
  GRID: 'grid' as const,
  LIST: 'list' as const,
};

// Error types for better error handling
export const ERROR_TYPES = {
  INSUFFICIENT_PERMISSIONS: 'insufficient_permissions',
  AUTHENTICATION_REQUIRED: 'authentication_required',
  VALIDATION_ERROR: 'validation_error',
  NETWORK_ERROR: 'network_error',
  UNKNOWN_ERROR: 'unknown_error',
} as const;

// Toast messages
export const TOAST_MESSAGES = {
  SUCCESS: {
    QUESTION_ADDED: 'Question added successfully',
    QUESTION_UPDATED: 'Question updated successfully',
    QUESTION_DELETED: 'Question deleted successfully',
    QUESTION_DUPLICATED: 'Question duplicated successfully',
  },
  ERROR: {
    PERMISSION_DENIED: 'You do not have permission to perform this action. Please contact your administrator.',
    AUTHENTICATION_REQUIRED: 'Your session has expired. Please log in again.',
    VALIDATION_ERROR: 'Please check that all required fields are filled correctly.',
    CONTENT_REQUIRED: 'Question content is required',
    SUBJECT_REQUIRED: 'Subject is required',
    TOPIC_REQUIRED: 'Topic is required',
    OPTIONS_REQUIRED: 'At least 2 options are required',
    CORRECT_OPTION_REQUIRED: 'Please select the correct option',
    CREATE_FAILED: 'Failed to create question',
    UPDATE_FAILED: 'Failed to update question',
    DELETE_FAILED: 'Failed to delete question',
    DUPLICATE_FAILED: 'Failed to duplicate question',
    LOAD_FAILED: 'Failed to load questions',
  },
} as const;

// Validation rules
export const VALIDATION_RULES = {
  MIN_OPTIONS: 2,
  MAX_OPTIONS: 6,
  MIN_CONTENT_LENGTH: 10,
  MAX_CONTENT_LENGTH: 2000,
  MAX_OPTION_LENGTH: 500,
  MAX_TAGS: 10,
} as const;

// Question difficulties with colors
export const DIFFICULTY_CONFIG = {
  EASY: { color: 'bg-green-100 text-green-800', label: 'Easy' },
  MEDIUM: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
  HARD: { color: 'bg-red-100 text-red-800', label: 'Hard' },
} as const;

// Subject colors (can be extended)
export const SUBJECT_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-purple-100 text-purple-800',
  'bg-indigo-100 text-indigo-800',
  'bg-pink-100 text-pink-800',
  'bg-cyan-100 text-cyan-800',
  'bg-teal-100 text-teal-800',
  'bg-emerald-100 text-emerald-800',
  'bg-lime-100 text-lime-800',
  'bg-orange-100 text-orange-800',
] as const;
