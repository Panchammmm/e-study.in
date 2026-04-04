import { Exam, Submission, StudentRanking, User } from "@/constants/types";

// Enhanced DashboardStats interface
export interface DashboardStats {
  totalExams: number;
  averageScore: number;
  totalQuestions: number;
  correctAnswers: number;
  highestScore: number;
  totalExamsAttended: number;
  totalStudents: number;
  recentSubmissions?: Submission[];
}

// Main dashboard data structure
export interface DashboardData {
  exams: Exam[];
  userSubmissions: Submission[];
  userRanking: StudentRanking | null;
  loading: boolean;
  userStats: DashboardStats;
  availableExams: Exam[];
  completedExams: Exam[];
  user: User | null;
}

// Component Props Interfaces
export interface DashboardHeaderProps {
  userName?: string;
  onRankingsClick: () => void;
}

export interface WelcomeSectionProps {
  userName?: string;
}

export interface StatsCardsProps {
  stats: DashboardStats;
  userRanking: StudentRanking | null;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  colorScheme: 'blue' | 'green' | 'purple' | 'orange';
}

export interface ProfilePerformanceProps {
  userName?: string;
  userEmail?: string;
  stats: DashboardStats;
  userRanking: StudentRanking | null;
}

export interface RecentActivityProps {
  recentSubmissions: Submission[];
  exams: Exam[];
}

// Updated ExamsSection props to use DashboardStats (which includes recentSubmissions)
export interface ExamsSectionProps {
  availableExams: Exam[];
  completedExams: Exam[];
  userStats: DashboardStats; // This already contains recentSubmissions
  onStartExam: (id: string, password?: string) => void;
  onViewResults: (examId: string) => void;
}

// Enhanced ExamCard props interface
export interface ExamCardProps {
  exam: Exam;
  submission?: Submission;
  isCompleted: boolean;
  onStartExam: (id: string, password?: string) => void;
  onViewResults: (examId: string) => void;
}

// Enhanced NoExamsMessage props
export interface NoExamsMessageProps {
  type: 'available' | 'completed' | 'none' | 'loading' | 'error';
}

export interface LoadingSpinnerProps {
  message?: string;
}

// Additional types for enhanced ExamCard component
export interface StatMetricProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "primary" | "success" | "warning";
}

export interface ScoreVisualizationProps {
  percentage: number;
  score: number;
  totalMarks: number;
}

export interface StatusBadgeProps {
  isCompleted: boolean;
  isPasswordProtected: boolean;
}

export interface ExamListProps {
  title: string;
  exams: Exam[];
  submissionsMap?: Map<string, Submission>;
  isCompleted: boolean;
  onStartExam: (id: string, password?: string) => void;
  onViewResults: (id: string) => void;
}

// Grade system for score visualization
export interface GradeInfo {
  grade: string;
  gradeColor: string;
  gradeDescription: string;
}

// Enhanced type definitions
export type ExamStatus = 'available' | 'completed' | 'in-progress' | 'locked' | 'expired';
export type StatType = 'exams' | 'score' | 'rank' | 'students' | 'questions' | 'accuracy';
export type ExamCardVariant = 'completed' | 'secured' | 'available';
export type StatMetricVariant = 'default' | 'primary' | 'success' | 'warning';

// Utility type for the enhanced submission lookup map
export type SubmissionMap = Map<string, Submission>;

// Color scheme types for consistent theming
export type ColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'emerald' | 'indigo' | 'amber' | 'slate';

// Performance tracking for exam metrics
export interface ExamMetrics {
  timeSpent?: number;
  accuracy: number;
  rank?: number;
  percentile?: number;
}

// Enhanced submission interface for better tracking (if you want to extend the base Submission)
export interface EnhancedSubmission extends Submission {
  metrics?: ExamMetrics;
  feedback?: string;
  reviewedAt?: string | Date;
}


