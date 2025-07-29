'use client';
import { useCallback, useState } from 'react';
import { 
  authService, 
  userService, 
  examService, 
  questionService, 
  submissionService, 
  rankingService, 
  adminService, 
  searchService, 
  uploadService 
} from '@/services';
import { 
  ApiError,
  AdminUserFilters,
  UpdateProfileRequest,
  UpdateRoleRequest,
  ExamFilters,
  CreateExamRequest,
  UpdateExamRequest,
  PublishExamRequest,
  QuestionFilters,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  SubmissionFilters,
  CreateSubmissionRequest,
  RankingFilters,
  AdminStatsFilters,
  SearchExamFilters,
  SearchQuestionFilters
} from '@/constants/types';

// Generic hook for API operations
export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const error = err as ApiError;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

// Auth hooks
export function useAuth() {
  const api = useApi();

  const login = useCallback(async (email: string, password: string) => {
    return api.execute(() => authService.login({ email, password }));
  }, [api]);

  const signup = useCallback(async (data: { name: string; email: string; password: string; phoneNumber: string }) => {
    return api.execute(() => authService.signup(data));
  }, [api]);

  const logout = useCallback(async () => {
    return api.execute(() => authService.logout());
  }, [api]);

  const getCurrentUser = useCallback(async () => {
    return api.execute(() => authService.getCurrentUser());
  }, [api]);

  return {
    ...api,
    login,
    signup,
    logout,
    getCurrentUser,
  };
}

// User hooks
export function useUsers() {
  const api = useApi();

  const getAllUsers = useCallback(async (filters?: AdminUserFilters) => {
    return api.execute(() => userService.getAllUsers(filters));
  }, [api]);

  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    return api.execute(() => userService.updateProfile(data));
  }, [api]);

  const updateUserRole = useCallback(async (userId: string, data: UpdateRoleRequest) => {
    return api.execute(() => userService.updateUserRole(userId, data));
  }, [api]);

  const deleteUser = useCallback(async (userId: string) => {
    return api.execute(() => userService.deleteUser(userId));
  }, [api]);

  return {
    ...api,
    getAllUsers,
    updateProfile,
    updateUserRole,
    deleteUser,
  };
}

// Exam hooks
export function useExams() {
  const api = useApi();

  const getAllExams = useCallback(async (filters?: ExamFilters) => {
    return api.execute(() => examService.getAllExams(filters));
  }, [api]);

  const getExamById = useCallback(async (id: string) => {
    return api.execute(() => examService.getExamById(id));
  }, [api]);

  const createExam = useCallback(async (data: CreateExamRequest) => {
    return api.execute(() => examService.createExam(data));
  }, [api]);

  const updateExam = useCallback(async (id: string, data: UpdateExamRequest) => {
    return api.execute(() => examService.updateExam(id, data));
  }, [api]);

  const deleteExam = useCallback(async (id: string) => {
    return api.execute(() => examService.deleteExam(id));
  }, [api]);

  const publishExam = useCallback(async (id: string, data: PublishExamRequest) => {
    return api.execute(() => examService.publishExam(id, data));
  }, [api]);

  const saveExamWithSections = useCallback(async (examId: string, data: {
    exam: {
      name: string;
      description?: string;
      timeLimit: number;
      isPasswordProtected?: boolean;
      password?: string;
      instructions?: string;
      isPublished?: boolean;
      isDraft?: boolean;
    };
    sections: Array<{
      id?: string;
      name: string;
      description?: string;
      timeLimit?: number;
      questions: Array<{
        questionId: string;
        order: number;
        marks: number;
      }>;
    }>;
  }) => {
    return api.execute(() => examService.saveExamWithSections(examId, data));
  }, [api]);

  const getExamForEdit = useCallback(async (examId: string) => {
    return api.execute(() => examService.getExamForEdit(examId));
  }, [api]);

  return {
    ...api,
    getAllExams,
    getExamById,
    createExam,
    updateExam,
    deleteExam,
    publishExam,
    saveExamWithSections,
    getExamForEdit,
  };
}

// Question hooks
export function useQuestions() {
  const api = useApi();

  const getAllQuestions = useCallback(async (filters?: QuestionFilters) => {
    return api.execute(() => questionService.getAllQuestions(filters));
  }, [api]);

  const getQuestionById = useCallback(async (id: string) => {
    return api.execute(() => questionService.getQuestionById(id));
  }, [api]);

  const createQuestion = useCallback(async (data: CreateQuestionRequest) => {
    return api.execute(() => questionService.createQuestion(data));
  }, [api]);

  const updateQuestion = useCallback(async (id: string, data: UpdateQuestionRequest) => {
    return api.execute(() => questionService.updateQuestion(id, data));
  }, [api]);

  const deleteQuestion = useCallback(async (id: string) => {
    return api.execute(() => questionService.deleteQuestion(id));
  }, [api]);

  return {
    ...api,
    getAllQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  };
}

