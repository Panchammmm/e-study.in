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
  CheckCircle,
  Grid,
  List,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Question, CreateQuestionRequest } from '@/constants/types';
import {
  useQuestions,
  useFilteredQuestions,
  useQuestionsLoading,
  useQuestionsError,
  useQuestionActions,
  useQuestionFilters,
  useStoreInitialization
} from '@/store';

// Define custom extended filters interface
interface ExtendedQuestionFilters {
  subject: string;
  difficulty: string;
  topic: string;
  search: string;
  tags?: string[];
}

// Import UI components
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { QuestionForm } from '../components/forms/QuestionForm';

// Temporary inline BulkUploadForm until module resolution is fixed
const BulkUploadForm = ({ onUpload }: { onUpload: (questions: CreateQuestionRequest[]) => void }) => {
  return (
    <div className="p-4 text-center">
      <p className="mb-4">Upload a JSON file with an array of question objects.</p>
      <Button onClick={() => {
        // Mock upload for now
        const mockQuestions: CreateQuestionRequest[] = [{
          content: 'Sample question',
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
          options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          optionImages: ['', '', '', ''],
          optionTypes: ['text', 'text', 'text', 'text'],
          correctOption: 0,
          positiveMarks: 4,
          negativeMarks: 1,
          explanationType: 'none',
          explanationText: '',
          explanationImage: '',
          difficulty: 'EASY',
          subject: 'General',
          topic: 'Sample',
          tags: ['sample'],
        }];
        onUpload(mockQuestions);
      }}>
        Upload Sample Question
      </Button>
    </div>
  );
};

interface QuestionBankContainerProps {
  onBack: () => void;
  onSelectQuestions?: (questions: Question[]) => void;
  multiSelect?: boolean;
  preSelectedQuestions?: string[];
}

