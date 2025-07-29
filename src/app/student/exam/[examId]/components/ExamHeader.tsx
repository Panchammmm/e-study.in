"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Coffee, ArrowLeft } from "lucide-react";
import { ExamHeaderProps } from "../types";

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

  const handleBackToDashboard = () => {
    // Show confirmation dialog if exam is in progress
    if (examStarted && timeLeft > 0) {
      const confirmLeave = window.confirm(
        "Are you sure you want to leave the exam? Your progress will be lost."
      );
      if (!confirmLeave) return;
    }
    
    router.push('/student/dashboard');
  };

  if (!exam) return null;


  return (
    <header className="bg-white shadow-md border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-gray-300"></div>
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
