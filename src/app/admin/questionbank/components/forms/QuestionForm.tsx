'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUploadComponent from '@/components/ui/image-upload';
import MathInput from '../math-input';
import { Question, CreateQuestionRequest, QuestionDifficulty } from '@/constants/types';

interface QuestionFormProps {
  question: Question | CreateQuestionRequest;
  onChange: (question: Question | CreateQuestionRequest) => void;
  isSubmitting?: boolean;
  onSubmit?: () => void;
  isEditMode?: boolean;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  onChange,
  isSubmitting = false,
  onSubmit,
  isEditMode = false
}) => {
  const updateQuestion = (updates: Partial<Question | CreateQuestionRequest>) => {
    onChange({ ...question, ...updates });
  };

  return (
    <div className="space-y-6">
      {/* Legacy Question Content (for backward compatibility) */}
      <div>
        <Label>Question Content (Legacy)</Label>
        <MathInput
          label=""
          value={question.content || ''}
          onChange={(value) => updateQuestion({ content: value })}
          placeholder="Enter the question text. You can paste math from MathType!"
        />
      </div>

      {/* NEW: 3-Layer Question System */}
      <div className="space-y-4 p-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/30">
        <h3 className="text-sm font-medium text-blue-900">📝 Enhanced Question Structure</h3>
        <p className="text-xs text-blue-700">
          Use the 3-layer system to create complex questions with mixed text and images. Each layer can be either text (with math support) or an image.
        </p>

        {/* Row 1 */}
        <div className="space-y-3 p-3 border rounded-lg bg-background">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Row 1</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={question.layer1Type === 'text' ? 'default' : 'outline'}
                size="sm"
                className='cursor-pointer'
                onClick={() => updateQuestion({ layer1Type: 'text', layer1Image: '' })}
              >
                Text
              </Button>
              <Button
                type="button"
                variant={question.layer1Type === 'image' ? 'default' : 'outline'}
                size="sm"
                className='cursor-pointer'
                onClick={() => updateQuestion({ layer1Type: 'image', layer1Text: '' })}
              >
                Image
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className='cursor-pointer'
                onClick={() => updateQuestion({ layer1Type: 'none', layer1Text: '', layer1Image: '' })}
              >
                None
              </Button>
            </div>
          </div>

          {question.layer1Type === 'text' && (
            <MathInput
              label=""
              value={question.layer1Text || ''}
              onChange={(value) => updateQuestion({ layer1Text: value })}
              placeholder="Enter text for Layer 1. You can paste math from MathType!"
            />
          )}

          {question.layer1Type === 'image' && (
            <ImageUploadComponent
              label=""
              placeholder="Upload image for Layer 1"
              folder="questions/layers"
              tags="question,layer1"
              currentImageUrl={question.layer1Image}
              onImageUpload={(imageUrl) => updateQuestion({ layer1Image: imageUrl })}
              onImageRemove={() => updateQuestion({ layer1Image: '' })}
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
                variant={question.layer2Type === 'text' ? 'default' : 'outline'}
                size="sm"
                className='cursor-pointer'
                onClick={() => updateQuestion({ layer2Type: 'text', layer2Image: '' })}
              >
                Text
              </Button>
              <Button
                type="button"
                variant={question.layer2Type === 'image' ? 'default' : 'outline'}
                size="sm"
                className='cursor-pointer'
                onClick={() => updateQuestion({ layer2Type: 'image', layer2Text: '' })}
              >
                Image
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className='cursor-pointer'
                onClick={() => updateQuestion({ layer2Type: 'none', layer2Text: '', layer2Image: '' })}
              >
                None
              </Button>
            </div>
          </div>

          {question.layer2Type === 'text' && (
            <MathInput
              label=""
              value={question.layer2Text || ''}
              onChange={(value) => updateQuestion({ layer2Text: value })}
              placeholder="Enter text for Layer 2. You can paste math from MathType!"
            />
          )}

          {question.layer2Type === 'image' && (
            <ImageUploadComponent
              label=""
              placeholder="Upload image for Layer 2"
              folder="questions/layers"
              tags="question,layer2"
              currentImageUrl={question.layer2Image}
              onImageUpload={(imageUrl) => updateQuestion({ layer2Image: imageUrl })}
              onImageRemove={() => updateQuestion({ layer2Image: '' })}
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
                variant={question.layer3Type === 'text' ? 'default' : 'outline'}
                size="sm"
                className='cursor-pointer'
                onClick={() => updateQuestion({ layer3Type: 'text', layer3Image: '' })}
              >
                Text
              </Button>
              <Button
                type="button"
                variant={question.layer3Type === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateQuestion({ layer3Type: 'image', layer3Text: '' })}
              >
                Image
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className='cursor-pointer'
                onClick={() => updateQuestion({ layer3Type: 'none', layer3Text: '', layer3Image: '' })}
              >
                None
              </Button>
            </div>
          </div>

          {question.layer3Type === 'text' && (
            <MathInput
              label=""
              value={question.layer3Text || ''}
              onChange={(value) => updateQuestion({ layer3Text: value })}
              placeholder="Enter text for Layer 3. You can paste math from MathType!"
            />
          )}

          {question.layer3Type === 'image' && (
            <ImageUploadComponent
              label=""
              placeholder="Upload image for Layer 3"
              folder="questions/layers"
              tags="question,layer3"
              currentImageUrl={question.layer3Image}
              onImageUpload={(imageUrl) => updateQuestion({ layer3Image: imageUrl })}
              onImageRemove={() => updateQuestion({ layer3Image: '' })}
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
              value={question.positiveMarks}
              onChange={(e) => updateQuestion({ positiveMarks: parseFloat(e.target.value) || 0 })}
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
              value={question.negativeMarks}
              onChange={(e) => updateQuestion({ negativeMarks: parseFloat(e.target.value) || 0 })}
              placeholder="e.g., 1"
              required
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground bg-blue-50 p-2 pl-3 rounded">
          Scoring: Correct answer = +{question.positiveMarks} marks,
          Wrong answer = -{question.negativeMarks} marks
        </div>
      </div>

      {/* Answer Options with Math Support */}
      <div>
        <Label>Answer Options *</Label>
        <div className="space-y-4">
          {question.options.map((option, index) => (
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
                      variant={(question.optionTypes || ['text', 'text', 'text', 'text'])[index] === 'text' ? 'default' : 'outline'}
                      size="sm"
                      className='cursor-pointer'
                      onClick={() => {
                        const newOptionTypes = [...(question.optionTypes || ['text', 'text', 'text', 'text'])];
                        newOptionTypes[index] = 'text';
                        const newOptionImages = [...(question.optionImages || ['', '', '', ''])];
                        newOptionImages[index] = '';
                        updateQuestion({ optionTypes: newOptionTypes, optionImages: newOptionImages });
                      }}
                    >
                      Text
                    </Button>
                    <Button
                      type="button"
                      variant={(question.optionTypes || ['text', 'text', 'text', 'text'])[index] === 'image' ? 'default' : 'outline'}
                      size="sm"
                      className='cursor-pointer'
                      onClick={() => {
                        const newOptionTypes = [...(question.optionTypes || ['text', 'text', 'text', 'text'])];
                        newOptionTypes[index] = 'image';
                        const newOptions = [...(question.options || ['', '', '', ''])];
                        newOptions[index] = '';
                        updateQuestion({ optionTypes: newOptionTypes, options: newOptions });
                      }}
                    >
                      Image
                    </Button>
                  </div>

                  {/* Text Option with Math Support */}
                  {(question.optionTypes || ['text', 'text', 'text', 'text'])[index] === 'text' && (
                    <MathInput
                      label=""
                      value={option}
                      onChange={(value) => {
                        const newOptions = [...(question.options || ['', '', '', ''])];
                        newOptions[index] = value;
                        updateQuestion({ options: newOptions });
                      }}
                      placeholder={`Enter option ${String.fromCharCode(65 + index)} text. Paste math from MathType!`}
                      required
                    />
                  )}

                  {/* Image Option */}
                  {(question.optionTypes || ['text', 'text', 'text', 'text'])[index] === 'image' && (
                    <ImageUploadComponent
                      label=""
                      placeholder={`Upload image for option ${String.fromCharCode(65 + index)}`}
                      folder="questions/options"
                      tags={`question,option,option-${index}`}
                      currentImageUrl={(question.optionImages || ['', '', '', ''])[index]}
                      onImageUpload={(imageUrl) => {
                        const newOptionImages = [...(question.optionImages || ['', '', '', ''])];
                        newOptionImages[index] = imageUrl;
                        updateQuestion({ optionImages: newOptionImages });
                      }}
                      onImageRemove={() => {
                        const newOptionImages = [...(question.optionImages || ['', '', '', ''])];
                        newOptionImages[index] = '';
                        updateQuestion({ optionImages: newOptionImages });
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
          value={question.correctOption.toString()}
          onValueChange={(value) => updateQuestion({ correctOption: parseInt(value) })}
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
                variant={question.explanationType === 'text' ? 'default' : 'outline'}
                size="sm"
                className='cursor-pointer'
                onClick={() => updateQuestion({ explanationType: 'text', explanationImage: '' })}
              >
                Text
              </Button>
              <Button
                type="button"
                variant={question.explanationType === 'image' ? 'default' : 'outline'}
                size="sm"
                className='cursor-pointer'
                onClick={() => updateQuestion({ explanationType: 'image', explanationText: '' })}
              >
                Image
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className='cursor-pointer'
                onClick={() => updateQuestion({ explanationType: 'none', explanationText: '', explanationImage: '' })}
              >
                None
              </Button>
            </div>
          </div>

          {/* Text Explanation with Math Support */}
          {question.explanationType === 'text' && (
            <MathInput
              label=""
              value={question.explanationText || ''}
              onChange={(value) => updateQuestion({ explanationText: value })}
              placeholder="Explain why the correct answer is correct"
            />
          )}

          {/* Image Explanation */}
          {question.explanationType === 'image' && (
            <ImageUploadComponent
              label=""
              placeholder="Upload an image explanation (diagram, solution steps, etc.)"
              folder="questions/explanations"
              tags="question,explanation"
              currentImageUrl={question.explanationImage}
              onImageUpload={(imageUrl) => updateQuestion({ explanationImage: imageUrl })}
              onImageRemove={() => updateQuestion({ explanationImage: '' })}
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
            value={question.subject}
            onChange={(e) => updateQuestion({ subject: e.target.value })}
            placeholder="e.g., Mathematics"
            required
          />
        </div>
        <div>
          <Label htmlFor="topic">Topic *</Label>
          <Input
            id="topic"
            value={question.topic}
            onChange={(e) => updateQuestion({ topic: e.target.value })}
            placeholder="e.g., Algebra"
            required
          />
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <Label>Difficulty *</Label>
        <Select
          value={question.difficulty}
          onValueChange={(value: QuestionDifficulty) => updateQuestion({ difficulty: value })}
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
          value={(question.tags || []).join(', ')}
          onChange={(e) => {
            const tags = e.target.value.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
            updateQuestion({ tags });
          }}
          placeholder="Enter tags separated by commas"
        />
      </div>

      {/* Form Submission */}
      {onSubmit && (
        <div className="flex justify-end gap-4 mt-8">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onChange(question)}
          >
            Reset
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">↻</span>
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditMode ? 'Update Question' : 'Create Question'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuestionForm;
