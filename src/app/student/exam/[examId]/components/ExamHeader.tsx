"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Coffee } from "lucide-react";
import { ExamHeaderProps } from "../types";
import { useRouter } from "next/navigation";

const ExamHeader: React.FC<ExamHeaderProps> = ({
  exam,
  examStarted,
  timeLeft,
  isOnBreak,
  answeredCount,
  totalQuestions,
  currentSectionIndex,
  onTakeBreak,
  getTimeColor,
  formatTime,
}) => {
  const router = useRouter();
  if (!exam) return null;

  const handleBackToDashboard = () => {
    const confirmed = window.confirm("Are you sure you want to go back to the dashboard?");
    if (!confirmed) return;
    router.push("/student/dashboard");
  }


  return (
    <header className="bg-white shadow-md border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center h-16">
            <Button
            variant="ghost"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            onClick={()=> handleBackToDashboard()}
            >
            <svg
              className="h-5 w-5 mr-1"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold">Back to Dashboard</span>
            </Button>
          <div className="flex items-center flex-wrap space-x-4">
            <h1 className="text-xl font-bold text-gray-900">
              {exam.name}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {examStarted && (
              <>
                <div className={`px-4 py-2 rounded-lg font-medium border-2 flex items-center ${getTimeColor()}`}>
                  <Clock className="h-5 w-5 mr-2" />
                  {formatTime(timeLeft)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className='cursor-pointer'
                  onClick={onTakeBreak}
                  disabled={isOnBreak}
                >
                  <Coffee className="h-4 w-4 mr-2" />
                  Take Break
                </Button>
              </>
            )}
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {answeredCount}/{totalQuestions} Answered
            </Badge>
            {exam.sections && exam.sections.length > 0 && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Section {currentSectionIndex + 1} of {exam.sections.length}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ExamHeader;
