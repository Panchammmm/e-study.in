'use client';

import React, { memo, useCallback, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play, Lock, HelpCircle, Star, BarChart3,
  BookOpen, Target, Clock, Calendar
} from "lucide-react";
import { ExamCardProps } from "../types";
import { formatDate } from "./ExamCards/utils/examUtils";
import StartExamDialog from "./ExamCards/StartExamDialog";
import StatusBadge from "./ExamCards/StatusBadge";

const ExamCard: React.FC<ExamCardProps> = memo(({
  exam, submission, isCompleted, onStartExam, onViewResults
}) => {
  const [showStartDialog, setShowStartDialog] = useState(false);

  // COMPUTED VALUES
  const scorePercentage = submission?.statistics?.percentage ?? 0;
  const sectionCount = exam.sections?.length ?? 1;
  const questionCount = exam.questions?.length ?? exam.questionsCount ?? 0;

  // =========================
  // EVENT HANDLERS
  // =========================

  // 🔥 UPDATED: accept password
  const handleStartExam = useCallback((password?: string) => {
    setShowStartDialog(false);
    onStartExam(exam.id, password); // ✅ pass password
  }, [onStartExam, exam.id]);

  const handleOpenStartDialog = useCallback(() => {
    setShowStartDialog(true);
  }, []);

  const handleViewResults = useCallback(() => (
    submission ? onViewResults(submission.id) : null
  ), [onViewResults, submission]);

  return (
    <Card className="w-full max-w-7xl mx-auto p-4 sm:p-6 border bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-slate-500" />
            {exam.name}
          </h2>
          {exam.description && (
            <p className="text-sm text-slate-500 mt-1">{exam.description}</p>
          )}
        </div>

        <StatusBadge
          isCompleted={isCompleted}
          isPasswordProtected={exam.isPasswordProtected}
        />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Clock className="h-4 w-4" />
          {exam.timeLimit} min
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <HelpCircle className="h-4 w-4" />
          {questionCount} questions
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Target className="h-4 w-4" />
          {exam.totalMarks} marks
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Star className="h-4 w-4" />
          {sectionCount} sections
        </div>
      </div>

      {/* Password Notice */}
      {exam.isPasswordProtected && !isCompleted && (
        <div className="border rounded-md p-3 text-sm text-amber-700 bg-amber-50 mb-5 flex items-center gap-2">
          <Lock className="h-4 w-4" />
          This exam requires a password
        </div>
      )}

      {/* Result Summary */}
      {submission && isCompleted && (
        <div className="mb-5 space-y-2">
          <div className="text-sm text-slate-700">
            Score:{" "}
            <span className="font-semibold">
              {submission.earnedMarks}/{exam.totalMarks}
            </span>{" "}
            ({scorePercentage}%)
          </div>

          {submission.completedAt && (
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Completed on {formatDate(submission.completedAt)}
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      {isCompleted ? (
        <Button
          variant="outline"
          className="w-full cursor-pointer"
          onClick={handleViewResults}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          View Results
        </Button>
      ) : (
        <Button
          className="w-full cursor-pointer"
          onClick={handleOpenStartDialog}
        >
          <Play className="h-4 w-4 mr-2" />
          Start Exam
        </Button>
      )}

      {/* Start Exam Dialog */}
      <StartExamDialog
        isOpen={showStartDialog}
        onClose={() => setShowStartDialog(false)}
        onStartExam={handleStartExam} // ✅ now receives password
        exam={exam}
      />
    </Card>
  );
});

ExamCard.displayName = "ExamCard";

export default ExamCard;