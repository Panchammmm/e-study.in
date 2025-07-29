import { Exam, Question, QuestionAnswerStatus, ExamSection } from "@/constants/types";

export interface ExamTimerState {
  timeLeft: number;
  startTime: Date | null;
  questionStartTime: Date | null;
  examStarted: boolean;
}

export interface ExamNavigationState {
  currentSectionIndex: number;
  currentQuestionIndex: number;
  answers: Record<string, number>;
  questionStatuses: Record<string, QuestionAnswerStatus>;
}

export interface ExamUIState {
  loading: boolean;
  isOnBreak: boolean;
  showPasswordModal: boolean;
  showBreakModal: boolean;
  showSubmitDialog: boolean;
  password: string;
  passwordError: string;
  showPassword: boolean;
}

export interface ExamData {
  exam: Exam | null;
  currentQuestion: Question | null;
  currentSection: ExamSection | null;
  hasMultipleSections: boolean;
  totalQuestions: number;
}

export interface ExamHeaderProps {
  exam: Exam | null;
  examStarted: boolean;
  timeLeft: number;
  isOnBreak: boolean;
  answeredCount: number;
  totalQuestions: number;
  currentSectionIndex: number;
  onTakeBreak: () => void;
  getTimeColor: () => string;
  formatTime: (seconds: number) => string;
}

export interface QuestionNavigatorProps {
  exam: Exam | null;
  currentQuestionIndex: number;
  currentSectionIndex: number;
  questionStatuses: Record<string, QuestionAnswerStatus>;
  onQuestionSelect: (sectionIndex: number, questionIndex: number) => void;
  hasMultipleSections: boolean;
  answeredCount: number;
  markedForReviewCount: number;
  totalQuestions: number;
  timeLeft: number;
  formatTime: (seconds: number) => string;
}

export interface SectionNavigationProps {
  exam: Exam | null;
  currentSectionIndex: number;
  questionStatuses: Record<string, QuestionAnswerStatus>;
  onSectionChange: (index: number) => void;
  getSectionProgress: (section: ExamSection) => number;
}

export interface QuestionCardProps {
  question: Question | null;
  currentSection: ExamSection | null;
  currentQuestionIndex: number;
  hasMultipleSections: boolean;
  answer: number | undefined;
  questionStatus: QuestionAnswerStatus | undefined;
  onAnswerChange: (questionId: string, answerIndex: number) => void;
  exam: Exam | null;
}

export interface NavigationControlsProps {
  currentSectionIndex: number;
  currentQuestionIndex: number;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  onMarkForReview: (questionId: string) => void;
  onSubmitExam: () => void;
  currentQuestion: Question | null;
  questionStatuses: Record<string, QuestionAnswerStatus>;
}

export interface QuestionNavigationPanelProps {
  exam: Exam | null;
  hasMultipleSections: boolean;
  currentSectionIndex: number;
  currentQuestionIndex: number;
  questionStatuses: Record<string, QuestionAnswerStatus>;
  onQuestionNavigation: (index: number) => void;
  onSectionChange: (sectionIndex: number) => void;
  getQuestionStatusColor: (questionId: string) => string;
  getQuestionStatusIcon: (questionId: string) => React.ReactNode;
  getAnsweredCount: () => number;
  getMarkedForReviewCount: () => number;
  totalQuestions: number;
}

export interface PasswordModalProps {
  isOpen: boolean;
  password: string;
  passwordError: string;
  showPassword: boolean;
  onPasswordChange: (password: string) => void;
  onTogglePasswordVisibility: () => void;
  onSubmit: () => void;
  onClose: () => void;
}

export interface BreakModalProps {
  isOpen: boolean;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  getTimeColor: () => string;
  onResume: () => void;
}

export interface SubmitDialogProps {
  isOpen: boolean;
  answeredCount: number;
  markedForReviewCount: number;
  totalQuestions: number;
  onSubmit: () => void;
  onCancel: () => void;
}

export interface LoadingSpinnerProps {
  message?: string;
}

export interface ExamInterfaceProps {
  examId: string;
}
