import { Question } from '@/constants/types';
import { DIFFICULTY_CONFIG, SUBJECT_COLORS, VALIDATION_RULES } from '../constants';

/**
 * Get color class for question difficulty
 */
export const getDifficultyColor = (difficulty: string): string => {
  return DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG]?.color || 'bg-gray-100 text-gray-800';
};

/**
 * Get color class for subject based on hash
 */
export const getSubjectColor = (subject: string): string => {
  const hash = subject.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const index = hash % SUBJECT_COLORS.length;
  return SUBJECT_COLORS[index];
};

/**
 * Format question content preview (truncate if too long)
 */
export const formatQuestionPreview = (content: string, maxLength: number = 100): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
};

/**
 * Validate question form data
 */
export const validateQuestion = (question: {
  content: string;
  options: string[];
  correctOption: number;
  subject: string;
  topic: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Content validation
  if (!question.content.trim()) {
    errors.push('Question content is required');
  } else if (question.content.trim().length < VALIDATION_RULES.MIN_CONTENT_LENGTH) {
    errors.push(`Question content must be at least ${VALIDATION_RULES.MIN_CONTENT_LENGTH} characters`);
  } else if (question.content.length > VALIDATION_RULES.MAX_CONTENT_LENGTH) {
    errors.push(`Question content must not exceed ${VALIDATION_RULES.MAX_CONTENT_LENGTH} characters`);
  }

  // Subject validation
  if (!question.subject.trim()) {
    errors.push('Subject is required');
  }

  // Topic validation
  if (!question.topic.trim()) {
    errors.push('Topic is required');
  }

  // Options validation
  const validOptions = question.options.filter(opt => opt.trim().length > 0);
  if (validOptions.length < VALIDATION_RULES.MIN_OPTIONS) {
    errors.push(`At least ${VALIDATION_RULES.MIN_OPTIONS} options are required`);
  }

  // Check if any option exceeds max length
  const longOptions = question.options.filter(opt => opt.length > VALIDATION_RULES.MAX_OPTION_LENGTH);
  if (longOptions.length > 0) {
    errors.push(`Options must not exceed ${VALIDATION_RULES.MAX_OPTION_LENGTH} characters`);
  }

  // Correct option validation
  if (question.correctOption < 0 || question.correctOption >= validOptions.length) {
    errors.push('Please select a valid correct option');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Format tags for display
 */
export const formatTags = (tags: string[]): string[] => {
  return tags
    .filter(tag => tag.trim().length > 0)
    .map(tag => tag.trim().toLowerCase())
    .slice(0, VALIDATION_RULES.MAX_TAGS);
};

/**
 * Parse error message to determine error type and user-friendly message
 */
export const parseErrorMessage = (error: unknown): { type: string; message: string; title: string } => {
  const errorMsg = error instanceof Error ? error.message :
    (error && typeof error === 'object' && 'message' in error) ?
      String((error as { message: unknown }).message) :
      'Unknown error';

  if (errorMsg.includes('permission') || errorMsg.includes('403')) {
    return {
      type: 'insufficient_permissions',
      title: 'Permission Denied',
      message: 'You do not have permission to perform this action. Please contact your administrator to get ADMIN or MODERATOR access.'
    };
  } else if (errorMsg.includes('401') || errorMsg.includes('Authentication')) {
    return {
      type: 'authentication_required',
      title: 'Authentication Required',
      message: 'Your session has expired. Please log in again.'
    };
  } else if (errorMsg.includes('validation') || errorMsg.includes('400')) {
    return {
      type: 'validation_error',
      title: 'Validation Error',
      message: 'Please check that all required fields are filled correctly.'
    };
  } else {
    return {
      type: 'unknown_error',
      title: 'Error',
      message: errorMsg || 'An unexpected error occurred.'
    };
  }
};

/**
 * Generate unique key for question list rendering
 */
export const generateQuestionKey = (question: Question, index: number): string => {
  return `${question.id}-${question.updatedAt || question.createdAt}-${index}`;
};

/**
 * Sort questions by various criteria
 */
export const sortQuestions = (
  questions: Question[], 
  sortBy: 'date' | 'difficulty' | 'subject' | 'topic',
  sortOrder: 'asc' | 'desc' = 'desc'
): Question[] => {
  return [...questions].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'date':
        comparison = new Date(a.updatedAt || a.createdAt).getTime() - 
                    new Date(b.updatedAt || b.createdAt).getTime();
        break;
      case 'difficulty':
        const difficultyOrder = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3 };
        comparison = (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0) - 
                    (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0);
        break;
      case 'subject':
        comparison = a.subject.localeCompare(b.subject);
        break;
      case 'topic':
        comparison = a.topic.localeCompare(b.topic);
        break;
      default:
        comparison = 0;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

/**
 * Check if question has images
 */
export const hasQuestionImages = (question: Question): boolean => {
  return !!(
    question.questionImage ||
    question.layer1Image ||
    question.layer2Image ||
    question.layer3Image ||
    question.optionImages?.some(img => img) ||
    question.explanationImage
  );
};

/**
 * Get question statistics
 */
export const getQuestionStats = (questions: Question[]) => {
  const total = questions.length;
  const byDifficulty = questions.reduce((acc, q) => {
    acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const bySubject = questions.reduce((acc, q) => {
    acc[q.subject] = (acc[q.subject] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const withImages = questions.filter(hasQuestionImages).length;

  return {
    total,
    byDifficulty,
    bySubject,
    withImages,
    withoutImages: total - withImages,
  };
};
