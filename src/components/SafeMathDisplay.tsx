'use client';
import React from 'react';
import MathDisplay from './math-display';

interface SafeMathDisplayProps {
  children: string | null | undefined;
  className?: string;
}

/**
 * Safe wrapper for MathDisplay to prevent null/undefined errors
 * This component handles all edge cases that can cause MathJax to fail
 */
const SafeMathDisplay: React.FC<SafeMathDisplayProps> = ({ children, className = "" }) => {
  // Check for null, undefined, or empty content
  if (!children || typeof children !== 'string' || children.trim() === '') {
    return <span className="text-gray-500 italic text-sm">No content</span>;
  }
  
  try {
    return <MathDisplay className={className}>{children}</MathDisplay>;
  } catch (error) {
    console.error('MathDisplay rendering error:', error, 'Content:', children);
    return <span className="text-red-500 italic text-sm">Math rendering error</span>;
  }
};

export default SafeMathDisplay;