// Submission hooks
export function useSubmissions() {
  const api = useApi();

  const getAllSubmissions = useCallback(async (filters?: SubmissionFilters) => {
    return api.execute(() => submissionService.getAllSubmissions(filters));
  }, [api]);

  const submitExam = useCallback(async (examId: string, data: CreateSubmissionRequest) => {
    return api.execute(() => submissionService.submitExam(examId, data));
  }, [api]);

  const getUserSubmissions = useCallback(async (userId: string, filters?: SubmissionFilters) => {
    return api.execute(() => submissionService.getUserSubmissions(userId, filters));
  }, [api]);

  return {
    ...api,
    getAllSubmissions,
    submitExam,
    getUserSubmissions,
  };
}

// Ranking hooks
export function useRankings() {
  const api = useApi();

  const getGlobalRankings = useCallback(async (filters?: RankingFilters) => {
    return api.execute(() => rankingService.getGlobalRankings(filters));
  }, [api]);

  const getExamRankings = useCallback(async (examId: string, filters?: RankingFilters) => {
    return api.execute(() => rankingService.getExamRankings(examId, filters));
  }, [api]);

  const getStudentRanking = useCallback(async (filters?: RankingFilters) => {
    return api.execute(() => rankingService.getStudentRanking(filters));
  }, [api]);

  return {
    ...api,
    getGlobalRankings,
    getExamRankings,
    getStudentRanking,
  };
}

// Admin hooks
export function useAdmin() {
  const api = useApi();

  const getDashboardStats = useCallback(async (filters?: AdminStatsFilters) => {
    return api.execute(() => adminService.getDashboardStats(filters));
  }, [api]);

  const getAnalytics = useCallback(async (filters?: AdminStatsFilters) => {
    return api.execute(() => adminService.getAnalytics(filters));
  }, [api]);

  const getOverview = useCallback(async () => {
    return api.execute(() => adminService.getOverview());
  }, [api]);

  return {
    ...api,
    getDashboardStats,
    getAnalytics,
    getOverview,
  };
}

// Search hooks
export function useSearch() {
  const api = useApi();

  const searchExams = useCallback(async (filters: SearchExamFilters) => {
    return api.execute(() => searchService.searchExams(filters));
  }, [api]);

  const searchQuestions = useCallback(async (filters: SearchQuestionFilters) => {
    return api.execute(() => searchService.searchQuestions(filters));
  }, [api]);

  const quickSearch = useCallback(async (query: string, entities?: Array<'exams' | 'questions'>) => {
    return api.execute(() => searchService.quickSearch(query, entities));
  }, [api]);

  return {
    ...api,
    searchExams,
    searchQuestions,
    quickSearch,
  };
}

// Upload hooks
export function useUpload() {
  const api = useApi();
  const [progress, setProgress] = useState(0);

  const uploadProfileImage = useCallback(async (file: File) => {
    return api.execute(() => uploadService.uploadProfileImage(file));
  }, [api]);

  const uploadQuestionImage = useCallback(async (file: File) => {
    return api.execute(() => uploadService.uploadQuestionImage(file));
  }, [api]);

  const uploadWithProgress = useCallback(async (
    file: File, 
    type: 'profile' | 'question',
    onProgress?: (progress: number) => void
  ) => {
    return api.execute(() => {
      return uploadService.uploadWithProgress(file, type, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
        setProgress(percentCompleted);
        onProgress?.(percentCompleted);
      });
    });
  }, [api]);

  return {
    ...api,
    progress,
    uploadProfileImage,
    uploadQuestionImage,
    uploadWithProgress,
  };
}

// Custom hook for managing local state with API
export function useApiState<T>(initialValue: T) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateData = useCallback((newData: T) => {
    setData(newData);
    setError(null);
  }, []);

  const updateLoading = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  const updateError = useCallback((err: ApiError | null) => {
    setError(err);
  }, []);

  const reset = useCallback(() => {
    setData(initialValue);
    setLoading(false);
    setError(null);
  }, [initialValue]);

  return {
    data,
    loading,
    error,
    updateData,
    updateLoading,
    updateError,
    reset,
  };
}
