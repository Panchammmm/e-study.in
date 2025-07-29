import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Exam } from "@/constants/types";
import { 
  ExamTimerState, 
  ExamNavigationState, 
  ExamUIState 
} from "../types";

interface UseExamActionsProps {
  exam: Exam | null;
  navigationState: ExamNavigationState;
  uiState: ExamUIState;
  setTimerState: React.Dispatch<React.SetStateAction<ExamTimerState>>;
  setNavigationState: React.Dispatch<React.SetStateAction<ExamNavigationState>>;
  setUiState: React.Dispatch<React.SetStateAction<ExamUIState>>;
  updateQuestionTimeSpent: () => void;
  handleSubmitExam: () => void;
  examPassword?: string;
}

export const useExamActions = ({
  exam,
  navigationState,
  uiState,
  setTimerState,
  setNavigationState,
  setUiState,
  updateQuestionTimeSpent,
  handleSubmitExam,
  examPassword,
}: UseExamActionsProps) => {

  const handlePasswordSubmit = useCallback(() => {
    if (uiState.password === examPassword) {
      setUiState(prev => ({ 
        ...prev, 
        showPasswordModal: false, 
        password: "", 
        passwordError: "" 
      }));
      
      const now = new Date();
      setTimerState(prev => ({
        ...prev,
        examStarted: true,
        startTime: now,
        questionStartTime: now,
      }));
    } else {
      setUiState(prev => ({ 
        ...prev, 
        passwordError: "Incorrect password. Please try again." 
      }));
    }
  }, [uiState.password, examPassword, setUiState, setTimerState]);

  const handleAnswerChange = useCallback((questionId: string, answerIndex: number) => {
    setNavigationState(prev => {
      // Handle clearing answer (answerIndex -1 means clear)
      if (answerIndex === -1) {
        const newAnswers = { ...prev.answers };
        delete newAnswers[questionId];
        
        return {
          ...prev,
          answers: newAnswers,
          questionStatuses: {
            ...prev.questionStatuses,
            [questionId]: {
              ...prev.questionStatuses[questionId],
              status: "NOT_ANSWERED",
              answer: undefined,
            },
          },
        };
      }

      // Handle normal answer selection
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: answerIndex,
        },
        questionStatuses: {
          ...prev.questionStatuses,
          [questionId]: {
            ...prev.questionStatuses[questionId],
            status: "ANSWERED",
            answer: answerIndex,
          },
        },
      };
    });
  }, [setNavigationState]);

  const handleMarkForReview = useCallback((questionId: string) => {
    setNavigationState(prev => {
      const currentStatus = prev.questionStatuses[questionId]?.status;
      const isCurrentlyMarked = currentStatus === "MARKED_FOR_REVIEW";
      
      // If already marked for review, remove the mark (set to answered if has answer, otherwise unanswered)
      const hasAnswer = prev.answers[questionId] !== undefined;
      const newStatus = isCurrentlyMarked 
        ? (hasAnswer ? "ANSWERED" : "NOT_ANSWERED")
        : "MARKED_FOR_REVIEW";

      return {
        ...prev,
        questionStatuses: {
          ...prev.questionStatuses,
          [questionId]: {
            ...prev.questionStatuses[questionId],
            status: newStatus,
          },
        },
      };
    });

    // Update toast message based on action
    const currentStatus = navigationState.questionStatuses[questionId]?.status;
    const isCurrentlyMarked = currentStatus === "MARKED_FOR_REVIEW";
    
    toast({
      title: isCurrentlyMarked ? "Review Removed" : "Marked for Review",
      description: isCurrentlyMarked 
        ? "Question review mark removed" 
        : "Question marked for later review",
    });
  }, [setNavigationState, navigationState.questionStatuses]);

  const handleTakeBreak = useCallback(() => {
    updateQuestionTimeSpent();
    setUiState(prev => ({ 
      ...prev, 
      isOnBreak: true, 
      showBreakModal: true 
    }));
  }, [updateQuestionTimeSpent, setUiState]);

  const handleResumeExam = useCallback(() => {
    setUiState(prev => ({ 
      ...prev, 
      isOnBreak: false, 
      showBreakModal: false 
    }));
    
    setTimerState(prev => ({
      ...prev,
      questionStartTime: new Date(),
    }));
    
    toast({
      title: "Break Ended",
      description: "Exam resumed successfully",
    });
  }, [setUiState, setTimerState]);

  const handleSectionChange = useCallback((sectionIndex: number) => {
    updateQuestionTimeSpent();
    setNavigationState(prev => ({
      ...prev,
      currentSectionIndex: sectionIndex,
      currentQuestionIndex: 0,
    }));
  }, [updateQuestionTimeSpent, setNavigationState]);

  const handleQuestionNavigation = useCallback((questionIndex: number) => {
    updateQuestionTimeSpent();
    setNavigationState(prev => ({
      ...prev,
      currentQuestionIndex: questionIndex,
    }));
  }, [updateQuestionTimeSpent, setNavigationState]);

  const handleQuestionSelect = useCallback((sectionIndex: number, questionIndex: number) => {
    updateQuestionTimeSpent();
    setNavigationState(prev => ({
      ...prev,
      currentSectionIndex: sectionIndex,
      currentQuestionIndex: questionIndex,
    }));
  }, [updateQuestionTimeSpent, setNavigationState]);

  const handleSectionSelect = useCallback((sectionIndex: number) => {
    updateQuestionTimeSpent();
    setNavigationState(prev => ({
      ...prev,
      currentSectionIndex: sectionIndex,
      currentQuestionIndex: 0, // Reset to first question of the section
    }));
  }, [updateQuestionTimeSpent, setNavigationState]);

  const handleNextQuestion = useCallback(() => {
    if (!exam) return;

    // Check if we have sections
    if (exam.sections && exam.sections.length > 0) {
      const currentSection = exam.sections[navigationState.currentSectionIndex];
      if (currentSection && currentSection.questions) {
        // If not at last question in section, go to next question
        if (navigationState.currentQuestionIndex < currentSection.questions.length - 1) {
          handleQuestionNavigation(navigationState.currentQuestionIndex + 1);
        }
        // If at last question in section, go to next section
        else if (navigationState.currentSectionIndex < exam.sections.length - 1) {
          handleSectionChange(navigationState.currentSectionIndex + 1);
        }
      }
    } 
    // Handle direct questions (no sections)
    else if (exam.questions) {
      if (navigationState.currentQuestionIndex < exam.questions.length - 1) {
        handleQuestionNavigation(navigationState.currentQuestionIndex + 1);
      }
    }
  }, [exam, navigationState.currentSectionIndex, navigationState.currentQuestionIndex, handleQuestionNavigation, handleSectionChange]);

  const handlePrevQuestion = useCallback(() => {
    if (!exam) return;

    // If not at first question, go to previous question
    if (navigationState.currentQuestionIndex > 0) {
      handleQuestionNavigation(navigationState.currentQuestionIndex - 1);
    }
    // If at first question but not first section, go to last question of previous section
    else if (navigationState.currentSectionIndex > 0 && exam.sections) {
      const prevSection = exam.sections[navigationState.currentSectionIndex - 1];
      if (prevSection && prevSection.questions) {
        setNavigationState(prev => ({
          ...prev,
          currentSectionIndex: navigationState.currentSectionIndex - 1,
          currentQuestionIndex: prevSection.questions!.length - 1,
        }));
      }
    }
  }, [exam, navigationState.currentSectionIndex, navigationState.currentQuestionIndex, handleQuestionNavigation, setNavigationState]);

  return {
    handlePasswordSubmit,
    handleAnswerChange,
    handleMarkForReview,
    handleTakeBreak,
    handleResumeExam,
    handleSectionChange,
    handleQuestionNavigation,
    handleQuestionSelect,
    handleSectionSelect,
    handleNextQuestion,
    handlePrevQuestion,
    handleSubmitExam,
  };
};
