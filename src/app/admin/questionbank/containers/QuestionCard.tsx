'use client';
import React, { memo, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  Tag,
  Star,
  Clock,
  Award,
  BookOpen,
  Target,
  Zap
} from 'lucide-react';
import { Question } from '@/constants/types';
import SafeMathDisplay from '../../../../components/SafeMathDisplay';

interface QuestionCardProps {
  question: Question;
  isSelected: boolean;
  multiSelect: boolean;
  selectedTags: string[];
  onToggleSelection: (questionId: string) => void;
  onPreview: (question: Question) => void;
  onEdit: (question: Question) => void;
  onDelete: (questionId: string) => void;
  onToggleTag: (tag: string) => void;
  getDifficultyColor: (difficulty: string) => string;
  renderQuestionContent: (question: Question) => React.ReactNode;
}

export const QuestionCard = memo<QuestionCardProps>(({
  question,
  isSelected,
  multiSelect,
  selectedTags,
  onToggleSelection,
  onPreview,
  onEdit,
  onDelete,
  onToggleTag,
  // getDifficultyColor,
  renderQuestionContent
}) => {
  // Handle card click for selection
  const handleCardClick = useCallback(() => {
    if (multiSelect) {
      onToggleSelection(question.id);
    }
  }, [multiSelect, onToggleSelection, question.id]);

  // Handle preview click
  const handlePreviewClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview(question);
  }, [onPreview, question]);

  // Handle edit click
  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(question);
  }, [onEdit, question]);

  // ✅ FIX: Proper delete handler
  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Don't prevent default here as it might interfere with the dialog
  }, []);

  // ✅ FIX: Confirm delete handler
  const handleConfirmDelete = useCallback(() => {
    onDelete(question.id);
  }, [onDelete, question.id]);

  // Handle tag click
  const handleTagClick = useCallback((e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    onToggleTag(tag);
  }, [onToggleTag]);

  // Get difficulty icon and enhanced colors
  const getDifficultyDetails = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return {
          icon: <Zap className="h-3 w-3" />,
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          gradientFrom: 'from-emerald-500',
          gradientTo: 'to-green-400'
        };
      case 'MEDIUM':
        return {
          icon: <Target className="h-3 w-3" />,
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          gradientFrom: 'from-amber-500',
          gradientTo: 'to-yellow-400'
        };
      case 'HARD':
        return {
          icon: <Award className="h-3 w-3" />,
          color: 'bg-rose-100 text-rose-800 border-rose-200',
          gradientFrom: 'from-rose-500',
          gradientTo: 'to-red-400'
        };
      default:
        return {
          icon: <BookOpen className="h-3 w-3" />,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          gradientFrom: 'from-gray-500',
          gradientTo: 'to-gray-400'
        };
    }
  };

  const difficultyDetails = getDifficultyDetails(question.difficulty);

  return (
    <Card 
      className={`group relative overflow-hidden transition-all duration-300 ease-in-out transform hover:shadow-sm backdrop-blur-sm border-0 shadow-md ${
        isSelected 
          ? 'ring-2 ring-blue-500 shadow-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50' 
          : 'bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-white'
      }`}
      onClick={handleCardClick}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-blue-500">
          <CheckCircle className="absolute -top-[18px] -right-[2px] h-3 w-3 text-white" />
        </div>
      )}

      <CardHeader className="p-5 pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Enhanced difficulty badge */}
            <Badge className={`${difficultyDetails.color} flex items-center gap-1.5 px-3 py-1 font-semibold shadow-sm`}>
              {difficultyDetails.icon}
              {question.difficulty}
            </Badge>

            {/* Selection checkbox for multi-select */}
            {multiSelect && (
              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                isSelected 
                  ? 'bg-blue-500 border-blue-500 shadow-md' 
                  : 'border-gray-300 hover:border-blue-400 hover:shadow-sm'
              }`}>
                {isSelected && (
                  <CheckCircle className="h-4 w-4 text-white" />
                )}
              </div>
            )}

            {/* Explanation indicator */}
            {((question.explanationType === 'text' && question.explanationText) || 
              (question.explanationType === 'image' && question.explanationImage)) && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 px-2.5 py-1">
                <Star className="h-3 w-3" />
                Explanation
              </Badge>
            )}

            {/* Marks indicator */}
            <div className='flex items-center gap-2'>
              <Badge className='bg-emerald-100 text-emerald-800 border-emerald-200 text-xs px-2 py-0.5'>
                +{question.positiveMarks}
              </Badge>
              <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-xs px-2 py-0.5">
                -{question.negativeMarks}
              </Badge>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 cursor-pointer hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200 rounded-full"
              onClick={handlePreviewClick}
              title="Preview Question"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 cursor-pointer hover:bg-amber-100 hover:text-amber-600 transition-colors duration-200 rounded-full"
              onClick={handleEditClick}
              title="Edit Question"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            {/* ✅ FIX: Properly structured AlertDialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-red-100 hover:text-red-600 cursor-pointer transition-colors duration-200 rounded-full"
                  onClick={handleDeleteClick}
                  title="Delete Question"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                    <Trash2 className="h-5 w-5" />
                    Delete Question
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600">
                    Are you sure you want to delete this question? This action cannot be undone and will permanently remove the question from your question bank.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="hover:bg-gray-100">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Question
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 pt-1 space-y-4">
        {/* Subject and Topic */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full font-medium">
            <BookOpen className="h-3 w-3" />
            {question.subject}
          </div>
          {question.topic && (
            <>
              <span className="text-gray-400">•</span>
              <div className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
                {question.topic}
              </div>
            </>
          )}
        </div>

        {/* Question Content */}
        <div className="space-y-3">
          <div className="text-gray-900 leading-relaxed font-medium">
            {renderQuestionContent(question)}
          </div>
        </div>
        
        {/* Options */}
        {Array.isArray(question.options) && question.options.length > 0 && (
          <div className="space-y-3 mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Target className="h-4 w-4" />
              Answer Options
            </div>
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((option, i) => {
                const isCorrect = question.correctOption === i;
                const optionType = question.optionTypes?.[i] || 'text';
                const optionImage = question.optionImages?.[i];
                
                return (
                  <div 
                    key={i}
                    className={`relative text-sm p-3 rounded-lg border transition-all duration-200 ${
                      isCorrect 
                        ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 shadow-sm' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {/* Option label */}
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                      {String.fromCharCode(65 + i)}
                    </div>

                    {optionType === 'text' ? (
                      option ? (
                        <SafeMathDisplay className="text-sm mt-2">{option}</SafeMathDisplay>
                      ) : (
                        <span className="text-gray-400 italic mt-2 block">No text</span>
                      )
                    ) : optionType === 'image' && optionImage ? (
                      <div className="">
                        <Image
                          src={optionImage}
                          alt={`Option ${i+1}`}
                          width={0}
                          height={0}
                          className="rounded-lg object-contain max-h-20 bg-white p-1 h-auto w-auto"
                          unoptimized={true}
                          onError={(e) => {
                            console.error('Option image load error:', optionImage);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <span className="text-gray-400 italic mt-2 block">No content</span>
                    )}
                    
                    {isCorrect && (
                      <Badge className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs px-2 py-1 shadow-md">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Correct
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Tag className="h-4 w-4" />
              Tags
            </div>
            <div className="flex flex-wrap gap-2">
              {question.tags.slice(0, 3).map(tag => (
                <Badge 
                  key={tag} 
                  variant={selectedTags.includes(tag) ? "default" : "secondary"} 
                  className={`text-xs cursor-pointer transition-all duration-200 transform hover:scale-105 flex items-center gap-1.5 px-3 py-1.5 ${
                    selectedTags.includes(tag) 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                  }`}
                  onClick={(e) => handleTagClick(e, tag)}
                  title={`Click to ${selectedTags.includes(tag) ? 'remove' : 'add'} tag filter`}
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
              {question.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs cursor-default bg-gray-100 text-gray-600 px-3 py-1.5">
                  <Clock className="h-3 w-3 mr-1" />
                  +{question.tags.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

QuestionCard.displayName = 'QuestionCard';
