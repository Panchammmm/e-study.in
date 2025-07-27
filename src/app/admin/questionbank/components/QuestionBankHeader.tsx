'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Grid, 
  List, 
  RefreshCw, 
  Plus 
} from 'lucide-react';

interface QuestionBankHeaderProps {
  searchText: string;
  viewMode: 'grid' | 'list';
  isSearching: boolean;
  showFilters: boolean;
  questionsCount: number;
  filteredCount: number;
  onBack: () => void;
  onSearchChange: (value: string) => void;
  onViewModeChange: () => void;
  onToggleFilters: () => void;
  onAddQuestion: () => void;
  onRefresh: () => void;
}

export const QuestionBankHeader: React.FC<QuestionBankHeaderProps> = ({
  searchText,
  viewMode,
  isSearching,
  showFilters,
  questionsCount,
  filteredCount,
  onBack,
  onSearchChange,
  onViewModeChange,
  onToggleFilters,
  onAddQuestion,
  onRefresh
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Question Bank</h1>
        <Badge variant="outline" className="ml-2">
          {filteredCount} of {questionsCount} questions
        </Badge>
      </div>
      
      <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search questions..."
            className="pl-8 w-full"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {isSearching && (
            <div className="absolute right-2.5 top-2.5">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onToggleFilters}
            className={showFilters ? "bg-secondary" : ""}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          
          <Button variant="outline" onClick={onViewModeChange}>
            {viewMode === 'grid' ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid className="h-4 w-4" />
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onRefresh}
            title="Refresh questions"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button onClick={onAddQuestion}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>
      </div>
    </div>
  );
};

