'use client';
import React from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

interface MathDisplayProps {
  children: string;
  className?: string;
}

const MathDisplay: React.FC<MathDisplayProps> = ({ 
  children, 
  className = "" 
}) => {
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

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className={`prose prose-sm max-w-none ${className}`}>
        <MathJax>{children}</MathJax>
      </div>
    </MathJaxContext>
  );
};

export default MathDisplay;