import React from 'react';
import { Question } from '@/constants/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Edit, Trash2, Copy } from 'lucide-react';
import MathDisplay from '../math-display';
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

// Question Row Component for List View
export const QuestionRow: React.FC<{
  question: Question;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}> = ({ question, isSelected, onSelect, onEdit, onDelete, onDuplicate }) => {
  return (
    <Card className={`overflow-hidden ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <div className="p-4 flex flex-col md:flex-row gap-4">
        {/* Select Checkbox (if in multi-select mode) */}
        {onSelect && (
          <div className="flex items-start pt-1">
            <div 
              className={`h-5 w-5 rounded-full border cursor-pointer flex items-center justify-center ${
                isSelected ? 'bg-primary border-primary' : 'border-input'
              }`}
              onClick={onSelect}
            >
              {isSelected && <CheckCircle className="h-4 w-4 text-white" />}
            </div>
          </div>
        )}
        
        {/* Question Content */}
        <div className="flex-1" onClick={onSelect}>
          <div className="mb-2">
            <MathDisplay>{question.content}</MathDisplay>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="font-normal">
              {question.difficulty}
            </Badge>
            {question.subject && (
              <Badge variant="secondary" className="font-normal">
                {question.subject}
              </Badge>
            )}
            {question.topic && (
              <Badge variant="secondary" className="font-normal">
                {question.topic}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 md:flex-col">
          <Button variant="ghost" size="icon" onClick={onDuplicate} title="Duplicate">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit} title="Edit">
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Delete">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Question</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this question? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
};
