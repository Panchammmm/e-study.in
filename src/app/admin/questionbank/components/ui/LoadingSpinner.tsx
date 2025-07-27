'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  text = 'Loading...'
}) => {
  const sizeClass = size === 'small' ? 'h-6 w-6' : size === 'large' ? 'h-16 w-16' : 'h-12 w-12';
  
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="flex flex-col items-center space-y-4">
        <div className={`animate-spin rounded-full ${sizeClass} border-t-2 border-b-2 border-primary`}></div>
        <p className="text-muted-foreground">{text}</p>
      </div>
    </div>
  );
};
