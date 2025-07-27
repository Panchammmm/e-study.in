import React from 'react';
import { Question } from '@/constants/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Edit, Trash2, Copy, Tag } from 'lucide-react';
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

// Question Card Component for Grid View
export const QuestionCard: React.FC<{
  question: Question;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}> = ({ question, isSelected, onSelect, onEdit, onDelete, onDuplicate }) => {
  return (
    <Card className={`overflow-hidden ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="p-4 pb-0 flex flex-row justify-between items-start">
        <div className="space-y-1 flex-1">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline" className="font-normal">
              {question.difficulty}
            </Badge>
            {question.subject && (
              <Badge variant="secondary" className="font-normal">
                {question.subject}
              </Badge>
            )}
          </div>
        </div>
        {onSelect && (
          <div 
            className={`h-5 w-5 rounded-full border cursor-pointer flex items-center justify-center ${
              isSelected ? 'bg-primary border-primary' : 'border-input'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            {isSelected && <CheckCircle className="h-4 w-4 text-white" />}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div 
          className="min-h-[80px] mb-3"
          onClick={onSelect}
        >
          <div className="truncate-3-lines">
            <MathDisplay>{question.content}</MathDisplay>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {question.tags?.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="icon" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
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
      </CardContent>
    </Card>
  );
};
