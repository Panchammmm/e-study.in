'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import QuestionBankRefactored from '../questionbank/QuestionBankRefactored';

const EnhancedQuestionBankPage = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back(); // Navigates to the previous page
  };

  return <QuestionBankRefactored onBack={handleBack} />;
};
export default EnhancedQuestionBankPage;