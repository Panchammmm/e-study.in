'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, RefreshCw } from 'lucide-react';
import { CreateQuestionRequest } from '@/constants/types';

interface BulkUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (questions: CreateQuestionRequest[]) => void;
}

export const BulkUploadDialog: React.FC<BulkUploadDialogProps> = ({
  isOpen,
  onClose,
  onUpload
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      // Create a sample question for now - in a real app this would come from file parsing
      const sampleQuestions: CreateQuestionRequest[] = [{
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
      await onUpload(sampleQuestions);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Upload Questions</DialogTitle>
          <DialogDescription>
            Upload questions from CSV or Excel file
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Drop your file here or click to browse</p>
            <p className="text-sm text-gray-500">Supports CSV and Excel files</p>
            <Button variant="outline" className="mt-4 cursor-pointer">
              Choose File
            </Button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">File Format Requirements:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Column 1: Question Content (text or &quot;legacy&quot; content)</li>
              <li>• Column 2: Option A</li>
              <li>• Column 3: Option B</li>
              <li>• Column 4: Option C</li>
              <li>• Column 5: Option D</li>
              <li>• Column 6: Correct Answer (A, B, C, or D)</li>
              <li>• Column 7: Subject</li>
              <li>• Column 8: Topic</li>
              <li>• Column 9: Difficulty (EASY, MEDIUM, HARD)</li>
              <li>• Column 10: Positive Marks (number)</li>
              <li>• Column 11: Negative Marks (number)</li>
              <li>• Column 12: Tags (comma-separated)</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" className="cursor-pointer" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={isUploading}
              className="cursor-pointer"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Questions'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
