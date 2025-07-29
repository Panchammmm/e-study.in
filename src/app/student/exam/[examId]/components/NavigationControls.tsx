import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Bookmark, Flag } from "lucide-react";
import { NavigationControlsProps } from "../types";

const NavigationControls: React.FC<NavigationControlsProps> = ({
  isFirstQuestion,
  isLastQuestion,
  onPrevQuestion,
  onNextQuestion,
  onMarkForReview,
  onSubmitExam,
  currentQuestion,
  questionStatuses,
}) => {
  // Check if current question is marked for review
  const isMarkedForReview = currentQuestion 
    ? questionStatuses[currentQuestion.id]?.status === "MARKED_FOR_REVIEW"
    : false;

  return (
    <div className="flex justify-between items-center p-4 bg-white border rounded-lg shadow-sm">
      <div className="flex space-x-2">
        <Button
          variant="outline"
          className='cursor-pointer'
          onClick={onPrevQuestion}
          disabled={isFirstQuestion}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          variant="outline"
          className={`cursor-pointer ${isMarkedForReview ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : ''}`}
          onClick={() =>
            currentQuestion && onMarkForReview(currentQuestion.id)
          }
        >
          <Bookmark className={`h-4 w-4 mr-2 ${isMarkedForReview ? 'fill-current text-yellow-500' : ''}`} />
          {isMarkedForReview ? 'Remove Review' : 'Mark for Review'}
        </Button>
      </div>

      <div className="flex space-x-2">
        {isLastQuestion ? (
          <Button
            className='cursor-pointer bg-green-600 hover:bg-green-700 text-white'
            onClick={onSubmitExam}
          >
            <Flag className="h-4 w-4 mr-2" />
            Submit Exam
          </Button>
        ) : (
          <Button
            className='cursor-pointer bg-blue-600 hover:bg-blue-700 text-white'
            onClick={onNextQuestion}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default NavigationControls;
