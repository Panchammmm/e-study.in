'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateQuestionRequest } from '@/constants/types';
import { Upload, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BulkUploadFormProps {
  onUpload: (questions: CreateQuestionRequest[]) => void;
}

export const BulkUploadForm: React.FC<BulkUploadFormProps> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<CreateQuestionRequest[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const parseFile = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const content = await file.text();
      let questions: CreateQuestionRequest[] = [];

      if (file.name.endsWith('.json')) {
        // Parse JSON file
        questions = JSON.parse(content);
      } else if (file.name.endsWith('.csv')) {
        // Simple CSV parsing (this would need to be more robust in production)
        setError('CSV format is not supported yet. Please use JSON format.');
        setIsLoading(false);
        return;
      } else {
        setError('Unsupported file format. Please upload a JSON file.');
        setIsLoading(false);
        return;
      }

      if (!Array.isArray(questions)) {
        setError('The file must contain an array of questions');
        setIsLoading(false);
        return;
      }

      if (questions.length === 0) {
        setError('No questions found in the file');
        setIsLoading(false);
        return;
      }

      setParsedQuestions(questions);
      setIsPreviewMode(true);
    } catch (error) {
      console.error('Error parsing file:', error);
      setError('Failed to parse file. Please ensure it is a valid JSON format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = () => {
    if (parsedQuestions.length === 0) {
      setError('No questions to upload');
      return;
    }

    onUpload(parsedQuestions);
  };

  return (
    <div className="space-y-4">
      {isPreviewMode ? (
        <div className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>File Parsed Successfully</AlertTitle>
            <AlertDescription>
              {parsedQuestions.length} questions found in the file. Click &quot;Upload&quot; to add them to your question bank.
            </AlertDescription>
          </Alert>

          <div className="max-h-60 overflow-y-auto border rounded-md p-4">
            <h3 className="font-medium mb-2">Preview ({parsedQuestions.length} questions):</h3>
            <ul className="space-y-2">
              {parsedQuestions.slice(0, 5).map((q, index) => (
                <li key={index} className="text-sm p-2 bg-gray-50 rounded">
                  <div className="font-medium">{q.content || 'No content'}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    {q.subject || 'No subject'} • {q.difficulty || 'No difficulty'}
                  </div>
                </li>
              ))}
              {parsedQuestions.length > 5 && (
                <li className="text-sm text-gray-500 italic">
                  ...and {parsedQuestions.length - 5} more questions
                </li>
              )}
            </ul>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
              Back
            </Button>
            <Button onClick={handleUpload} disabled={isLoading}>
              {isLoading ? 'Uploading...' : 'Upload Questions'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload File</Label>
            <div className="border-2 border-dashed rounded-md p-6 text-center">
              <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <div className="text-sm text-gray-500 mb-4">
                Upload a JSON file containing your questions
              </div>
              <Input
                id="file-upload"
                type="file"
                accept=".json,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="mb-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select File
              </Button>
              {file && (
                <div className="text-sm mt-2">
                  Selected: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-500">
            <div className="font-medium mb-1">Format Requirements:</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>JSON file with an array of question objects</li>
              <li>Each question must include content, options, and correctOption</li>
              <li>Include subject, difficulty, and topic for better organization</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" disabled={isLoading} onClick={() => setFile(null)}>
              Clear
            </Button>
            <Button onClick={parseFile} disabled={!file || isLoading}>
              {isLoading ? 'Processing...' : 'Process File'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
