"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from 'next/navigation';
import { 
  LoadingSpinner,
  ExamHeader,
  // PasswordModal,
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
  const router = useRouter();
  
  // ========================================
  // STATE MANAGEMENT - Protection states for exam security
  // ========================================
  const [isWarningActive, setIsWarningActive] = useState(false); // Controls warning dialog display
  const [examSubmitted, setExamSubmitted] = useState(false); // Prevents multiple submissions
  
  const [isFullyLoaded ,setIsFullyLoaded] = useState(false); // Tracks if all resources are loaded


  // Performance optimization refs to prevent excessive browser history manipulation
  const historyProtectionRef = useRef<boolean>(false); // Tracks if history protection is active
  const lastPopstateTimeRef = useRef<number>(0); // Throttles popstate events to prevent spam

  // ========================================
  // HOOKS - Main exam functionality
  // ========================================
  
  // Main exam data hook - manages exam state, timer, navigation, UI
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

  // Exam actions hook - handles user interactions (answer changes, navigation, etc.)
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

  // Timer hook - manages countdown timer and auto-submission when time expires
  useExamTimer({
    exam: examData.exam,
    timerState,
    setTimerState,
    handleSubmitExam,
  });

  // ========================================
  // EXAM SECURITY PROTECTION FUNCTIONS
  // ========================================

  /**
   * AUTO-SUBMIT FUNCTION
   * Handles automatic exam submission with user notification and secure redirect
   * Used for: browser navigation, page refresh, time expiry, tab switching
   */
  const autoSubmitExam = useCallback(async (reason: string) => {
    // Prevent multiple submissions or submission during loading
    if (examSubmitted || uiState.loading) return;
    
    // Mark exam as submitted to prevent further attempts
    setExamSubmitted(true);
    setIsWarningActive(false);
    
    try {
      // Call the main submission handler (this should use the correct API endpoint internally)
      await handleSubmitExam();
      
      // Show success message with reason for submission
      alert(`✅ Exam Submitted Successfully!\n\nReason: ${
        reason === 'browser_navigation' ? 'Browser navigation detected' :
        reason === 'page_refresh' ? 'Page refresh detected' :
        reason === 'time_up' ? 'Time limit reached' :
        'Navigation away from exam page'
      }\n\nYour answers have been saved.`);
      
      // 🔒 IMPORTANT: Use router.replace() instead of router.push() 
      // This prevents users from using back button to return to exam page
      router.replace('/student/dashboard');
    } catch (error) {
      console.error('Auto-submit failed:', error);
      alert('❌ Submission failed. Please try again or contact support.');
      // Reset submission state on failure to allow retry
      setExamSubmitted(false);
    }
  }, [examSubmitted, uiState.loading, handleSubmitExam, router]);

  /**
   * CONFIRMATION DIALOG
   * Shows detailed warning when user attempts to navigate away from exam
   * Includes current progress and consequences
   */
  const showConfirmationDialog = useCallback((action: string): boolean => {
    // Define user-friendly action descriptions
    const actionMessages: Record<string, string> = {
      browser_navigation: 'You are trying to navigate away from this page',
      page_refresh: 'You are trying to refresh the page',
      tab_close: 'You are trying to close the tab/browser',
    };

    // Create comprehensive warning message with current exam status
    const message = 
      '🚨 EXAM AUTO-SUBMISSION WARNING 🚨\n\n' +
      `📍 Action Detected: ${actionMessages[action] || 'Unknown action'}\n\n` +
      '⚠️ CONSEQUENCES IF YOU CONTINUE:\n' +
      '• Your exam will be automatically submitted\n' +
      '• All current answers will be saved as final\n' +
      '• You cannot return to continue the exam\n' +
      '• This action is irreversible\n\n' +
      `⏰ Time remaining: ${formatTime(timerState.timeLeft)}\n` +
      `📝 Questions answered: ${getAnsweredCount(navigationState.questionStatuses)}/${examData.totalQuestions}\n\n` +
      '🤔 What would you like to do?\n\n' +
      '✅ Click "OK" to submit exam and leave\n' +
      '❌ Click "Cancel" to stay and continue exam';

    return window.confirm(message);
  }, [timerState.timeLeft, navigationState.questionStatuses, examData.totalQuestions]);

  /**
   * BROWSER BACK/FORWARD BUTTON HANDLER
   * Prevents navigation via browser buttons with confirmation dialog
   * Includes throttling to prevent excessive popstate events
   */
  const handlePopState = useCallback(() => {
    // Skip if exam already submitted, warning active, or exam not started
    if (examSubmitted || isWarningActive || !timerState.examStarted) return;

    // THROTTLING: Prevent spam popstate events (can cause performance issues)
    const now = Date.now();
    if (now - lastPopstateTimeRef.current < 1000) { // 1 second throttle
      // Push state without showing dialog if events are too frequent
      if (!historyProtectionRef.current) {
        window.history.pushState({ examProtection: true }, '', window.location.pathname);
      }
      return;
    }
    lastPopstateTimeRef.current = now;

    // Show loading state while processing user decision
    setIsWarningActive(true);

    // Small delay to prevent UI blocking
    setTimeout(() => {
      const shouldSubmit = showConfirmationDialog('browser_navigation');
      
      if (shouldSubmit) {
        // User confirmed - submit exam and leave
        autoSubmitExam('browser_navigation');
      } else {
        // User cancelled - stay on exam page
        setIsWarningActive(false);
        // Restore browser history protection
        if (!historyProtectionRef.current) {
          window.history.pushState({ examProtection: true }, '', window.location.pathname);
        }
      }
    }, 100);
  }, [examSubmitted, isWarningActive, timerState.examStarted, showConfirmationDialog, autoSubmitExam]);

  /**
   * PAGE REFRESH/CLOSE WARNING HANDLER
   * Shows browser's native confirmation dialog when user tries to refresh or close page
   */
  // const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
  //   // Skip if exam already submitted, warning active, or exam not started
  //   if (examSubmitted || isWarningActive || !timerState.examStarted) return;

  //   // Set browser's native confirmation message
  //   const message = '⚠️ Your exam will be auto-submitted if you leave this page. Are you sure?';
  //   event.preventDefault();
  //   event.returnValue = message;
  //   return message;
  // }, [examSubmitted, isWarningActive, timerState.examStarted]);

  /**
   * PAGE UNLOAD HANDLER
   * Handles actual submission when user confirms page refresh/close
   * Uses navigator.sendBeacon for reliable submission during page unload
   */
  // const handleUnload = useCallback(() => {
  //   // Only submit if exam is active and not already submitted
  //   if (!examSubmitted && timerState.examStarted) {
  //     // Calculate time spent on exam
  //     const examTimeLimit = examData.exam?.timeLimit ? examData.exam.timeLimit * 60 : 0;
  //     const timeSpent = examTimeLimit - timerState.timeLeft;

  //     // Prepare submission data
  //     const submissionData = {
  //       examId: examData.exam?.id,
  //       answers: navigationState.answers,
  //       questionStatuses: navigationState.questionStatuses,
  //       timeSpent: timeSpent,
  //       isAutoSubmitted: true,
  //       reason: 'page_unload_confirmed',
  //       completedAt: new Date().toISOString()
  //     };

  //     // 🔥 UPDATED: Use correct API endpoint format
  //     // Changed from '/api/exam/submit' to '/api/exams/{examId}/submissions'
  //     const submissionEndpoint = `/api/exams/${examData.exam?.id}/submissions`;

  //     // Use sendBeacon for reliable submission during page unload
  //     // This works even when regular fetch() might fail during unload
  //     if (navigator.sendBeacon) {
  //       navigator.sendBeacon(submissionEndpoint, JSON.stringify(submissionData));
  //     }
  //   }
  // }, [
  //   examSubmitted, 
  //   timerState.examStarted, 
  //   timerState.timeLeft,
  //   examData.exam?.id, 
  //   examData.exam?.timeLimit,
  //   navigationState.answers, 
  //   navigationState.questionStatuses
  // ]);

  // ========================================
  // EVENT LISTENERS SETUP
  // ========================================

  /**
   * MAIN PROTECTION SETUP
   * Sets up all browser event listeners for exam security
   */
  // useEffect(() => {
  //   // Skip setup if exam not started or already submitted
  //   if (!timerState.examStarted || examSubmitted) {
  //     historyProtectionRef.current = false;
  //     return;
  //   }

  //   // Set up browser history protection (prevents back button issues)
  //   if (!historyProtectionRef.current) {
  //     window.history.pushState({ examProtection: true }, '', window.location.pathname);
  //     historyProtectionRef.current = true;
  //   }
    
  //   // Add event listeners for browser navigation protection
  //   window.addEventListener('popstate', handlePopState);        // Back/forward buttons
  //   window.addEventListener('beforeunload', handleBeforeUnload); // Page refresh/close warning
  //   window.addEventListener('unload', handleUnload);            // Actual page unload

  //   // Cleanup function - removes event listeners when component unmounts
  //   return () => {
  //     window.removeEventListener('popstate', handlePopState);
  //     window.removeEventListener('beforeunload', handleBeforeUnload);
  //     window.removeEventListener('unload', handleUnload);
  //   };
  // }, [timerState.examStarted, examSubmitted, handlePopState, handleBeforeUnload, handleUnload]);

  /**
   * TAB SWITCHING DETECTION
   * Monitors when user switches away from exam tab
   * Shows warning after 10 seconds of being away
   */
  // useEffect(() => {
  //   // Skip if exam not started or already submitted
  //   if (!timerState.examStarted || examSubmitted) return;

  //   let tabSwitchTimeout: NodeJS.Timeout;

  //   const handleVisibilityChange = () => {
  //     if (document.hidden && !isWarningActive) {
  //       console.warn('⚠️ Student switched tabs during exam');
        
  //       // Clear any existing timeout to prevent multiple warnings
  //       if (tabSwitchTimeout) {
  //         clearTimeout(tabSwitchTimeout);
  //       }
        
  //       // Set 10-second timeout for tab switching warning
  //       tabSwitchTimeout = setTimeout(() => {
  //         // Double-check conditions before showing warning
  //         if (document.hidden && !examSubmitted && !isWarningActive) {
  //           const confirmSubmit = window.confirm(
  //             '⚠️ TAB SWITCHING DETECTED\n\n' +
  //             'You have been away from the exam tab for 10 seconds.\n' +
  //             'For exam integrity, would you like to submit your exam now?\n\n' +
  //             '✅ Click "OK" to submit\n' +
  //             '❌ Click "Cancel" to continue (but stay focused on exam)'
  //           );
            
  //           if (confirmSubmit) {
  //             autoSubmitExam('tab_switching_confirmed');
  //           }
  //         }
  //       }, 10000); // 10 second delay
  //     } else if (!document.hidden && tabSwitchTimeout) {
  //       // Clear timeout when user returns to exam tab
  //       clearTimeout(tabSwitchTimeout);
  //     }
  //   };

  //   // Add visibility change listener
  //   document.addEventListener('visibilitychange', handleVisibilityChange);

  //   // Cleanup function
  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //     if (tabSwitchTimeout) {
  //       clearTimeout(tabSwitchTimeout);
  //     }
  //   };
  // }, [timerState.examStarted, examSubmitted, isWarningActive, autoSubmitExam]);

  /**
   * CLEANUP PROTECTION ON EXAM END
   * Disables history protection when exam is properly submitted
   */
  // useEffect(() => {
  //   if (examSubmitted) {
  //     historyProtectionRef.current = false;
  //   }
  // }, [examSubmitted]);


  // Changes on reload

useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (examData?.exam?.id) {
      localStorage.setItem('autoSubmitExamData', JSON.stringify({
        examId: examData.exam.id,
        reason: 'reload',
      }));
    }
    // Optional: Show confirm dialog
    e.preventDefault();
    e.returnValue = ''; // Required to show the dialog in some browsers
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [examData?.exam?.id]);


  // Automatically check for stored auto-submit data on component mount 

