'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ImageUploadComponent from '@/components/ui/image-upload';
import MathInput from './components/math-input'; // Import the MathInput component
import MathDisplay from './components/math-display'; // Import the MathDisplay component
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  BookOpen,
  Tag,
  CheckCircle,
  Grid,
  List,
  RefreshCw,
  Copy
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Question, CreateQuestionRequest, UpdateQuestionRequest, QuestionDifficulty } from '@/constants/types';
import {
  useQuestions,
  useFilteredQuestions,
  useQuestionsLoading,
  useQuestionsError,
  useQuestionActions,
  useQuestionFilters,
  useStoreInitialization
} from '@/store';
import { questionService } from '@/services/question';

interface EnhancedQuestionBankProps {
  onBack: () => void;
  onSelectQuestions?: (questions: Question[]) => void;
  multiSelect?: boolean;
  preSelectedQuestions?: string[];
}

const EnhancedQuestionBank: React.FC<EnhancedQuestionBankProps> = ({
  onBack,
}) => {
  // Initialize stores
  useStoreInitialization();

  // Store hooks
  const questions = useQuestions();
  console.log('Questions:', questions.length, questions.slice(0, 2));
  const filteredQuestions = useFilteredQuestions();
  console.log('Filtered Questions:', filteredQuestions.length, filteredQuestions.slice(0, 2));
  const isLoading = useQuestionsLoading();
  const error = useQuestionsError();
  const { fetchQuestions, createQuestion, updateQuestion, deleteQuestion, setFilters, resetFilters } = useQuestionActions();

  const { filters } = useQuestionFilters();

  // Local state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchText, setSearchText] = useState(filters.search || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  // Updated new question form state with all new fields
  const [newQuestion, setNewQuestion] = useState<CreateQuestionRequest>({
    // Legacy fields
    content: '',
    questionImage: '',

    // 3-Layer system defaults
    layer1Type: 'none',
    layer1Text: '',
    layer1Image: '',
    layer2Type: 'none',
    layer2Text: '',
    layer2Image: '',
    layer3Type: 'none',
    layer3Text: '',
    layer3Image: '',

    // Options defaults
    options: ['', '', '', ''],
    optionImages: ['', '', '', ''],
    optionTypes: ['text', 'text', 'text', 'text'],
    correctOption: 0,

    // Marking system defaults
    positiveMarks: 4,
    negativeMarks: 1,

    // Explanation system defaults
    explanationType: 'none',
    explanationText: '',
    explanationImage: '',

    // Other defaults
    difficulty: 'EASY',
    subject: '',
    topic: '',
    tags: [],
  });

  // Available options for filters (derived from questions)
  const subjects = React.useMemo(() =>
    [...new Set(questions.map(q => q.subject))], [questions]
  );

  const topics = React.useMemo(() =>
    [...new Set(questions.map(q => q.topic))], [questions]
  );

  const allTags = React.useMemo(() =>
    [...new Set(questions.flatMap(q => q.tags))], [questions]
  );

  // Debug logging
  React.useEffect(() => {
    console.log('QuestionBank Debug:', {
      questionsLength: questions.length,
      filteredQuestionsLength: filteredQuestions.length,
      isLoading,
      error,
      filters,
      searchText,
      strategy: questions.length === 0 ? 'NETWORK_FETCH' : 'LOCAL_FILTER',
      questions: questions.slice(0, 2),
    });
  }, [questions, filteredQuestions, isLoading, error, filters, searchText]);

  // Debounced search effect
  useEffect(() => {
    if (searchText !== filters.search) {
      setIsSearching(true);
    }

    const timeout = setTimeout(async () => {
      try {
        await setFilters({ search: searchText.trim() });
      } catch (error) {
        console.error('Filter error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
      setIsSearching(false);
    };
  }, [searchText, setFilters, filters.search]);

  // Sync local search text with store filter
  useEffect(() => {
    setSearchText(filters.search || '');
  }, [filters.search]);

  // Additional debugging for initial load
  React.useEffect(() => {
    console.log('Component mounted, triggering fetchQuestions...');

    fetchQuestions().then(() => {
      console.log('fetchQuestions completed');
    }).catch(err => {
      console.error('fetchQuestions failed:', err);
    });
  }, [fetchQuestions]);

  // Update store filters when local search changes
  const handleSearchChange = (value: string) => {
    console.log('Search change:', value);
    setSearchText(value);
  };

  // Handle filter changes
  const handleFilterChange = async (key: string, value: string) => {
    console.log('Filter change:', { key, value, currentFilters: filters });
    const newFilters = { ...filters, [key]: value };
    console.log('New filters:', newFilters);

    try {
      await setFilters(newFilters);
    } catch (error) {
      console.error('Filter change error:', error);
    }
  };

  // Handle adding a new question
  const handleAddQuestion = async () => {
  try {
    setIsCreating(true);

    // Use the newQuestion state directly since it's already properly typed
    const question: CreateQuestionRequest = {
      ...newQuestion
    };

    await createQuestion(question);

    toast({
      title: 'Success',
      description: 'Question added successfully'
    });

    // Reset form
    setNewQuestion({
      content: '',
      questionImage: '',
      layer1Type: 'none',
      layer1Text: '',
      layer1Image: '',
      layer2Type: 'none',
      layer2Text: '',
      layer2Image: '',
      layer3Type: 'none',
      layer3Text: '',
      layer3Image: '',
      options: ['', '', '', ''],
      optionImages: ['', '', '', ''],
      optionTypes: ['text', 'text', 'text', 'text'],
      correctOption: 0,
      positiveMarks: 4,
      negativeMarks: 1,
      explanationType: 'none',
      explanationText: '',
      explanationImage: '',
      difficulty: 'EASY',
      subject: '',
      topic: '',
      tags: [],
    });
      setShowAddQuestion(false);
    } catch (error: unknown) {
      console.error('Failed to add question:', error);

      setOperationError(null);

      let errorMessage = 'Failed to add question';
      let errorTitle = 'Error';

      const errorMsg = error instanceof Error ? error.message :
        (error && typeof error === 'object' && 'message' in error) ?
          String((error as { message: unknown }).message) :
          'Unknown error';

      if (errorMsg.includes('permission') || errorMsg.includes('403')) {
        errorTitle = 'Permission Denied';
        errorMessage = 'You do not have permission to create questions. Please contact your administrator to get ADMIN or MODERATOR access.';
        setOperationError('insufficient_permissions');
      } else if (errorMsg.includes('401') || errorMsg.includes('Authentication')) {
        errorTitle = 'Authentication Required';
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (errorMsg.includes('validation') || errorMsg.includes('400')) {
        errorTitle = 'Validation Error';
        errorMessage = 'Please check that all required fields are filled correctly.';
      } else {
        errorMessage = errorMsg || 'An unexpected error occurred while creating the question.';
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle editing question
  const handleEditQuestion = async (question: Question) => {
    // Validation
    if (!question.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Question content is required",
        variant: 'destructive'
      });
      return;
    }

    if (question.options.some(option => !option.trim())) {
      toast({
        title: "Validation Error",
        description: "All answer options are required",
        variant: 'destructive'
      });
      return;
    }

    if (!question.subject.trim() || !question.topic.trim()) {
      toast({
        title: "Validation Error",
        description: "Subject and topic are required",
        variant: 'destructive'
      });
      return;
    }

    setIsUpdating(true);

    try {
      const updates: UpdateQuestionRequest = {
        content: question.content.trim(),
        questionImage: question.questionImage,
        layer1Type: question.layer1Type,
        layer1Text: question.layer1Text,
        layer1Image: question.layer1Image,
        layer2Type: question.layer2Type,
        layer2Text: question.layer2Text,
        layer2Image: question.layer2Image,
        layer3Type: question.layer3Type,
        layer3Text: question.layer3Text,
        layer3Image: question.layer3Image,
        options: question.options.map(opt => opt.trim()),
        optionImages: question.optionImages,
        optionTypes: question.optionTypes,
        correctOption: question.correctOption,
        positiveMarks: question.positiveMarks,
        negativeMarks: question.negativeMarks,
        explanationType: question.explanationType,
        explanationText: question.explanationText,
        explanationImage: question.explanationImage,
        subject: question.subject.trim(),
        topic: question.topic.trim(),
        difficulty: question.difficulty,
        tags: question.tags.filter(tag => tag.trim() !== "")
      };

      await updateQuestion(question.id, updates);

      toast({
        title: "Success",
        description: "Question updated successfully"
      });

      setEditingQuestion(null);
    } catch (error: unknown) {
      console.error("Failed to edit question:", error);

      setOperationError(null);

      let errorMessage = 'Failed to update question';
      let errorTitle = 'Error';

      if (error && typeof error === 'object' && 'message' in error) {
        const errorMsg = (error as { message: string }).message;

        if (errorMsg.includes('permission') || errorMsg.includes('403')) {
          errorTitle = 'Permission Denied';
          errorMessage = 'You do not have permission to edit this question.';
          setOperationError('insufficient_permissions');
        } else if (errorMsg.includes('401') || errorMsg.includes('Authentication')) {
          errorTitle = 'Authentication Required';
          errorMessage = 'Your session has expired. Please log in again.';
        } else {
          errorMessage = errorMsg || 'An unexpected error occurred while updating the question.';
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle deleting question
  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await deleteQuestion(questionId);

      toast({
        title: 'Deleted',
        description: 'Question deleted successfully'
      });
    } catch (error: unknown) {
      console.error('Failed to delete question:', error);

      setOperationError(null);

      let errorMessage = 'Failed to delete question';
      let errorTitle = 'Error';

      if (error && typeof error === 'object' && 'message' in error) {
        const errorMsg = (error as { message: string }).message;

        if (errorMsg.includes('permission') || errorMsg.includes('403')) {
          errorTitle = 'Permission Denied';
          errorMessage = 'You do not have permission to delete this question.';
          setOperationError('insufficient_permissions');
        } else if (errorMsg.includes('401') || errorMsg.includes('Authentication')) {
          errorTitle = 'Authentication Required';
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (errorMsg.includes('409') || errorMsg.includes('used in exams') || errorMsg.includes('being used') || errorMsg.includes('QUESTION_IN_USE') ||
          (error && typeof error === 'object' && 'code' in error && error.code === 'QUESTION_IN_USE')) {
          errorTitle = 'Question In Use';
          errorMessage = 'This question cannot be deleted because it is currently being used in one or more active exams. Please remove it from all exams before deleting.';

          setOperationError('question_in_use');

          toast({
            title: "Question In Use",
            description: (
              <div className="space-y-2">
                <p>Cannot delete question that is used in exams.</p>
                <div className="text-xs text-muted-foreground">
                  To delete this question, you must first remove it from all exams where it is being used.
                </div>
              </div>
            ),
            variant: "destructive",
            duration: 8000
          });
        } else {
          errorMessage = errorMsg || 'An unexpected error occurred while deleting the question.';
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  // Handle duplicating question
  const handleDuplicateQuestion = async (questionId: string) => {
    try {
      const originalQuestion = questions.find(q => q.id === questionId);
      if (!originalQuestion) {
        throw new Error('Question not found');
      }

      const duplicateData: CreateQuestionRequest = {
        content: `Copy of ${originalQuestion.content}`,
        questionImage: originalQuestion.questionImage,
        layer1Type: originalQuestion.layer1Type,
        layer1Text: originalQuestion.layer1Text,
        layer1Image: originalQuestion.layer1Image,
        layer2Type: originalQuestion.layer2Type,
        layer2Text: originalQuestion.layer2Text,
        layer2Image: originalQuestion.layer2Image,
        layer3Type: originalQuestion.layer3Type,
        layer3Text: originalQuestion.layer3Text,
        layer3Image: originalQuestion.layer3Image,
        options: [...originalQuestion.options],
        optionImages: originalQuestion.optionImages ? [...originalQuestion.optionImages] : [],
        optionTypes: [...originalQuestion.optionTypes],
        correctOption: originalQuestion.correctOption,
        positiveMarks: originalQuestion.positiveMarks,
        negativeMarks: originalQuestion.negativeMarks,
        explanationType: originalQuestion.explanationType,
        explanationText: originalQuestion.explanationText,
        explanationImage: originalQuestion.explanationImage,
        subject: originalQuestion.subject,
        topic: originalQuestion.topic,
        difficulty: originalQuestion.difficulty,
        tags: [...originalQuestion.tags]
      };

      await questionService.createQuestion(duplicateData);

      toast({
        title: 'Duplicated',
        description: 'Question duplicated successfully'
      });

      await fetchQuestions();
    } catch (error) {
      console.error('Failed to duplicate question:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate question',
        variant: 'destructive'
      });
    }
  };

  // Handle tag filtering
  const handleTagFilter = (tag: string) => {
    console.log('Tag filter clicked:', tag);
  };

  // Clear all filters
  const clearFilters = () => {
    console.log('Clearing filters...');
    setSearchText('');
    resetFilters();
    setIsSearching(false);
  };

  // Helper function to render question content based on layers
  const renderQuestionContent = (question: Question) => {
    const layers = [];

    // Layer 1
    if (question.layer1Type === 'text' && question.layer1Text) {
      layers.push(
        <div key="layer1" className="mb-2">
          <MathDisplay>{question.layer1Text}</MathDisplay>
        </div>
      );
    } else if (question.layer1Type === 'image' && question.layer1Image) {
      layers.push(
        <div key="layer1" className="mb-2">
          <Image
            src={question.layer1Image}
            alt="Question layer 1"
            width={300}
            height={200}
            className="rounded-md object-contain border bg-white"
            style={{ minHeight: '200px', maxHeight: '200px' }}
          />
        </div>
      );
    }

    // Layer 2
    if (question.layer2Type === 'text' && question.layer2Text) {
      layers.push(
        <div key="layer2" className="mb-2">
          <MathDisplay>{question.layer2Text}</MathDisplay>
        </div>
      );
    } else if (question.layer2Type === 'image' && question.layer2Image) {
      layers.push(
        <div key="layer2" className="mb-2">
          <Image
            src={question.layer2Image}
            alt="Question layer 2"
            width={300}
            height={200}
            className="rounded-md object-contain border bg-white"
            style={{ minHeight: '200px', maxHeight: '200px' }}
          />
        </div>
      );
    }

    // Layer 3
    if (question.layer3Type === 'text' && question.layer3Text) {
      layers.push(
        <div key="layer3" className="mb-2">
          <MathDisplay>{question.layer3Text}</MathDisplay>
        </div>
      );
    } else if (question.layer3Type === 'image' && question.layer3Image) {
      layers.push(
        <div key="layer3" className="mb-2">
          <Image
            src={question.layer3Image}
            alt="Question layer 3"
            width={300}
            height={200}
            className="rounded-md object-contain border bg-white"
            style={{ minHeight: '200px', maxHeight: '200px' }}
          />
        </div>
      );
    }

    // Fallback to legacy content if no layers
    if (layers.length === 0 && question.content) {
      layers.push(
        <div key="legacy" className="mb-2">
          <MathDisplay>{question.content}</MathDisplay>
        </div>
      );
    }

    // Legacy question image
    if (question.questionImage && layers.length === 0) {
      layers.push(
        <div key="legacy-image" className="mb-2">
          <Image
            src={question.questionImage}
            alt="Question image"
            width={300}
            height={200}
            className="rounded-md object-contain border bg-white"
            style={{ minHeight: '200px', maxHeight: '200px' }}
          />
        </div>
      );
    }

    return layers;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className='cursor-pointer'>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Question Bank</h1>
            <p className="text-muted-foreground">Manage your question database</p>
          </div>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div>
              <p className="text-lg font-medium">Loading Questions</p>
              <p className="text-sm text-muted-foreground">Please wait while we fetch your question bank...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className='cursor-pointer'>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Question Bank</h1>
            <p className="text-muted-foreground">Manage your question database</p>
          </div>
        </div>

        <Alert variant="destructive" className="max-w-2xl">
          <AlertTitle className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Unable to Load Questions
          </AlertTitle>
          <AlertDescription className="mt-2">
            <div className="space-y-3">
              <p>We are having trouble loading your questions. This could be due to:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Network connectivity issues</li>
                <li>Server temporarily unavailable</li>
                <li>Authentication problems</li>
              </ul>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => {
                    fetchQuestions();
                  }}
                  variant="outline"
                  size="sm"
                  className='cursor-pointer'
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                  className='cursor-pointer'
                >
                  Refresh Page
                </Button>
              </div>
              {error && (
                <details className="text-xs mt-2">
                  <summary className="cursor-pointer text-muted-foreground">Technical Details</summary>
                  <code className="block mt-1 p-2 bg-muted rounded text-xs">{error}</code>
                </details>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className='cursor-pointer'>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Question Bank</h1>
          <p className="text-muted-foreground">
            Manage questions for exams ({filteredQuestions.length} of {questions.length} questions)
          </p>
        </div>
      </div>

      {/* Permission Warning Banner */}
      {operationError === 'insufficient_permissions' && (
        <Alert variant="destructive">
          <AlertTitle className="flex items-center gap-2">
            🔒 Permission Required
          </AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>You need ADMIN or MODERATOR privileges to create, edit, or delete questions.</p>
              <p className="text-sm">Contact your system administrator to request elevated permissions.</p>
              <Button
                onClick={() => setOperationError(null)}
                variant="outline"
                size="sm"
                className="mt-2 cursor-pointer"
              >
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Action Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              {isSearching ? (
                <RefreshCw className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
              <Input
                placeholder="Search questions..."
                value={searchText}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className='cursor-pointer'
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>

              <Button
                variant="outline"
                className='cursor-pointer'
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>

              <Button className='cursor-pointer' onClick={() => setShowAddQuestion(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label>Subject</Label>
                  <Select
                    value={filters.subject}
                    onValueChange={(value) => handleFilterChange('subject', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Subjects</SelectItem>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Difficulty</Label>
                  <Select
                    value={filters.difficulty}
                    onValueChange={(value) => handleFilterChange('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Difficulties</SelectItem>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Topic</Label>
                  <Select
                    value={filters.topic}
                    onValueChange={(value) => handleFilterChange('topic', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Topics</SelectItem>
                      {topics.map(topic => (
                        <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full cursor-pointer">
                    Clear Filters
                  </Button>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      console.log('Manual filter reset and fetch');
                      setSearchText('');
                      resetFilters();
                      setIsSearching(false);
                      fetchQuestions();
                    }}
                    className="w-full cursor-pointer"
                  >
                    Show All
                  </Button>
                </div>
              </div>

              {/* Tags Filter */}
              <div className="mt-4">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => handleTagFilter(tag)}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {filteredQuestions.map((question) => (
          <Card key={question.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={
                      question.difficulty === 'EASY' ? 'secondary' :
                        question.difficulty === 'MEDIUM' ? 'default' : 'destructive'
                    }>
                      {question.difficulty}
                    </Badge>
                    <Badge variant="outline">{question.subject}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{question.topic}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className='cursor-pointer'
                    onClick={() => setEditingQuestion(question)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className='cursor-pointer'
                    onClick={() => handleDuplicateQuestion(question.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className='cursor-pointer'
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the question.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Question Content with 3-layer support */}
              <div className="mb-3">
                {renderQuestionContent(question)}
              </div>

              {/* NEW: Display Marks */}
              <div className="flex items-center gap-4 mt-2 mb-3 text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-green-700 font-medium">+{question.positiveMarks}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-red-700 font-medium">-{question.negativeMarks}</span>
                </div>
              </div>

              {/* Options with enhanced display */}
              <div className="space-y-1 mb-3">
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${index === question.correctOption
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-600'
                      }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      {/* Text or Image Option Display */}
                      {question.optionTypes && question.optionTypes[index] === 'image' ? (
                        question.optionImages && question.optionImages[index] && (
                          <Image
                            src={question.optionImages[index]}
                            alt={`Option ${String.fromCharCode(65 + index)} image`}
                            width={80}
                            height={60}
                            className="rounded-sm object-contain border bg-white"
                            style={{ minHeight: '60px', maxHeight: '60px' }}
                          />
                        )
                      ) : (
                        <MathDisplay className={index === question.correctOption ? 'font-medium text-green-800' : ''}>
                          {option}
                        </MathDisplay>
                      )}
                    </div>
                    {index === question.correctOption && (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                ))}
              </div>

              {/* Tags */}
              {question.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {question.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {questions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No questions found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by adding your first question.
            </p>
            <Button className='cursor-pointer' onClick={() => setShowAddQuestion(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </CardContent>
        </Card>
      ) : filteredQuestions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No matching questions</h3>
            <p className="text-muted-foreground text-center mb-4">
              Try adjusting your search or filters.
            </p>
            <Button variant="outline" className='cursor-pointer' onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Add/Edit Question Dialog - This is the big update you need! */}
      <Dialog open={showAddQuestion || editingQuestion !== null} onOpenChange={(open) => {
        if (!open) {
          setShowAddQuestion(false);
          setEditingQuestion(null);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
            <DialogDescription>
              {editingQuestion ? 'Update the question details below.' : 'Create a new question for your question bank.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Question Content Section - 3 Flexible Layers */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <h3 className="text-sm font-medium text-muted-foreground">Question Content</h3>

              {/* Row 1 */}
              <div className="space-y-3 p-3 border rounded-lg bg-background">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Row 1</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={editingQuestion?.layer1Type === 'text' || newQuestion.layer1Type === 'text' ? 'default' : 'outline'}
                      size="sm"
                      className='cursor-pointer'
                      onClick={() => {
                        if (editingQuestion) {
                          setEditingQuestion({ ...editingQuestion, layer1Type: 'text', layer1Image: '' });
                        } else {
                          setNewQuestion({ ...newQuestion, layer1Type: 'text', layer1Image: '' });
                        }
                      }}
                    >
                      Text
                    </Button>
                    <Button
                      type="button"
                      variant={editingQuestion?.layer1Type === 'image' || newQuestion.layer1Type === 'image' ? 'default' : 'outline'}
                      size="sm"
                      className='cursor-pointer'
                      onClick={() => {
                        if (editingQuestion) {
                          setEditingQuestion({ ...editingQuestion, layer1Type: 'image', layer1Text: '' });
                        } else {
                          setNewQuestion({ ...newQuestion, layer1Type: 'image', layer1Text: '' });
                        }
                      }}
                    >
                      Image
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className='cursor-pointer'
                      onClick={() => {
                        if (editingQuestion) {
                          setEditingQuestion({ ...editingQuestion, layer1Type: 'none', layer1Text: '', layer1Image: '' });
                        } else {
                          setNewQuestion({ ...newQuestion, layer1Type: 'none', layer1Text: '', layer1Image: '' });
                        }
                      }}
                    >
                      None
                    </Button>
                  </div>
                </div>

                {(editingQuestion?.layer1Type === 'text' || newQuestion.layer1Type === 'text') && (
                  <MathInput
                    label=""
                    value={editingQuestion ? (editingQuestion.layer1Text || '') : (newQuestion.layer1Text || '')}
                    onChange={(value) => {
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, layer1Text: value });
                      } else {
                        setNewQuestion({ ...newQuestion, layer1Text: value });
                      }
                    }}
                    placeholder="Enter text for Layer 1. You can paste math from MathType!"
                  />
                )}

                {(editingQuestion?.layer1Type === 'image' || newQuestion.layer1Type === 'image') && (
                  <ImageUploadComponent
                    label=""
                    placeholder="Upload image for Layer 1"
                    folder="questions/layers"
                    tags="question,layer1"
                    currentImageUrl={editingQuestion?.layer1Image || newQuestion.layer1Image}
                    onImageUpload={(imageUrl) => {
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, layer1Image: imageUrl });
                      } else {
                        setNewQuestion({ ...newQuestion, layer1Image: imageUrl });
                      }
                    }}
                    onImageRemove={() => {
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, layer1Image: '' });
                      } else {
                        setNewQuestion({ ...newQuestion, layer1Image: '' });
                      }
                    }}
                  />
                )}
              </div>

              {/* Row 2 */}
              <div className="space-y-3 p-3 border rounded-lg bg-background">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Row 2</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={editingQuestion?.layer2Type === 'text' || newQuestion.layer2Type === 'text' ? 'default' : 'outline'}
                      size="sm"
                      className='cursor-pointer'
                      onClick={() => {
                        if (editingQuestion) {
                          setEditingQuestion({ ...editingQuestion, layer2Type: 'text', layer2Image: '' });
                        } else {
                          setNewQuestion({ ...newQuestion, layer2Type: 'text', layer2Image: '' });
                        }
                      }}
                    >
                      Text
                    </Button>
                    <Button
                      type="button"
                      variant={editingQuestion?.layer2Type === 'image' || newQuestion.layer2Type === 'image' ? 'default' : 'outline'}
                      size="sm"
                      className='cursor-pointer'
                      onClick={() => {
                        if (editingQuestion) {
                          setEditingQuestion({ ...editingQuestion, layer2Type: 'image', layer2Text: '' });
                        } else {
                          setNewQuestion({ ...newQuestion, layer2Type: 'image', layer2Text: '' });
                        }
                      }}
                    >
                      Image
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className='cursor-pointer'
                      onClick={() => {
                        if (editingQuestion) {
                          setEditingQuestion({ ...editingQuestion, layer2Type: 'none', layer2Text: '', layer2Image: '' });
                        } else {
                          setNewQuestion({ ...newQuestion, layer2Type: 'none', layer2Text: '', layer2Image: '' });
                        }
                      }}
                    >
                      None
                    </Button>
                  </div>
                </div>

                {(editingQuestion?.layer2Type === 'text' || newQuestion.layer2Type === 'text') && (
                  <MathInput
                    label=""
                    value={editingQuestion ? (editingQuestion.layer2Text || '') : (newQuestion.layer2Text || '')}
                    onChange={(value) => {
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, layer2Text: value });
                      } else {
                        setNewQuestion({ ...newQuestion, layer2Text: value });
                      }
                    }}
                    placeholder="Enter text for Layer 2. You can paste math from MathType!"
                  />
                )}

                {(editingQuestion?.layer2Type === 'image' || newQuestion.layer2Type === 'image') && (
                  <ImageUploadComponent
                    label=""
                    placeholder="Upload image for Layer 2"
                    folder="questions/layers"
                    tags="question,layer2"
                    currentImageUrl={editingQuestion?.layer2Image || newQuestion.layer2Image}
                    onImageUpload={(imageUrl) => {
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, layer2Image: imageUrl });
                      } else {
                        setNewQuestion({ ...newQuestion, layer2Image: imageUrl });
                      }
                    }}
                    onImageRemove={() => {
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, layer2Image: '' });
                      } else {
                        setNewQuestion({ ...newQuestion, layer2Image: '' });
                      }
                    }}
                  />
                )}
              </div>

              {/* Row 3 */}
              <div className="space-y-3 p-3 border rounded-lg bg-background">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Row 3</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={editingQuestion?.layer3Type === 'text' || newQuestion.layer3Type === 'text' ? 'default' : 'outline'}
                      size="sm"
                      className='cursor-pointer'
                      onClick={() => {
                        if (editingQuestion) {
                          setEditingQuestion({ ...editingQuestion, layer3Type: 'text', layer3Image: '' });
                        } else {
                          setNewQuestion({ ...newQuestion, layer3Type: 'text', layer3Image: '' });
                        }
                      }}
                    >
                      Text
                    </Button>
                    <Button
                      type="button"
                      variant={editingQuestion?.layer3Type === 'image' || newQuestion.layer3Type === 'image' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        if (editingQuestion) {
                          setEditingQuestion({ ...editingQuestion, layer3Type: 'image', layer3Text: '' });
                        } else {
                          setNewQuestion({ ...newQuestion, layer3Type: 'image', layer3Text: '' });
                        }
                      }}
                    >
                      Image
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className='cursor-pointer'
                      onClick={() => {
                        if (editingQuestion) {
                          setEditingQuestion({ ...editingQuestion, layer3Type: 'none', layer3Text: '', layer3Image: '' });
                        } else {
                          setNewQuestion({ ...newQuestion, layer3Type: 'none', layer3Text: '', layer3Image: '' });
                        }
                      }}
                    >
                      None
                    </Button>
                  </div>
                </div>

                {(editingQuestion?.layer3Type === 'text' || newQuestion.layer3Type === 'text') && (
                  <MathInput
                    label=""
                    value={editingQuestion ? (editingQuestion.layer3Text || '') : (newQuestion.layer3Text || '')}
                    onChange={(value) => {
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, layer3Text: value });
                      } else {
                        setNewQuestion({ ...newQuestion, layer3Text: value });
                      }
                    }}
                    placeholder="Enter text for Layer 3. You can paste math from MathType!"
                  />
                )}

                {(editingQuestion?.layer3Type === 'image' || newQuestion.layer3Type === 'image') && (
                  <ImageUploadComponent
                    label=""
                    placeholder="Upload image for Layer 3"
                    folder="questions/layers"
                    tags="question,layer3"
                    currentImageUrl={editingQuestion?.layer3Image || newQuestion.layer3Image}
                    onImageUpload={(imageUrl) => {
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, layer3Image: imageUrl });
                      } else {
                        setNewQuestion({ ...newQuestion, layer3Image: imageUrl });
                      }
                    }}
                    onImageRemove={() => {
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, layer3Image: '' });
                      } else {
                        setNewQuestion({ ...newQuestion, layer3Image: '' });
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {/* Marking System */}
            <div className="space-y-4 p-4 border rounded-lg bg-green-50/50">
              <h3 className="text-sm font-medium text-muted-foreground">Add Marking</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="positiveMarks" className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    Positive Marking *
                  </Label>
                  <Input
                    id="positiveMarks"
                    type="number"
                    min="0"
                    step="0.5"
                    className='mt-3'
                    value={editingQuestion ? editingQuestion.positiveMarks : newQuestion.positiveMarks}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, positiveMarks: value });
                      } else {
                        setNewQuestion({ ...newQuestion, positiveMarks: value });
                      }
                    }}
                    placeholder="e.g., 4"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="negativeMarks" className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    Negative Marking *
                  </Label>
                  <Input
                    id="negativeMarks"
                    type="number"
                    min="0"
                    step="0.5"
                    className='mt-3'
                    value={editingQuestion ? editingQuestion.negativeMarks : newQuestion.negativeMarks}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, negativeMarks: value });
                      } else {
                        setNewQuestion({ ...newQuestion, negativeMarks: value });
                      }
                    }}
                    placeholder="e.g., 1"
                    required
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-blue-50 p-2 pl-3 rounded">
                Scoring: Correct answer = +{editingQuestion ? editingQuestion.positiveMarks : newQuestion.positiveMarks} marks,
                Wrong answer = -{editingQuestion ? editingQuestion.negativeMarks : newQuestion.negativeMarks} marks
              </div>
            </div>

            {/* Answer Options with Math Support */}
            <div>
              <Label>Answer Options *</Label>
              <div className="space-y-4">
                {(editingQuestion ? editingQuestion.options : newQuestion.options).map((option, index) => (
                  <div key={index} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex gap-2 items-start">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium mt-2">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="flex-1 space-y-3">
                        {/* Option Type Selection */}
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={editingQuestion?.optionTypes?.[index] === 'text' || (newQuestion.optionTypes || ['text', 'text', 'text', 'text'])[index] === 'text' ? 'default' : 'outline'}
                            size="sm"
                            className='cursor-pointer'
                            onClick={() => {
                              const newOptionTypes = editingQuestion
                                ? [...(editingQuestion.optionTypes || ['text', 'text', 'text', 'text'])]
                                : [...(newQuestion.optionTypes || ['text', 'text', 'text', 'text'])];
                              newOptionTypes[index] = 'text';

                              // Clear image when switching to text
                              const newOptionImages = editingQuestion
                                ? [...(editingQuestion.optionImages || ['', '', '', ''])]
                                : [...(newQuestion.optionImages || ['', '', '', ''])];
                              newOptionImages[index] = '';

                              if (editingQuestion) {
                                setEditingQuestion({
                                  ...editingQuestion,
                                  optionTypes: newOptionTypes,
                                  optionImages: newOptionImages
                                });
                              } else {
                                setNewQuestion({
                                  ...newQuestion,
                                  optionTypes: newOptionTypes,
                                  optionImages: newOptionImages
                                });
                              }
                            }}
                          >
                            Text
                          </Button>
                          <Button
                            type="button"
                            variant={editingQuestion?.optionTypes?.[index] === 'image' || (newQuestion.optionTypes || ['text', 'text', 'text', 'text'])[index] === 'image' ? 'default' : 'outline'}
                            size="sm"
                            className='cursor-pointer'
                            onClick={() => {
                              const newOptionTypes = editingQuestion
                                ? [...(editingQuestion.optionTypes || ['text', 'text', 'text', 'text'])]
                                : [...(newQuestion.optionTypes || ['text', 'text', 'text', 'text'])];
                              newOptionTypes[index] = 'image';

                              // Clear text when switching to image
                              const newOptions = editingQuestion
                                ? [...(editingQuestion.options || ['', '', '', ''])]
                                : [...(newQuestion.options || ['', '', '', ''])];
                              newOptions[index] = '';

                              if (editingQuestion) {
                                setEditingQuestion({
                                  ...editingQuestion,
                                  optionTypes: newOptionTypes,
                                  options: newOptions
                                });
                              } else {
                                setNewQuestion({
                                  ...newQuestion,
                                  optionTypes: newOptionTypes,
                                  options: newOptions
                                });
                              }
                            }}
                          >
                            Image
                          </Button>
                        </div>

                        {/* Text Option with Math Support */}
                        {(editingQuestion?.optionTypes?.[index] === 'text' || (newQuestion.optionTypes || ['text', 'text', 'text', 'text'])[index] === 'text') && (
                          <MathInput
                            label=""
                            value={option}
                            onChange={(value) => {
                              const newOptions = [...(editingQuestion ? (editingQuestion.options || ['', '', '', '']) : (newQuestion.options || ['', '', '', '']))];
                              newOptions[index] = value;
                              if (editingQuestion) {
                                setEditingQuestion({ ...editingQuestion, options: newOptions });
                              } else {
                                setNewQuestion({ ...newQuestion, options: newOptions });
                              }
                            }}
                            placeholder={`Enter option ${String.fromCharCode(65 + index)} text. Paste math from MathType!`}
                            required
                          />
                        )}

                        {/* Image Option */}
                        {(editingQuestion?.optionTypes?.[index] === 'image' || (newQuestion.optionTypes || ['text', 'text', 'text', 'text'])[index] === 'image') && (
                          <ImageUploadComponent
                            label=""
                            placeholder={`Upload image for option ${String.fromCharCode(65 + index)}`}
                            folder="questions/options"
                            tags={`question,option,option-${index}`}
                            currentImageUrl={
                              (editingQuestion?.optionImages || ['', '', '', ''])[index] ||
                              (newQuestion.optionImages || ['', '', '', ''])[index]
                            }
                            onImageUpload={(imageUrl) => {
                              const newOptionImages = editingQuestion
                                ? [...(editingQuestion.optionImages || ['', '', '', ''])]
                                : [...(newQuestion.optionImages || ['', '', '', ''])];
                              newOptionImages[index] = imageUrl;

                              if (editingQuestion) {
                                setEditingQuestion({ ...editingQuestion, optionImages: newOptionImages });
                              } else {
                                setNewQuestion({ ...newQuestion, optionImages: newOptionImages });
                              }
                            }}
                            onImageRemove={() => {
                              const newOptionImages = editingQuestion
                                ? [...(editingQuestion.optionImages || ['', '', '', ''])]
                                : [...(newQuestion.optionImages || ['', '', '', ''])];
                              newOptionImages[index] = '';

                              if (editingQuestion) {
                                setEditingQuestion({ ...editingQuestion, optionImages: newOptionImages });
                              } else {
                                setNewQuestion({ ...newQuestion, optionImages: newOptionImages });
                              }
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Correct Answer */}
            <div>
              <Label>Correct Answer *</Label>
              <Select
                value={(editingQuestion ? editingQuestion.correctOption : newQuestion.correctOption).toString()}
                onValueChange={(value) => {
                  const correctOption = parseInt(value);
                  if (editingQuestion) {
                    setEditingQuestion({ ...editingQuestion, correctOption });
                  } else {
                    setNewQuestion({ ...newQuestion, correctOption });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3].map((index) => (
                    <SelectItem key={index} value={index.toString()}>
                      Option {String.fromCharCode(65 + index)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Question Explanation Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50">
              <h3 className="text-sm font-medium text-muted-foreground">Question Explanation (Optional)</h3>
              <p className="text-xs text-muted-foreground">
                Provide an explanation for why the correct answer is correct. This will help students understand the solution.
              </p>

              <div className="space-y-3 p-3 border rounded-lg bg-background">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Explanation Type</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={editingQuestion?.explanationType === 'text' || newQuestion.explanationType === 'text' ? 'default' : 'outline'}
                      size="sm"
                      className='cursor-pointer'
                      onClick={() => {
                        if (editingQuestion) {
                          setEditingQuestion({ ...editingQuestion, explanationType: 'text', explanationImage: '' });
                        } else {
                          setNewQuestion({ ...newQuestion, explanationType: 'text', explanationImage: '' });
                        }
                      }}
                    >
                      Text
                    </Button>
                    <Button
                      type="button"
                      variant={editingQuestion?.explanationType === 'image' || newQuestion.explanationType === 'image' ? 'default' : 'outline'}
                      size="sm"
                      className='cursor-pointer'
                      onClick={() => {
                        if (editingQuestion) {
                          setEditingQuestion({ ...editingQuestion, explanationType: 'image', explanationText: '' });
                        } else {
                          setNewQuestion({ ...newQuestion, explanationType: 'image', explanationText: '' });
                        }
                      }}
                    >
                      Image
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className='cursor-pointer'
                      onClick={() => {
                        if (editingQuestion) {
                          setEditingQuestion({ ...editingQuestion, explanationType: 'none', explanationText: '', explanationImage: '' });
                        } else {
                          setNewQuestion({ ...newQuestion, explanationType: 'none', explanationText: '', explanationImage: '' });
                        }
                      }}
                    >
                      None
                    </Button>
                  </div>
                </div>

                {/* Text Explanation with Math Support */}
                {(editingQuestion?.explanationType === 'text' || newQuestion.explanationType === 'text') && (
                  <MathInput
                    label=""
                    value={editingQuestion ? (editingQuestion.explanationText || '') : (newQuestion.explanationText || '')}
                    onChange={(value) => {
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, explanationText: value });
                      } else {
                        setNewQuestion({ ...newQuestion, explanationText: value });
                      }
                    }}
                    placeholder="Explain why the correct answer is correct"
                  />
                )}

                {/* Image Explanation */}
                {(editingQuestion?.explanationType === 'image' || newQuestion.explanationType === 'image') && (
                  <ImageUploadComponent
                    label=""
                    placeholder="Upload an image explanation (diagram, solution steps, etc.)"
                    folder="questions/explanations"
                    tags="question,explanation"
                    currentImageUrl={editingQuestion?.explanationImage || newQuestion.explanationImage}
                    onImageUpload={(imageUrl) => {
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, explanationImage: imageUrl });
                      } else {
                        setNewQuestion({ ...newQuestion, explanationImage: imageUrl });
                      }
                    }}
                    onImageRemove={() => {
                      if (editingQuestion) {
                        setEditingQuestion({ ...editingQuestion, explanationImage: '' });
                      } else {
                        setNewQuestion({ ...newQuestion, explanationImage: '' });
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {/* Subject and Topic */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={editingQuestion ? editingQuestion.subject : newQuestion.subject}
                  onChange={(e) => {
                    if (editingQuestion) {
                      setEditingQuestion({ ...editingQuestion, subject: e.target.value });
                    } else {
                      setNewQuestion({ ...newQuestion, subject: e.target.value });
                    }
                  }}
                  placeholder="e.g., Mathematics"
                  required
                />
              </div>
              <div>
                <Label htmlFor="topic">Topic *</Label>
                <Input
                  id="topic"
                  value={editingQuestion ? editingQuestion.topic : newQuestion.topic}
                  onChange={(e) => {
                    if (editingQuestion) {
                      setEditingQuestion({ ...editingQuestion, topic: e.target.value });
                    } else {
                      setNewQuestion({ ...newQuestion, topic: e.target.value });
                    }
                  }}
                  placeholder="e.g., Algebra"
                  required
                />
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <Label>Difficulty *</Label>
              <Select
                value={editingQuestion ? editingQuestion.difficulty : newQuestion.difficulty}
                onValueChange={(value: QuestionDifficulty) => {
                  if (editingQuestion) {
                    setEditingQuestion({ ...editingQuestion, difficulty: value });
                  } else {
                    setNewQuestion({ ...newQuestion, difficulty: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={editingQuestion ? editingQuestion.tags.join(', ') : (newQuestion.tags || []).join(', ')}
                onChange={(e) => {
                  const tags = e.target.value.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
                  if (editingQuestion) {
                    setEditingQuestion({ ...editingQuestion, tags });
                  } else {
                    setNewQuestion({ ...newQuestion, tags });
                  }
                }}
                placeholder="Enter tags separated by commas"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                className='cursor-pointer'
                onClick={() => {
                  setShowAddQuestion(false);
                  setEditingQuestion(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className='cursor-pointer'
                onClick={() => {
                  if (editingQuestion) {
                    handleEditQuestion(editingQuestion);
                  } else {
                    handleAddQuestion();
                  }
                }}
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {editingQuestion ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingQuestion ? 'Update Question' : 'Add Question'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedQuestionBank;