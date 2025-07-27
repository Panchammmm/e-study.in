'use client';

import React from 'react';
import { Question } from '@/constants/types';
import { QuestionRow } from './QuestionRow';

interface QuestionListProps {
  questions: Question[];
  selectedQuestions: string[];
  multiSelect: boolean;
  onSelectQuestion: (questionId: string) => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDuplicateQuestion: (questionId: string) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  selectedQuestions,
  multiSelect,
  onSelectQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onDuplicateQuestion
}) => {
  return (
    <div className="space-y-4">
      {questions.map(question => (
        <QuestionRow
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
