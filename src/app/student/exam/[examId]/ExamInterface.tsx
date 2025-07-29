"use client";
import React from "react";
import { 
  LoadingSpinner,
  ExamHeader,
  PasswordModal,
  BreakModal,
  SubmitDialog,
  QuestionCard,
  NavigationControls
} from './components';
import QuestionNavigator from "./components/QuestionNavigator";
import { useExamData, useExamActions, useExamTimer } from './hooks';
import { formatTime, getTimeColor, getAnsweredCount, getMarkedForReviewCount } from './utils/examHelpers';
import { ExamInterfaceProps } from './types';

const ExamInterface: React.FC<ExamInterfaceProps> = ({ examId }) => {
  // Main exam data hook
  const {
    timerState,
    navigationState,
    uiState,
    examData,
    setTimerState,
    setNavigationState,
    setUiState,
    updateQuestionTimeSpent,
    handleSubmitExam,
  } = useExamData(examId);

  // Exam actions hook
  const examActions = useExamActions({
    exam: examData.exam,
    navigationState,
    uiState,
    setTimerState,
    setNavigationState,
    setUiState,
    updateQuestionTimeSpent,
    handleSubmitExam,
    examPassword: examData.exam?.password,
  });

  // Timer hook
  useExamTimer({
    exam: examData.exam,
    timerState,
    setTimerState,
    handleSubmitExam,
  });

  // Helper functions
  const getTimeColorForState = () => getTimeColor(timerState.timeLeft);
  const formatTimeForState = (seconds: number) => formatTime(seconds);
  
  const getAnsweredCountForState = () => getAnsweredCount(navigationState.questionStatuses);
  const getMarkedForReviewCountForState = () => getMarkedForReviewCount(navigationState.questionStatuses);

  // Loading state
  if (uiState.loading) {
    return <LoadingSpinner message="Loading exam..." />;
  }

  // Exam not found
  if (!examData.exam) {
    return <LoadingSpinner message="Exam not found" />;
  }

  const currentQuestion = examData.currentQuestion;
  const currentSection = examData.currentSection;

  // Check if it's first/last question for navigation
  const isFirstQuestion = navigationState.currentSectionIndex === 0 && navigationState.currentQuestionIndex === 0;
  
  // Calculate if this is the last question across the entire exam
  const isLastQuestion = (() => {
    if (!examData.exam) return false;

    // Calculate global position across all questions
    let currentGlobalIndex = 0;

    // If exam has sections, calculate position across all sections
    if (examData.exam.sections && examData.exam.sections.length > 0) {
      for (let sectionIdx = 0; sectionIdx < examData.exam.sections.length; sectionIdx++) {
        const section = examData.exam.sections[sectionIdx];
        const sectionQuestionsLength = section.questions?.length || 0;
        
        if (sectionIdx < navigationState.currentSectionIndex) {
          // Add all questions from previous sections
          currentGlobalIndex += sectionQuestionsLength;
        } else if (sectionIdx === navigationState.currentSectionIndex) {
          // Add current question index within current section
          currentGlobalIndex += navigationState.currentQuestionIndex;
          break;
        }
      }
      
      // Total questions across all sections
      const totalQuestions = examData.totalQuestions;
      return currentGlobalIndex === totalQuestions - 1;
    }

    // If no sections, check direct questions
    const questionsLength = examData.exam.questions?.length || 0;
    return questionsLength > 0 && navigationState.currentQuestionIndex === questionsLength - 1;
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <ExamHeader
        exam={examData.exam}
        examStarted={timerState.examStarted}
        timeLeft={timerState.timeLeft}
        isOnBreak={uiState.isOnBreak}
        answeredCount={getAnsweredCountForState()}
        totalQuestions={examData.totalQuestions}
        currentSectionIndex={navigationState.currentSectionIndex}
        onTakeBreak={examActions.handleTakeBreak}
        getTimeColor={getTimeColorForState}
        formatTime={formatTimeForState}
      />

      {/* Password Modal */}
      <PasswordModal
        isOpen={uiState.showPasswordModal}
        password={uiState.password}
        passwordError={uiState.passwordError}
        showPassword={uiState.showPassword}
        onPasswordChange={(password) => setUiState(prev => ({ ...prev, password }))}
        onTogglePasswordVisibility={() => setUiState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
        onSubmit={examActions.handlePasswordSubmit}
        onClose={() => {}} // Prevent closing without password
      />

      {/* Break Modal */}
      <BreakModal
        isOpen={uiState.showBreakModal}
        timeLeft={timerState.timeLeft}
        formatTime={formatTimeForState}
        getTimeColor={getTimeColorForState}
        onResume={examActions.handleResumeExam}
      />

      {/* Submit Dialog */}
      <SubmitDialog
        isOpen={uiState.showSubmitDialog}
        answeredCount={getAnsweredCountForState()}
        markedForReviewCount={getMarkedForReviewCountForState()}
        totalQuestions={examData.totalQuestions}
        onSubmit={() => {
          setUiState(prev => ({ ...prev, showSubmitDialog: false }));
          handleSubmitExam();
        }}
        onCancel={() => setUiState(prev => ({ ...prev, showSubmitDialog: false }))}
      />

      {/* Main Exam Content */}
      {timerState.examStarted && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Question Content */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Question Card */}
                <QuestionCard
                  question={currentQuestion}
                  currentSection={currentSection}
                  currentQuestionIndex={navigationState.currentQuestionIndex}
                  hasMultipleSections={examData.hasMultipleSections}
                  answer={navigationState.answers[currentQuestion?.id || '']}
                  questionStatus={navigationState.questionStatuses[currentQuestion?.id || '']}
                  onAnswerChange={examActions.handleAnswerChange}
                  exam={examData.exam}
                />

                {/* Navigation Controls */}
                <NavigationControls
                  currentSectionIndex={navigationState.currentSectionIndex}
                  currentQuestionIndex={navigationState.currentQuestionIndex}
                  isFirstQuestion={isFirstQuestion}
                  isLastQuestion={isLastQuestion}
                  onPrevQuestion={examActions.handlePrevQuestion}
                  onNextQuestion={examActions.handleNextQuestion}
                  onMarkForReview={examActions.handleMarkForReview}
                  onSubmitExam={() => setUiState(prev => ({ ...prev, showSubmitDialog: true }))}
                  currentQuestion={currentQuestion}
                  questionStatuses={navigationState.questionStatuses}
                />
              </div>
            </div>

            {/* Question Navigation Panel */}
            <div className="lg:col-span-1">
              <QuestionNavigator
                exam={examData.exam}
                currentQuestionIndex={navigationState.currentQuestionIndex}
                currentSectionIndex={navigationState.currentSectionIndex}
                questionStatuses={navigationState.questionStatuses}
                onQuestionSelect={examActions.handleQuestionSelect}
                hasMultipleSections={examData.hasMultipleSections}
                answeredCount={getAnsweredCountForState()}
                markedForReviewCount={getMarkedForReviewCountForState()}
                totalQuestions={examData.totalQuestions}
                timeLeft={timerState.timeLeft}
                formatTime={formatTimeForState}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamInterface;