export const QuestionBankContainer: React.FC<QuestionBankContainerProps> = ({
  onBack,
  onSelectQuestions,
  multiSelect = false,
  preSelectedQuestions = []
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
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(preSelectedQuestions || []);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

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

  // Handle tag filter changes
  const handleTagFilter = async (tag: string) => {
    console.log('Tag filter:', tag);
    // Create a custom filter object that includes tags
    const customFilters = filters as ExtendedQuestionFilters;
    
    const currentTags = customFilters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t: string) => t !== tag)
      : [...currentTags, tag];

    try {
      // Set filters with a type assertion since our store might not have the tags property yet
      await setFilters({ ...filters, tags: newTags } as ExtendedQuestionFilters);
    } catch (error) {
      console.error('Tag filter error:', error);
    }
  };

  // Clear all filters
  const clearFilters = async () => {
    console.log('Clearing filters');
    try {
      await resetFilters();
      setSearchText('');
    } catch (error) {
      console.error('Clear filters error:', error);
    }
  };

  // Toggle view mode between grid and list
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  // Toggle question selection for multi-select mode
  const toggleSelection = (questionId: string) => {
    if (!multiSelect) {
      const newSelectedQuestions = selectedQuestions.includes(questionId) ? [] : [questionId];
      setSelectedQuestions(newSelectedQuestions);
      
      if (onSelectQuestions) {
        const selectedQuestionObjects = questions.filter(q => newSelectedQuestions.includes(q.id));
        onSelectQuestions(selectedQuestionObjects);
      }
      return;
    }
    
    const newSelectedQuestions = selectedQuestions.includes(questionId)
      ? selectedQuestions.filter(id => id !== questionId)
      : [...selectedQuestions, questionId];
    
    setSelectedQuestions(newSelectedQuestions);
    
    if (onSelectQuestions) {
      const selectedQuestionObjects = questions.filter(q => newSelectedQuestions.includes(q.id));
      onSelectQuestions(selectedQuestionObjects);
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

      let errorMessage = 'Failed to add question';
      let errorTitle = 'Error';

      const errorMsg = error instanceof Error ? error.message :
        (error && typeof error === 'object' && 'message' in error) ?
          String((error as { message: unknown }).message) :
          'Unknown error';

      if (errorMsg.includes('permission') || errorMsg.includes('403')) {
        errorTitle = 'Permission Denied';
        errorMessage = 'You do not have permission to create questions. Please contact your administrator to get ADMIN or MODERATOR access.';
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

  // Handle editing a question
  const handleEditQuestion = async (updatedQuestion: Question) => {
    try {
      setIsUpdating(true);
      await updateQuestion(updatedQuestion.id, updatedQuestion);

      setEditingQuestion(null);
      toast({
        title: 'Success',
        description: 'Question updated successfully'
      });
    } catch (error: unknown) {
      console.error('Failed to update question:', error);

      let errorMessage = 'Failed to update question';
      let errorTitle = 'Error';

      const errorMsg = error instanceof Error ? error.message :
        (error && typeof error === 'object' && 'message' in error) ?
          String((error as { message: unknown }).message) :
          'Unknown error';

      if (errorMsg.includes('permission') || errorMsg.includes('403')) {
        errorTitle = 'Permission Denied';
        errorMessage = 'You do not have permission to update questions. Please contact your administrator to get ADMIN or MODERATOR access.';
      } else if (errorMsg.includes('401') || errorMsg.includes('Authentication')) {
        errorTitle = 'Authentication Required';
        errorMessage = 'Your session has expired. Please log in again.';
      } else {
        errorMessage = errorMsg || 'An unexpected error occurred while updating the question.';
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

  // Handle deleting a question
  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteQuestion(id);
      toast({
        title: 'Success',
        description: 'Question deleted successfully'
      });
    } catch (error: unknown) {
      console.error('Failed to delete question:', error);

      let errorMessage = 'Failed to delete question';
      let errorTitle = 'Error';

      const errorMsg = error instanceof Error ? error.message :
        (error && typeof error === 'object' && 'message' in error) ?
          String((error as { message: unknown }).message) :
          'Unknown error';

      if (errorMsg.includes('permission') || errorMsg.includes('403')) {
        errorTitle = 'Permission Denied';
        errorMessage = 'You do not have permission to delete questions. Please contact your administrator to get ADMIN or MODERATOR access.';
      } else if (errorMsg.includes('401') || errorMsg.includes('Authentication')) {
        errorTitle = 'Authentication Required';
        errorMessage = 'Your session has expired. Please log in again.';
      } else {
        errorMessage = errorMsg || 'An unexpected error occurred while deleting the question.';
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async (questions: CreateQuestionRequest[]) => {
    try {
      for (const question of questions) {
        await createQuestion(question);
      }
      
      toast({
        title: 'Success',
        description: `${questions.length} questions uploaded successfully`
      });
      
      setShowBulkUpload(false);
    } catch (error: unknown) {
      console.error('Failed to upload questions:', error);

      const errorMessage = 'Failed to upload questions';
      const errorTitle = 'Error';

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  // Render component
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="border-b bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Question Bank</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBulkUpload(true)}
              className="hidden sm:flex"
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Button
              onClick={() => setShowAddQuestion(true)}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Question</span>
            </Button>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search questions..."
              className="pl-9"
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {isSearching && (
              <div className="absolute right-2 top-2">
                <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
              </div>
            )}
          </div>
          <Button
            variant="outline"
            onClick={toggleFilters}
            className="sm:w-auto w-full justify-center gap-1"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
          <Button
            variant="outline"
            onClick={toggleViewMode}
            className="sm:w-auto w-full justify-center gap-1"
          >
            {viewMode === 'grid' ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid className="h-4 w-4" />
            )}
            <span className="sr-only">{viewMode === 'grid' ? 'List View' : 'Grid View'}</span>
          </Button>
        </div>
        
        {/* Filter panel */}
        {showFilters && (
          <div className="mt-4 border rounded-md p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Filter Questions</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-7 text-xs"
              >
                Clear All
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="subject-filter">Subject</Label>
                <Select 
                  value={filters.subject} 
                  onValueChange={(value) => handleFilterChange('subject', value)}
                >
                  <SelectTrigger id="subject-filter">
                    <SelectValue placeholder="All Subjects" />
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
                <Label htmlFor="topic-filter">Topic</Label>
                <Select 
                  value={filters.topic} 
                  onValueChange={(value) => handleFilterChange('topic', value)}
                >
                  <SelectTrigger id="topic-filter">
                    <SelectValue placeholder="All Topics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Topics</SelectItem>
                    {topics.map(topic => (
                      <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="difficulty-filter">Difficulty</Label>
                <Select 
                  value={filters.difficulty} 
                  onValueChange={(value) => handleFilterChange('difficulty', value)}
                >
                  <SelectTrigger id="difficulty-filter">
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Difficulties</SelectItem>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {allTags.length > 0 && (
              <div className="mt-4">
                <Label className="mb-2 block">Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <Badge 
                      key={tag}
                      variant={(filters as ExtendedQuestionFilters).tags?.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTagFilter(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-4 bg-gray-100 overflow-auto">
        {/* Loading state */}
        {isLoading && (
          <LoadingSpinner />
        )}
        
        {/* Error state */}
        {error && !isLoading && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error loading questions</AlertTitle>
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchQuestions()}
                className="mt-2 w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Empty state */}
        {!isLoading && !error && filteredQuestions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <BookOpen className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">No questions found</h3>
            <p className="text-gray-500 mb-4 max-w-md">
              {questions.length === 0
                ? "Your question bank is empty. Add questions to get started."
                : "No questions match your current filters. Try adjusting your search or filters."}
            </p>
            {questions.length === 0 ? (
              <Button onClick={() => setShowAddQuestion(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            ) : (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        )}
        
        {/* Questions grid/list */}
        {!isLoading && !error && filteredQuestions.length > 0 && (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "space-y-4"
          }>
            {filteredQuestions.map(question => (
              <Card 
                key={question.id} 
                className={`overflow-hidden transition-all hover:shadow-md ${
                  selectedQuestions.includes(question.id) ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => multiSelect && toggleSelection(question.id)}
              >
                <CardHeader className="p-4 pb-2 flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      question.difficulty === 'EASY' ? 'outline' :
                      question.difficulty === 'MEDIUM' ? 'secondary' : 'destructive'
                    }>
                      {question.difficulty}
                    </Badge>
                    {multiSelect && (
                      <div className="h-5 w-5 rounded-full border flex items-center justify-center">
                        {selectedQuestions.includes(question.id) && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingQuestion(question);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
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
                          <AlertDialogAction
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 pt-2">
                  <div className="mb-3">
                    <div className="text-sm text-gray-500 mb-1">
                      {question.subject} {question.topic && `• ${question.topic}`}
                    </div>
                    <div className="font-medium break-words">
                      {question.content}
                      {question.questionImage && (
                        <div className="mt-2">
                          <Image
                            src={question.questionImage}
                            alt="Question"
                            width={300}
                            height={200}
                            className="rounded-md object-contain max-h-40"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {Array.isArray(question.options) && question.options.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <div className="text-sm font-medium">Options:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {question.options.map((option, i) => (
                          <div 
                            key={i}
                            className={`text-sm p-2 rounded-md border ${
                              question.correctOption === i ? 'bg-green-50 border-green-200' : ''
                            }`}
                          >
                            {option}
                            {question.optionImages && question.optionImages[i] && (
                              <div className="mt-1">
                                <Image
                                  src={question.optionImages[i]}
                                  alt={`Option ${i+1}`}
                                  width={100}
                                  height={60}
                                  className="rounded-md object-contain max-h-16"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {question.tags && question.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {question.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Add Question Dialog */}
      <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
            <DialogDescription>
              Create a new question for your question bank.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <QuestionForm
              question={newQuestion}
              onChange={setNewQuestion}
              isSubmitting={isCreating}
              onSubmit={handleAddQuestion}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Question Dialog */}
      {editingQuestion && (
        <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
              <DialogDescription>
                Update the details of this question.
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4">
              <QuestionForm
                question={editingQuestion}
                onChange={(updatedQuestion) => {
                  // Type assertion to handle different types correctly
                  setEditingQuestion(updatedQuestion as Question);
                }}
                isSubmitting={isUpdating}
                onSubmit={() => handleEditQuestion(editingQuestion)}
                isEditMode
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Upload Questions</DialogTitle>
            <DialogDescription>
              Upload multiple questions at once using CSV or JSON format.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <BulkUploadForm onUpload={handleBulkUpload} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
