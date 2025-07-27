'use client';
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

interface MathInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const MathInput: React.FC<MathInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  className = ""
}) => {
  const [showPreview, setShowPreview] = useState(false);

  // MathJax configuration
  const mathJaxConfig = {
    loader: { load: ["[tex]/html"] },
    tex: {
      packages: { "[+]": ["html"] },
      inlineMath: [["$", "$"], ["\\(", "\\)"]],
      displayMath: [["$$", "$$"], ["\\[", "\\]"]]
    },
    svg: {
      fontCache: 'global'
    }
  };

  // Handle paste events from MathType
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    if (pastedData) {
      // Check if it's LaTeX from MathType (contains backslashes or curly braces)
      if (pastedData.includes('\\') || pastedData.includes('{') || pastedData.includes('}')) {
        // Process LaTeX - wrap in dollar signs if not already wrapped
        let processedData = pastedData.trim();
        
        // If it's display math (starts with \[ or contains display commands)
        if (processedData.startsWith('\\[') || processedData.includes('\\begin{')) {
          processedData = processedData.startsWith('$$') ? processedData : `$$${processedData}$$`;
        } else {
          // Inline math
          processedData = processedData.startsWith('$') ? processedData : `$${processedData}$`;
        }
        
        // Insert at cursor position or append
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + processedData + value.substring(end);
        onChange(newValue);
        
        // Set cursor position after the inserted content
        setTimeout(() => {
          textarea.setSelectionRange(start + processedData.length, start + processedData.length);
        }, 0);
      } else {
        // Regular text paste
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + pastedData + value.substring(end);
        onChange(newValue);
        
        setTimeout(() => {
          textarea.setSelectionRange(start + pastedData.length, start + pastedData.length);
        }, 0);
      }
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs cursor-pointer"
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
      </div>
      
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        placeholder={placeholder || "Type text or paste equations from MathType here..."}
        className="min-h-24 font-mono text-sm"
        required={required}
      />
      
      {showPreview && value && (
        <div className="p-3 border rounded-lg bg-muted/50">
          <Label className="text-xs text-muted-foreground mb-2 block">Preview:</Label>
          <MathJaxContext config={mathJaxConfig}>
            <div className="prose prose-sm max-w-none">
              <MathJax>{value}</MathJax>
            </div>
          </MathJaxContext>
        </div>
      )}
    </div>
  );
};

export default MathInput;