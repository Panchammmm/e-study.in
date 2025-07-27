"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import { useAuth } from '@/hooks/useApiAuth';
import { useExams } from '@/hooks/useApiServices';
import { Exam } from '@/constants/types';

// Import modular components
import {
  DashboardHeader,
  WelcomeSection,
  StatisticsCards,
  ExamManagementHeader,
  ExamList,
  LoadingSpinner
} from './components';

// Import custom hooks
import {
  useDashboardData,
  useExamActions,
  useDashboardStats
} from './hooks';

// Import stores and other utilities
import { useExamStore } from '@/store/slices/examStore';
import { useUIStore } from '@/store/slices/uiStore';
import QuestionBankRefactored from '../questionbank/QuestionBankRefactored';

// Dynamic imports for heavy components
const EnhancedExamBuilder = dynamic(() => import('../exam/create/EnhancedExamBuilder'), { ssr: false });
const AddQuestionsDemo = dynamic(() => import('../exam/components/AddQuestionsDemo'), { ssr: false });

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const examsApi = useExams();
  
  // Store hooks for clearing exam data
  const clearExamForEdit = useExamStore((state) => state.clearExamForEdit);
  const clearSelectedQuestions = useUIStore((state) => state.clearSelectedQuestions);

  // Local state for UI components navigation
  const [showExamBuilder, setShowExamBuilder] = useState(false);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [showAddQuestionsDemo, setShowAddQuestionsDemo] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Custom hooks for data management
  const {
    exams,
    questions,
    users,
    adminStats,
    loading,
    examFilter,
    refreshingData,
    setExams,
    setAdminStats,
    setExamFilter,
    fetchExamsByFilter
  } = useDashboardData();

  const {
    recentlyDeletedExam,
    publishingExamId,
    deletingAllExams,
    handleTogglePublish,
    handleDeleteExam,
    handleUndoDelete,
    handleRemoveAllExams,
    handleDuplicateExam
  } = useExamActions({
    exams,
    setExams,
    adminStats,
    setAdminStats,
    examFilter,
    fetchExamsByFilter,
    examsApi
  });

  const dashboardStats = useDashboardStats({ 
    exams, 
    questions, 
    users, 
    adminStats 
  });

  // Handlers for creating new exams and accessing components
  const handleCreateExam = () => {
    setEditingExam(null);
    clearExamForEdit();
    clearSelectedQuestions();
    setShowExamBuilder(true);
  };

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setShowExamBuilder(true);
  };

  const handleBackFromExamBuilder = () => {
    setShowExamBuilder(false);
    setEditingExam(null);
  };

  const handleBackFromQuestionBank = () => {
    setShowQuestionBank(false);
  };

  const handleBackFromAddQuestionsDemo = () => {
    setShowAddQuestionsDemo(false);
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show other components based on state
  if (showExamBuilder) {
    return (
      <EnhancedExamBuilder 
        onBack={handleBackFromExamBuilder}
        editingExam={editingExam || undefined}
        availableQuestions={questions}
      />
    );
  }

  // This need to be reconsider based on the actual question bank component
  
  if (showQuestionBank) {
    return <QuestionBankRefactored onBack={handleBackFromQuestionBank} />;
  }

  if (showAddQuestionsDemo) {
    return <AddQuestionsDemo onBack={handleBackFromAddQuestionsDemo} />;
  }

  // Main dashboard render
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        onQuestionBankClick={() => setShowQuestionBank(true)}
        onRankingsClick={() => {
          import('@/hooks/use-toast').then(({ toast }) => {
            toast({
              title: 'Rankings',
              description: 'Rankings feature coming soon!',
              variant: 'destructive'
            });
          });
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection user={user} />

        <div className="space-y-6">
          <StatisticsCards dashboardStats={dashboardStats} />

          <div className="space-y-6">
            <ExamManagementHeader
              examFilter={examFilter}
              refreshingData={refreshingData}
              deletingAllExams={deletingAllExams}
              exams={exams}
              onFilterChange={(filter) => {
                setExamFilter(filter);
                fetchExamsByFilter(filter);
              }}
              onRefresh={() => fetchExamsByFilter(examFilter)}
              onShowQuestionBank={() => setShowQuestionBank(true)}
              onRemoveAllExams={handleRemoveAllExams}
              onCreateExam={handleCreateExam}
            />

            <ExamList
              exams={exams}
              examFilter={examFilter}
              refreshingData={refreshingData}
              publishingExamId={publishingExamId}
              onTogglePublish={handleTogglePublish}
              onEdit={handleEditExam}
              onDelete={handleDeleteExam}
              onDuplicate={handleDuplicateExam}
            />

            {recentlyDeletedExam && (
              <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border">
                <div className="flex items-center space-x-3">
                  <span className="text-sm">Exam &quot;{recentlyDeletedExam.name}&quot; deleted</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUndoDelete}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Undo2 className="h-4 w-4 mr-2" />
                    Undo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
