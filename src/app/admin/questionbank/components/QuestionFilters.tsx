'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface QuestionFiltersProps {
  filters: {
    difficulty?: string;
    subject?: string;
    topic?: string;
    tags?: string[];
    [key: string]: any;
  };
  subjects: string[];
  topics: string[];
  allTags: string[];
  onFilterChange: (key: string, value: string) => void;
  onTagFilter: (tag: string) => void;
  onClearFilters: () => void;
}

export const QuestionFilters: React.FC<QuestionFiltersProps> = ({
  filters,
  subjects,
  topics,
  allTags,
  onFilterChange,
  onTagFilter,
  onClearFilters
}) => {
  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Filter Questions</h3>
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select 
              value={filters.difficulty || ''} 
              onValueChange={(value) => onFilterChange('difficulty', value)}
            >
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Any difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any difficulty</SelectItem>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select 
              value={filters.subject || ''} 
              onValueChange={(value) => onFilterChange('subject', value)}
            >
              <SelectTrigger id="subject">
                <SelectValue placeholder="Any subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any subject</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Select 
              value={filters.topic || ''} 
              onValueChange={(value) => onFilterChange('topic', value)}
            >
              <SelectTrigger id="topic">
                <SelectValue placeholder="Any topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any topic</SelectItem>
                {topics.map(topic => (
                  <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                ))}
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
                  variant={filters.tags?.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => onTagFilter(tag)}
                >
                  {tag}
                  {filters.tags?.includes(tag) && (
                    <CheckCircle className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