const AutoSubmitExam = () => {
  const stored = localStorage.getItem('autoSubmitExamData');

  if (stored) {
    try {
      const { examId, reason } = JSON.parse(stored);
      // Optional: check if this matches current exam
      if (examId === examData?.exam?.id) {
        window.alert(`Exam auto-submission detected!\n\nReason: ${reason}\n\nYour exam will be submitted now.`);
        // autoSubmitExam(reason); // Your internal function
        setUiState(prev => ({ ...prev, showSubmitDialog: true }));
        localStorage.removeItem('autoSubmitExamData');
      }
    } catch (err) {
      console.error('Error parsing auto submit data:', err);
      localStorage.removeItem('autoSubmitExamData');
    }
  }
};


useEffect(() => {
  const onLoad = () => {
    // Everything is fully loaded: DOM + images + fonts
    console.log('Fully loaded');
    setIsFullyLoaded(true);
    AutoSubmitExam()

  };

  if (document.readyState === 'complete') {
    onLoad();
  } else {
    window.addEventListener('load', onLoad);
  }

  return () => {
    window.removeEventListener('load', onLoad);
  };
}, [examData]);


  // ========================================
  // COMPONENT HELPER FUNCTIONS
  // ========================================

  // Time and color formatting functions
  const getTimeColorForState = () => getTimeColor(timerState.timeLeft);
  const formatTimeForState = (seconds: number) => formatTime(seconds);
  
  // Progress calculation functions
  const getAnsweredCountForState = () => getAnsweredCount(navigationState.questionStatuses);
  const getMarkedForReviewCountForState = () => getMarkedForReviewCount(navigationState.questionStatuses);

  // ========================================
  // EARLY RETURNS - Loading and error states
  // ========================================

  // Show loading spinner while exam data is being fetched
  if (uiState.loading) {
    return <LoadingSpinner message="Loading exam..." />;
  }

  // Show error state if exam data couldn't be loaded
  if (!examData.exam) {
    return <LoadingSpinner message="Exam not found" />;
  }

  // ========================================
  // COMPONENT DATA PREPARATION
  // ========================================

  const currentQuestion = examData.currentQuestion;
  const currentSection = examData.currentSection;

  // Navigation state calculations
  const isFirstQuestion = navigationState.currentSectionIndex === 0 && navigationState.currentQuestionIndex === 0;
  
  // Calculate if this is the last question across the entire exam
  const isLastQuestion = (() => {
    if (!examData.exam) return false;

    // Calculate global position across all questions
    let currentGlobalIndex = 0;

    // Handle exams with sections
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
      
      // Check against total questions across all sections
      const totalQuestions = examData.totalQuestions;
      return currentGlobalIndex === totalQuestions - 1;
    }

    // Handle exams without sections (direct questions)
    const questionsLength = examData.exam.questions?.length || 0;
    return questionsLength > 0 && navigationState.currentQuestionIndex === questionsLength - 1;
  })();



  // ========================================
  // MAIN COMPONENT RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 
        SECURITY WARNING BANNER
        Shows sticky warning at top when exam is active
        Informs user about auto-submission policies
      */}
      {timerState.examStarted && !examSubmitted && (
        <div className="bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 border-b border-amber-200 shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-amber-800">
                    <strong className="text-[10px] sm:text-sm">🔒 Exam Security Active</strong>
                    <span className="hidden sm:inline">: Do not navigate away, refresh, or use browser buttons. Your exam will be auto-submitted.</span>
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-sm font-medium bg-amber-100 text-amber-800">
                  Protected
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 
        LOADING OVERLAY
        Shows when user is making a decision about leaving exam
        Prevents interaction while processing confirmation
      */}
      {isWarningActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-center text-gray-600 font-medium">Processing your decision...</p>
            <p className="mt-2 text-center text-gray-500 text-sm">Please wait...</p>
          </div>
        </div>
      )}

      {/* 
        EXAM HEADER
        Contains exam title, timer, progress, and action buttons
        🔥 UPDATED: Added onSubmitExam prop for manual submission
      */}
      <ExamHeader
        exam={examData.exam}
        examStarted={timerState.examStarted}
        timeLeft={timerState.timeLeft}
        isOnBreak={uiState.isOnBreak}
        answeredCount={getAnsweredCountForState()}
        totalQuestions={examData.totalQuestions}
        currentSectionIndex={navigationState.currentSectionIndex}
        onTakeBreak={examActions.handleTakeBreak}
        onSubmitExam={() => setUiState(prev => ({ ...prev, showSubmitDialog: true }))} // Manual submission via dialog
        getTimeColor={getTimeColorForState}
        formatTime={formatTimeForState}
      />
      
      <BreakModal
        isOpen={uiState.showBreakModal}
        timeLeft={timerState.timeLeft}
        formatTime={formatTimeForState}
        getTimeColor={getTimeColorForState}
        onResume={examActions.handleResumeExam}
      />

      {/* 
        SUBMIT CONFIRMATION DIALOG
        Shows final confirmation before manual exam submission
        🔥 UPDATED: Added setExamSubmitted(true) to prevent protection conflicts
      */}
      <SubmitDialog
        isOpen={uiState.showSubmitDialog}
        answeredCount={getAnsweredCountForState()}
        markedForReviewCount={getMarkedForReviewCountForState()}
        totalQuestions={examData.totalQuestions}
        onSubmit={() => {
          setUiState(prev => ({ ...prev, showSubmitDialog: false }));
          setExamSubmitted(true); // Mark as submitted to disable protection
          handleSubmitExam(); // This should handle the correct API endpoint internally
        }}
        onCancel={() => setUiState(prev => ({ ...prev, showSubmitDialog: false }))}
      />

      {/* 
        MAIN EXAM CONTENT
        Only renders when exam has started
      */}
      {timerState.examStarted && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sm:py-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* LEFT COLUMN - Question content and navigation */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* QUESTION CARD - Shows current question */}
                {currentQuestion ? (
                  <QuestionCard
                    question={currentQuestion}
                    currentSection={currentSection ? {
                      id: currentSection.id,
                      name: currentSection.name
                    } : undefined}
                    currentQuestionIndex={navigationState.currentQuestionIndex}
                    hasMultipleSections={examData.hasMultipleSections}
                    answer={navigationState.answers[currentQuestion.id]}
                    questionStatus={navigationState.questionStatuses[currentQuestion.id]}
                    onAnswerChange={examActions.handleAnswerChange}
                    exam={examData.exam.sections ? {
                      sections: examData.exam.sections.map(section => ({
                        id: section.id,
                        name: section.name,
                        questions: section.questions || []
                      }))
                    } : undefined}
                  />
                ) : (
                  // Error state - no question available
                  <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-sm border">
                    <div className="text-center text-gray-500">
                      <p className="text-lg font-medium">No question available</p>
                      <p className="text-sm mt-2">Please check your exam configuration.</p>
                    </div>
                  </div>
                )}

                {/* NAVIGATION CONTROLS - Previous/Next buttons, mark for review, submit */}
                {currentQuestion && (
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
                )}
              </div>
            </div>

            {/* RIGHT COLUMN - Question navigator panel */}
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
