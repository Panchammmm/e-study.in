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

  // Reset state when dialog opens
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
      <DialogContent className="w-full max-w-lg bg-white border shadow-md">

        {/* Header */}
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <BookOpen className="h-5 w-5 text-slate-500" />
            Start Exam
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Review details before starting
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="py-4 space-y-5 text-sm">

          {/* Exam Info */}
          <div>
            <h3 className="font-medium text-slate-800 mb-2">{exam.name}</h3>
            <div className="flex flex-wrap gap-4 text-slate-600">
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
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-600" />
                <h4 className="font-medium text-gray-800">Instructions</h4>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap text-sm">
                {exam.instructions}
              </p>
            </div>
          )}

          {/* Guidelines */}
          <div>
            <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Guidelines
            </h4>
            <ul className="space-y-1 text-slate-600">
              {systemInstructions.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* 🔐 Password Input */}
          {exam.isPasswordProtected && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-700 text-sm">
                <AlertTriangle className="h-4 w-4" />
                Password required
              </div>

              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter exam password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
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
        <div className="flex gap-2 border-t pt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>

          <Button className="flex-1" onClick={handleStart}>
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