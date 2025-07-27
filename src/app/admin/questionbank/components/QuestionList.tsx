'use client';

import React from 'react';
import { Question } from '@/constants/types';
import { QuestionCard } from './QuestionCard';
import { ViewMode } from '../types';

interface QuestionListProps {
  questions: Question[];
  viewMode: ViewMode;
  onEdit: (question: Question) => void;
  onDelete: (questionId: string) => void;
  onDuplicate: (questionId: string) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  viewMode,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
        <p className="text-gray-500 mb-4">
          Get started by creating your first question or adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className={`
      ${viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
        : 'space-y-4'
      }
    `}>
      {questions.map((question, index) => (
        <QuestionCard
          key={`${question.id}-${question.updatedAt || question.createdAt}-${index}`}
          question={question}
          viewMode={viewMode}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
};
