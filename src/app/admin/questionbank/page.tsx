'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import QuestionBankRefactored from './QuestionBankRefactored';
// import EnhancedQuestionBank from './EnhancedQuestionBank';
// import QuestionBankRefactored from './QuestionBankRefactored';

const EnhancedQuestionBankPage = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back(); // Navigates to the previous page
    
  };

  // TODO: Uncomment to use the new modular version
  return <QuestionBankRefactored onBack={handleBack} />;
  
  // For now, keep using the original component
  // return <EnhancedQuestionBank onBack={handleBack} />;
};

export default EnhancedQuestionBankPage;