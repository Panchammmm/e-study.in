'use client';

import React from 'react';
import { Question } from '@/constants/types';
import { QuestionCard } from './QuestionCard';

interface QuestionGridProps {
  questions: Question[];
  selectedQuestions: string[];
  multiSelect: boolean;
  onSelectQuestion: (questionId: string) => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDuplicateQuestion: (questionId: string) => void;
}

export const QuestionGrid: React.FC<QuestionGridProps> = ({
  questions,
  selectedQuestions,
  multiSelect,
  onSelectQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onDuplicateQuestion
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {questions.map(question => (
        <QuestionCard
          key={question.id}
          question={question}
          isSelected={selectedQuestions.includes(question.id)}
          onSelect={multiSelect ? () => onSelectQuestion(question.id) : undefined}
          onEdit={() => onEditQuestion(question)}
          onDelete={() => onDeleteQuestion(question.id)}
          onDuplicate={() => onDuplicateQuestion(question.id)}
        />
      ))}
    </div>
  );
};
