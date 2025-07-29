// Test utility to verify isLastQuestion logic
// This file can be deleted after testing

interface TestExam {
  sections?: Array<{
    questions?: Array<{ id: string }>;
  }>;
  questions?: Array<{ id: string }>;
}

interface NavigationState {
  currentSectionIndex: number;
  currentQuestionIndex: number;
}

function calculateIsLastQuestion(
  exam: TestExam,
  navigationState: NavigationState,
  totalQuestions: number
): boolean {
  if (!exam) return false;

  let currentGlobalIndex = 0;

  // If exam has sections, calculate position across all sections
  if (exam.sections && exam.sections.length > 0) {
    for (let sectionIdx = 0; sectionIdx < exam.sections.length; sectionIdx++) {
      const section = exam.sections[sectionIdx];
      const sectionQuestionsLength = section.questions?.length || 0;
      
      if (sectionIdx < navigationState.currentSectionIndex) {
        // Add all questions from previous sections
        currentGlobalIndex += sectionQuestionsLength;
      } else if (sectionIdx === navigationState.currentSectionIndex) {
        // Add current question index within current section
        currentGlobalIndex += navigationState.currentQuestionIndex;
        break;
      }
    }
    
    // Total questions across all sections
    return currentGlobalIndex === totalQuestions - 1;
  }

  // If no sections, check direct questions
  const questionsLength = exam.questions?.length || 0;
  return questionsLength > 0 && navigationState.currentQuestionIndex === questionsLength - 1;
}

// Test cases
console.log('Testing isLastQuestion logic:');

// Test case 1: Single section with 1 question
const singleQuestionExam: TestExam = {
  sections: [
    {
      questions: [{ id: 'q1' }]
    }
  ]
};

const nav1: NavigationState = { currentSectionIndex: 0, currentQuestionIndex: 0 };
const result1 = calculateIsLastQuestion(singleQuestionExam, nav1, 1);
console.log('Single question exam, at question 1:', result1); // Should be true

// Test case 2: Single section with 3 questions, at question 2
const threeQuestionExam: TestExam = {
  sections: [
    {
      questions: [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }]
    }
  ]
};

const nav2: NavigationState = { currentSectionIndex: 0, currentQuestionIndex: 1 };
const result2 = calculateIsLastQuestion(threeQuestionExam, nav2, 3);
console.log('Three question exam, at question 2:', result2); // Should be false

const nav3: NavigationState = { currentSectionIndex: 0, currentQuestionIndex: 2 };
const result3 = calculateIsLastQuestion(threeQuestionExam, nav3, 3);
console.log('Three question exam, at question 3:', result3); // Should be true

// Test case 3: Multiple sections
const multiSectionExam: TestExam = {
  sections: [
    {
      questions: [{ id: 'q1' }, { id: 'q2' }]
    },
    {
      questions: [{ id: 'q3' }]
    }
  ]
};

const nav4: NavigationState = { currentSectionIndex: 0, currentQuestionIndex: 1 };
const result4 = calculateIsLastQuestion(multiSectionExam, nav4, 3);
console.log('Multi-section exam, section 1 question 2:', result4); // Should be false

const nav5: NavigationState = { currentSectionIndex: 1, currentQuestionIndex: 0 };
const result5 = calculateIsLastQuestion(multiSectionExam, nav5, 3);
console.log('Multi-section exam, section 2 question 1 (last overall):', result5); // Should be true

export {};
