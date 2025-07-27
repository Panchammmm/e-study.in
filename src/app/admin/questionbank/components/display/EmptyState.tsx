'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  hasQuestions: boolean;
  onAddQuestion: () => void;
  onClearFilters: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  hasQuestions,
  onAddQuestion,
  onClearFilters
}) => {
  return (
    <div className="mt-8 flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
      <div className="text-center space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <BookOpen className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No questions found</h3>
        <p className="text-muted-foreground max-w-md">
          {hasQuestions 
            ? "No questions match your current filters. Try adjusting your search or filters."
            : "You haven't added any questions yet. Create your first question to get started."}
        </p>
        <div className="flex gap-2 justify-center">
          {hasQuestions && (
            <Button variant="outline" onClick={onClearFilters}>
              Clear Filters
            </Button>
          )}
          <Button onClick={onAddQuestion}>
            Add Question
          </Button>
        </div>
      </div>
    </div>
  );
};
