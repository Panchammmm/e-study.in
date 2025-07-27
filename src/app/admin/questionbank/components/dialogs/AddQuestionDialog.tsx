'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { QuestionForm } from '../forms/QuestionForm';
import { CreateQuestionRequest } from '@/constants/types';

interface AddQuestionDialogProps {
  isOpen: boolean;
  isCreating: boolean;
  newQuestion: CreateQuestionRequest;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  onQuestionChange: (question: CreateQuestionRequest) => void;
}

export const AddQuestionDialog: React.FC<AddQuestionDialogProps> = ({
  isOpen,
  isCreating,
  newQuestion,
  onClose,
  onSubmit,
  onQuestionChange
}) => {
  const handleSubmit = async () => {
    try {
      await onSubmit();
      onClose();
    } catch (error) {
      console.error('Failed to add question:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
          <DialogDescription>
            Create a new question for your question bank
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <QuestionForm
            question={newQuestion}
            onChange={onQuestionChange}
            isSubmitting={isCreating}
            onSubmit={handleSubmit}
          />
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isCreating}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isCreating}
              className="cursor-pointer"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Question'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
