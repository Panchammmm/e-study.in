import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Bookmark, X } from "lucide-react";
import { QuestionCardProps } from "../types";
import { getTotalQuestions } from "../utils/examHelpers";

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentSection,
  currentQuestionIndex,
  hasMultipleSections,
  answer,
  questionStatus,
  onAnswerChange,
  exam, // Add exam prop to calculate total questions properly
}) => {
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  if (!question) return null;

  // Function to clear/unselect the current answer
  const handleClearAnswer = () => {
    // We need to clear the answer by setting it to undefined
    // But since our onAnswerChange expects a number, we'll need to modify the parent component
    // For now, let's create a special value to indicate clearing
    onAnswerChange(question.id, -1); // Use -1 to indicate clearing
  };

  // Calculate the global question number and total questions
  const getGlobalQuestionNumber = () => {
    if (!hasMultipleSections || !exam?.sections) {
      return currentQuestionIndex + 1;
    }
    
    // Calculate the global question number across all sections
    let globalIndex = 0;
    for (let i = 0; i < exam.sections.length; i++) {
      if (i < (exam.sections.findIndex(s => s.id === currentSection?.id))) {
        globalIndex += exam.sections[i].questions?.length || 0;
      }
    }
    return globalIndex + currentQuestionIndex + 1;
  };

  const totalQuestions = getTotalQuestions(exam);
  const globalQuestionNumber = getGlobalQuestionNumber();

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              Question {globalQuestionNumber} of {totalQuestions}
              {hasMultipleSections && currentSection && (
                <Badge variant="outline" className="ml-2">
                  {currentSection.name}
                </Badge>
              )}
              {questionStatus?.status === "MARKED_FOR_REVIEW" && (
                <Bookmark className="h-4 w-4 ml-2 text-yellow-600 fill-current" />
              )}
            </CardTitle>
            <CardDescription>
              Choose the correct answer from the options below
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {question.difficulty}
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {question.subject}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Temporary Debug Section - Remove this after fixing the image issue */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
            <p className="font-semibold text-yellow-800 mb-2">Debug Info (Dev Mode Only):</p>
            {question.questionImage && (
              <p className="text-yellow-700 break-all">
                <strong>Question Image URL:</strong> {question.questionImage}
              </p>
            )}
            {question.optionImages && question.optionImages.some(img => img) && (
              <div className="text-yellow-700">
                <strong>Option Images:</strong>
                <ul className="ml-4 mt-1">
                  {question.optionImages.map((img, idx) => img && (
                    <li key={idx} className="break-all">Option {idx + 1}: {img}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="space-y-6">
          {/* Question Text */}
          <div className="text-lg font-medium leading-relaxed">
            {question.content}
          </div>

          {/* Question Image - Simplified approach */}
          {question.questionImage && (
            <div className="flex justify-center">
              <div className="relative max-w-full max-h-96 overflow-hidden rounded-lg border shadow-sm">
                <Image
                  src={question.questionImage}
                  alt="Question illustration"
                  width={800}
                  height={400}
                  className="w-auto h-auto max-w-full max-h-96 object-contain"
                  onClick={() => setSelectedImagePreview(question.questionImage ?? null)}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Answer Selection Section */}
          <div className="space-y-4">
            {/* Clear Answer Button */}
            {answer !== undefined && (
              <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800 font-medium">
                    Selected Answer: Option {answer + 1}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAnswer}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Answer
                </Button>
              </div>
            )}

            <RadioGroup
              value={answer !== undefined ? String(answer) : ""}
              onValueChange={(value) =>
                onAnswerChange(question.id, parseInt(value))
              }
            >
              {question?.options?.map((option, index) => (
                <div
                  key={`${question.id}-${index}`}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                    answer === index 
                      ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <RadioGroupItem
                    value={String(index)}
                    id={`${question.id}-${index}`}
                    className="flex-shrink-0"
                  />
                  <Label
                    htmlFor={`${question.id}-${index}`}
                    className="flex-1 cursor-pointer flex items-center space-x-4"
                  >
                    <span className="flex-1 text-base">{option}</span>
                    {/* Option Image - Simplified approach */}
                    {question.optionImages && question.optionImages[index] && (
                      <div 
                        className="relative h-16 w-16 overflow-hidden rounded border cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          if (question.optionImages?.[index]) {
                            setSelectedImagePreview(question.optionImages[index]);
                          }
                        }}
                      >
                        <Image
                          src={question.optionImages[index]}
                          alt={`Option ${index + 1} illustration`}
                          width={64}
                          height={64}
                          className="h-16 w-16 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* Image Preview Modal */}
        <Dialog open={!!selectedImagePreview} onOpenChange={() => setSelectedImagePreview(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-2">
            <DialogTitle className="sr-only">Image Preview</DialogTitle>
            <div className="relative flex items-center justify-center">
              <div className="relative max-w-full max-h-[80vh] overflow-hidden">
                {selectedImagePreview && (
                  <Image
                    src={selectedImagePreview}
                    alt="Full size preview"
                    width={1200}
                    height={800}
                    className="w-auto h-auto max-w-full max-h-[80vh] object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImagePreview(null)}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
