'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2, Copy } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import MathDisplay from './math-display';
import { Question } from '@/constants/types';

interface QuestionCardProps {
  question: Question;
  onEdit: (question: Question) => void;
  onDelete: (questionId: string) => void;
  onDuplicate: (questionId: string) => void;
  viewMode: 'grid' | 'list';
  isSelected?: boolean;
  multiSelect?: boolean;
  onSelect?: (questionId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onEdit,
  onDelete,
  onDuplicate,
  viewMode,
  isSelected = false,
  multiSelect = false,
  onSelect
}) => {
  // Helper function to render question content based on layers (exactly like original)
  const renderQuestionContent = (question: Question) => {
    const layers = [];

    // Layer 1
    if (question.layer1Type === 'text' && question.layer1Text) {
      layers.push(
        <div key="layer1" className="mb-2">
          <MathDisplay>{question.layer1Text}</MathDisplay>
        </div>
      );
    } else if (question.layer1Type === 'image' && question.layer1Image) {
      layers.push(
        <div key="layer1" className="mb-2">
          <Image
            src={question.layer1Image}
            alt="Question layer 1"
            width={300}
            height={200}
            className="rounded-md object-contain border bg-white"
            style={{ minHeight: '200px', maxHeight: '200px' }}
          />
        </div>
      );
    }

    // Layer 2
    if (question.layer2Type === 'text' && question.layer2Text) {
      layers.push(
        <div key="layer2" className="mb-2">
          <MathDisplay>{question.layer2Text}</MathDisplay>
        </div>
      );
    } else if (question.layer2Type === 'image' && question.layer2Image) {
      layers.push(
        <div key="layer2" className="mb-2">
          <Image
            src={question.layer2Image}
            alt="Question layer 2"
            width={300}
            height={200}
            className="rounded-md object-contain border bg-white"
            style={{ minHeight: '200px', maxHeight: '200px' }}
          />
        </div>
      );
    }

    // Layer 3
    if (question.layer3Type === 'text' && question.layer3Text) {
      layers.push(
        <div key="layer3" className="mb-2">
          <MathDisplay>{question.layer3Text}</MathDisplay>
        </div>
      );
    } else if (question.layer3Type === 'image' && question.layer3Image) {
      layers.push(
        <div key="layer3" className="mb-2">
          <Image
            src={question.layer3Image}
            alt="Question layer 3"
            width={300}
            height={200}
            className="rounded-md object-contain border bg-white"
            style={{ minHeight: '200px', maxHeight: '200px' }}
          />
        </div>
      );
    }

    // Fallback to legacy content if no layers
    if (layers.length === 0 && question.content) {
      layers.push(
        <div key="legacy" className="mb-2">
          <MathDisplay>{question.content}</MathDisplay>
        </div>
      );
    }

    // Legacy question image
    if (question.questionImage && layers.length === 0) {
      layers.push(
        <div key="legacy-image" className="mb-2">
          <Image
            src={question.questionImage}
            alt="Question image"
            width={300}
            height={200}
            className="rounded-md object-contain border bg-white"
            style={{ minHeight: '200px', maxHeight: '200px' }}
          />
        </div>
      );
    }

    return layers;
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {multiSelect && onSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(question.id)}
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={
                  question.difficulty === 'EASY' ? 'secondary' :
                    question.difficulty === 'MEDIUM' ? 'default' : 'destructive'
                }>
                  {question.difficulty}
                </Badge>
                <Badge variant="outline">{question.subject}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{question.topic}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className='cursor-pointer'
              onClick={() => onEdit(question)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className='cursor-pointer'
              onClick={() => onDuplicate(question.id)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className='cursor-pointer'
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the question.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(question.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Question Content with 3-layer support */}
        <div className="mb-3">
          {renderQuestionContent(question)}
        </div>

        {/* Display Marks */}
        <div className="flex items-center gap-4 mt-2 mb-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-green-700 font-medium">+{question.positiveMarks}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            <span className="text-red-700 font-medium">-{question.negativeMarks}</span>
          </div>
        </div>

        {/* Options with enhanced display */}
        <div className="space-y-1 mb-3">
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${index === question.correctOption
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-gray-100 text-gray-600'
                }`}>
                {String.fromCharCode(65 + index)}
              </div>
              <div className="flex items-center gap-2 flex-1">
                {/* Text or Image Option Display */}
                {question.optionTypes && question.optionTypes[index] === 'image' ? (
                  question.optionImages && question.optionImages[index] && (
                    <Image
                      src={question.optionImages[index]}
                      alt={`Option ${String.fromCharCode(65 + index)} image`}
                      width={80}
                      height={60}
                      className="rounded-sm object-contain border bg-white"
                      style={{ minHeight: '60px', maxHeight: '60px' }}
                    />
                  )
                ) : (
                  <MathDisplay className="text-xs">{option}</MathDisplay>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {question.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Show explanation if available */}
        {question.explanationType !== 'none' && (question.explanationText || question.explanationImage) && (
          <div className="mt-3 p-2 bg-blue-50 rounded-md">
            <p className="text-xs font-medium text-blue-900 mb-1">Explanation:</p>
            {question.explanationType === 'text' && question.explanationText && (
              <MathDisplay className="text-xs">{question.explanationText}</MathDisplay>
            )}
            {question.explanationType === 'image' && question.explanationImage && (
              <Image
                src={question.explanationImage}
                alt="Question explanation"
                width={200}
                height={150}
                className="rounded-sm object-contain border bg-white"
                style={{ minHeight: '100px', maxHeight: '150px' }}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
