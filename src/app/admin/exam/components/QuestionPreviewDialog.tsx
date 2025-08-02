'use client';

import React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';
import { Question } from '@/constants/types';
import SafeMathDisplay from '../../../../components/SafeMathDisplay';

interface QuestionPreviewDialogProps {
  previewQuestion: Question | null;
  setPreviewQuestion: (question: Question | null) => void;
  getDifficultyColor: (difficulty: string) => string;
  // Make these props OPTIONAL for view-only mode
  selectedQuestions?: Set<string>;
  toggleSelection?: (id: string) => void;
  handleAddQuestions?: () => Promise<void>;
  addingQuestions?: boolean;
  selectedCount?: number;
  onClose?: () => void;
  mode?: 'dialog' | 'inline';
}

const QuestionPreviewDialog: React.FC<QuestionPreviewDialogProps> = ({
  previewQuestion,
  setPreviewQuestion,
  selectedQuestions,
  toggleSelection,
  getDifficultyColor,
  // do not remove these below lines (even though it's a warning), it is part of the component's props
  handleAddQuestions,
  addingQuestions,
  selectedCount,
  onClose,
  mode = 'dialog',
}) => {
  if (!previewQuestion) return null;

  // Helper function to render each layer
  const renderLayer = (
    type: "text" | "image" | "none",
    text?: string,
    imageUrl?: string,
    idx?: number
  ) => {
    if (type === "text" && text && typeof text === 'string' && text.trim()) {
      return (
        <div key={`layer-text-${idx}`} className="rounded break-words">
          <SafeMathDisplay>{text}</SafeMathDisplay>
        </div>
      );
    }
    if (type === "image" && imageUrl) {
      return (
        <div key={`layer-image-${idx}`} className="rounded flex justify-start">
          <div className="relative w-full max-w-full h-auto">
            <Image
              src={imageUrl}
              alt={`Question layer ${idx} image`}
              width={250}
              height={150}
              className="rounded-md object-contain bg-white"
              onError={(e) => {
                console.error(
                  `Failed to load question layer ${idx} image:`,
                  imageUrl
                );
                e.currentTarget.style.display = "none";
              }}
              unoptimized={true}
            />
          </div>
        </div>
      );
    }
    return null;
  };

  // Helper function to render explanation
  const renderExplanation = () => {
    if (
      !previewQuestion.explanationType ||
      previewQuestion.explanationType === "none"
    ) {
      return null;
    }

    if (
      previewQuestion.explanationType === "text" &&
      previewQuestion.explanationText &&
      typeof previewQuestion.explanationText === 'string' &&
      previewQuestion.explanationText.trim()
    ) {
      return (
        <div className="p-3 border rounded bg-blue-50 border-blue-200">
          <div className="text-sm">
            <SafeMathDisplay>{previewQuestion.explanationText}</SafeMathDisplay>
          </div>
        </div>
      );
    }

    if (
      previewQuestion.explanationType === "image" &&
      previewQuestion.explanationImage
    ) {
      return (
        <div className="p-3 border rounded bg-blue-50 border-blue-200 flex justify-start">
          <div className="relative w-full max-w-full h-auto">
            <Image
              src={previewQuestion.explanationImage}
              alt="Question explanation image"
              width={300}
              height={200}
              className="rounded-md object-contain bg-white"
              style={{ maxHeight: "150px", width: "auto" }}
              onError={(e) => {
                console.error(
                  "Failed to load explanation image:",
                  previewQuestion.explanationImage
                );
                e.currentTarget.style.display = "none";
              }}
              unoptimized={true}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={!!previewQuestion} onOpenChange={(open) => !open && setPreviewQuestion(null)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <span className='ml-[-3px]'>Question Preview</span>
          </DialogTitle>
          <DialogDescription>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap justify-between gap-2">
            <div className='flex items-center space-x-1 cursor-text'>
              <Badge variant="outline">{previewQuestion.subject}</Badge>
              <Badge variant="secondary">{previewQuestion.topic}</Badge>
              <Badge className={getDifficultyColor(previewQuestion.difficulty)}>
                {previewQuestion.difficulty}
              </Badge>
            </div>

            <div className='flex items-center space-x-1 cursor-text'>
              <Badge className='bg-green-100 text-green-800 border-green-200'>+ {previewQuestion.positiveMarks}</Badge>
              <Badge className="bg-red-100 text-red-800 border-red-200">- {previewQuestion.negativeMarks}</Badge>
            </div>
          </div>

          {/* Question content with 3 layers */}
          <div>
            <Label>Question</Label>
            <div className='border mt-1 p-5 rounded bg-white shadow-sm'>
              <div className="space-y-3">
                {renderLayer(previewQuestion.layer1Type, previewQuestion.layer1Text, previewQuestion.layer1Image, 1)}
                {renderLayer(previewQuestion.layer2Type, previewQuestion.layer2Text, previewQuestion.layer2Image, 2)}
                {renderLayer(previewQuestion.layer3Type, previewQuestion.layer3Text, previewQuestion.layer3Image, 3)}
              </div>
            </div>
          </div>

          {/* Options */}
          <div>
            <Label>Options</Label>
            <div className="mt-1 space-y-2">
              {previewQuestion.options.map((option, index) => {
                const isCorrect = index === previewQuestion.correctOption;
                const optionType = previewQuestion.optionTypes?.[index] || 'text';
                const optionImage = previewQuestion.optionImages?.[index];

                return (
                  <div
                    key={index}
                    className={`p-3 border rounded ${
                      isCorrect ? "bg-green-50 border-green-200" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                          isCorrect
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {optionType === "text" ? (
                          <div className="break-words">
                            <SafeMathDisplay>{option}</SafeMathDisplay>
                          </div>
                        ) : optionType === "image" && optionImage ? (
                          <div className="flex justify-start">
                            <div className="relative max-w-full">
                              <Image
                                src={optionImage}
                                alt={`Option ${String.fromCharCode(
                                  65 + index
                                )} image`}
                                width={120}
                                height={90}
                                className="rounded-sm object-contain border bg-white max-w-full h-auto"
                                style={{ maxHeight: "120px", width: "auto" }}
                                onError={(e) => {
                                  console.error(
                                    "Failed to load option image:",
                                    optionImage
                                  );
                                  e.currentTarget.style.display = "none";
                                }}
                                unoptimized={true}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">No content</span>
                        )}
                      </div>
                      {isCorrect && (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation Section */}
          {(previewQuestion.explanationType === 'text' && previewQuestion.explanationText) || 
           (previewQuestion.explanationType === 'image' && previewQuestion.explanationImage) ? (
            <div>
              <Label>Explanation</Label>
              <div className="mt-1">
                {renderExplanation()}
              </div>
            </div>
          ) : null}

          {/* Tags */}
          {previewQuestion.tags.length > 0 && (
            <div>
              <Label>Tags</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {previewQuestion.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Conditionally render action button only if toggleSelection is provided */}
          {toggleSelection && selectedQuestions && (
            <div className="flex justify-end">
              <Button
                className='cursor-pointer'
                variant={selectedQuestions.has(previewQuestion.id) ? "destructive" : "default"}
                onClick={() => {
                  toggleSelection(previewQuestion.id);
                  setPreviewQuestion(null);
                }}
              >
                {selectedQuestions.has(previewQuestion.id) ? 'Remove from Selection' : 'Add to Selection'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionPreviewDialog;
