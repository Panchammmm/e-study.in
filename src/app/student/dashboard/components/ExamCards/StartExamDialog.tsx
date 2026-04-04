'use client';

import React, { memo, useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Play, BookOpen, Target, Clock,
  FileText, AlertTriangle, Shield,
  CheckCircle2, Eye, EyeOff,
  User
} from "lucide-react";

interface StartExamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExam: (password?: string) => void;
  exam: {
    name: string;
    instructions?: string;
    timeLimit: number;
    totalMarks: number;
    questionsCount?: number;
    isPasswordProtected?: boolean;
  };
}

const StartExamDialog: React.FC<StartExamDialogProps> = memo(({
  isOpen,
  onClose,
  onStartExam,
  exam
}) => {

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setShowPassword(false);
    }
  }, [isOpen]);

  const systemInstructions = [
    "Ensure stable internet connection",
    "Do not refresh or close the tab",
    "Exam auto-submits when time ends",
    "Tab switching may be monitored"
  ];

  const handleStart = () => {
    onStartExam(password);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleStart();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
          w-full 
          max-w-lg 
          sm:rounded-lg 
          rounded-none
          h-[100vh] sm:h-auto
          overflow-y-auto
          bg-white border shadow-md
          p-4 sm:p-6
        "
      >

        {/* Header */}
        <DialogHeader className="border-b pb-3 sm:pb-4">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
            <BookOpen className="h-5 w-5 text-slate-500" />
            Start Exam
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500">
            Review details before starting
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="py-4 space-y-4 sm:space-y-5 text-sm">

          {/* Exam Info */}
          <div>
            <h3 className="font-medium text-slate-800 mb-2 break-words">
              {exam.name}
            </h3>

            <div className="flex flex-wrap gap-3 sm:gap-4 text-slate-600 text-xs sm:text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {exam.timeLimit} min
              </div>

              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {exam.totalMarks} marks
              </div>

              {exam.questionsCount && (
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {exam.questionsCount} questions
                </div>
              )}
            </div>
          </div>

          {/* Instructor Instructions */}
          {exam.instructions && exam.instructions.trim() && (
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-600" />
                <h4 className="font-medium text-gray-800 text-sm">
                  Instructions
                </h4>
              </div>

              <p className="text-gray-700 whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">
                {exam.instructions}
              </p>
            </div>
          )}

          {/* Guidelines */}
          <div>
            <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              Guidelines
            </h4>

            <ul className="space-y-1 text-slate-600 text-xs sm:text-sm">
              {systemInstructions.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Password */}
          {exam.isPasswordProtected && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-700 text-xs sm:text-sm">
                <AlertTriangle className="h-4 w-4" />
                Password required
              </div>

              <Label className="text-xs sm:text-sm">Password</Label>

              <div className="relative">
                <Input
                  className="pr-10"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter exam password"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 border-t pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            className="w-full"
            onClick={handleStart}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Exam
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
});

StartExamDialog.displayName = "StartExamDialog";

export default StartExamDialog;