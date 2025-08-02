// Reuse the existing types from previous conversation
type LayerType = 'text' | 'image' | 'none';
type OptionType = 'text' | 'image';
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
type ExplanationType = 'text' | 'image' | 'none';

// New interfaces for the questions listing API
interface Author {
  id: string;
  name: string;
  email: string;
}

interface QuestionCount {
  exams: number;
  examSections: number;
}

interface Question {
  id: string;
  content: string | null;
  questionImage: string | null;
  options: string[];
  optionImages: string[];
  optionTypes: OptionType[];
  correctOption: number;
  layer1Type: LayerType;
  layer1Text: string;
  layer1Image: string;
  layer2Type: LayerType;
  layer2Text: string;
  layer2Image: string;
  layer3Type: LayerType;
  layer3Text: string;
  layer3Image: string;
  positiveMarks: number;
  negativeMarks: number;
  explanationType: ExplanationType;
  explanationText: string;
  explanationImage: string;
  difficulty: Difficulty;
  subject: string;
  topic: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: Author;
  _count: QuestionCount;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface Sorting {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface FilterMetadata {
  subjects: string[];
  topics: string[];
  difficulties: string[];
  tags: string[];
}

interface QuestionsListData {
  questions: Question[];
  pagination: Pagination;
  filters: Record<string, unknown>; // Can be more specific based on your filter structure
  sorting: Sorting;
  filterMetadata: FilterMetadata; // ✅ NEW: Complete filter options
}

export interface QuestionsListApiResponse {
  success: boolean;
  data: QuestionsListData;
}
