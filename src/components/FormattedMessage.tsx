import React from 'react';
import { CheckCircle, Lightbulb, BookOpen, Calculator, AlertCircle, Star, ArrowRight, Target } from 'lucide-react';

interface FormattedMessageProps {
  content: string;
  className?: string;
}

export default function FormattedMessage({ content, className = "" }: FormattedMessageProps) {
  
  const formatContent = (text: string) => {
    // Split content into sections and format each part
    const sections = text.split('\n\n');
    
    return sections.map((section, index) => {
      // Skip empty sections
      if (!section.trim()) return null;
      
      // Format different types of content
      if (section.includes('**') || section.includes('*')) {
        return formatTextWithMarkdown(section, index);
      } else if (section.match(/^\d+\./m) || section.match(/^[-•*]\s/m) || section.match(/^[•◦▪▫]\s/m)) {
        return formatList(section, index);
      } else if (section.includes('Step') && section.includes(':')) {
        return formatSteps(section, index);
      } else if (section.includes('=') && section.match(/\d+/)) {
        return formatMathEquation(section, index);
      } else if (section.includes('Example:') || section.includes('For example:')) {
        return formatExample(section, index);
      } else if (section.includes('Note:') || section.includes('Remember:') || section.includes('Important:')) {
        return formatNote(section, index);
      } else if (section.includes('Answer:') || section.includes('Solution:')) {
        return formatAnswer(section, index);
      } else if (section.match(/^\s*[a-zA-Z]\)\s/m)) {
        return formatLetterList(section, index);
      } else if (section.match(/^\s*[ivxlcdm]+[\.\)]\s/mi)) {
        return formatRomanList(section, index);
      } else {
        return formatParagraph(section, index);
      }
    }).filter(Boolean);
  };

  const formatTextWithMarkdown = (text: string, key: number) => {
    // Convert **bold** and *italic* text
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return (
      <div key={key} className="mb-4">
        <p 
          className="text-sm md:text-base leading-relaxed" 
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      </div>
    );
  };

  const formatList = (text: string, key: number) => {
    const lines = text.split('\n').filter(line => line.trim());
    
    // Check if it's numbered or bulleted
    const isNumbered = lines[0]?.match(/^\d+\./);
    const isBulleted = lines[0]?.match(/^[-•*▪▫◦]\s/);
    
    return (
      <div key={key} className="mb-4">
        {isNumbered ? (
          <ol className="list-none space-y-3 text-sm md:text-base">
            {lines.map((line, i) => {
              const number = line.match(/^(\d+)\./)?.[1] || (i + 1).toString();
              const content = line.replace(/^\d+\.\s*/, '');
              return (
                <li key={i} className="flex items-start space-x-3 leading-relaxed">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    {number}
                  </div>
                  <span className="flex-1">{content}</span>
                </li>
              );
            })}
          </ol>
        ) : (
          <ul className="list-none space-y-2 text-sm md:text-base">
            {lines.map((line, i) => {
              const content = line.replace(/^[-•*▪▫◦]\s*/, '');
              return (
                <li key={i} className="flex items-start space-x-3 leading-relaxed">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="flex-1">{content}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  const formatSteps = (text: string, key: number) => {
    const steps = text.split(/(?=Step \d+:)/i).filter(step => step.trim());
    
    return (
      <div key={key} className="mb-4">
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">Step-by-Step Solution</h4>
          </div>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {i + 1}
                </div>
                <div className="text-sm md:text-base leading-relaxed">
                  {step.replace(/^Step \d+:\s*/i, '')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const formatMathEquation = (text: string, key: number) => {
    return (
      <div key={key} className="mb-4">
        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2 mb-2">
            <Calculator className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-800 dark:text-green-200">Mathematical Expression</h4>
          </div>
          <div className="font-mono text-lg bg-white dark:bg-gray-800 rounded p-3 border">
            {text}
          </div>
        </div>
      </div>
    );
  };

  const formatExample = (text: string, key: number) => {
    return (
      <div key={key} className="mb-4">
        <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-2 mb-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Example</h4>
          </div>
          <p className="text-sm md:text-base leading-relaxed">
            {text.replace(/^(Example:|For example:)\s*/i, '')}
          </p>
        </div>
      </div>
    );
  };

  const formatNote = (text: string, key: number) => {
    return (
      <div key={key} className="mb-4">
        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <h4 className="font-semibold text-orange-800 dark:text-orange-200">Important Note</h4>
          </div>
          <p className="text-sm md:text-base leading-relaxed">
            {text.replace(/^(Note:|Remember:|Important:)\s*/i, '')}
          </p>
        </div>
      </div>
    );
  };

  const formatAnswer = (text: string, key: number) => {
    return (
      <div key={key} className="mb-4">
        <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="h-5 w-5 text-emerald-600" />
            <h4 className="font-semibold text-emerald-800 dark:text-emerald-200">Answer</h4>
          </div>
          <p className="text-sm md:text-base leading-relaxed font-medium">
            {text.replace(/^(Answer:|Solution:)\s*/i, '')}
          </p>
        </div>
      </div>
    );
  };

  const formatLetterList = (text: string, key: number) => {
    const lines = text.split('\n').filter(line => line.trim());
    
    return (
      <div key={key} className="mb-4">
        <ol className="list-none space-y-2 text-sm md:text-base">
          {lines.map((line, i) => {
            const letter = line.match(/^([a-zA-Z])\)/)?.[1] || String.fromCharCode(97 + i);
            const content = line.replace(/^[a-zA-Z]\)\s*/, '');
            return (
              <li key={i} className="flex items-start space-x-3 leading-relaxed">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  {letter}
                </div>
                <span className="flex-1">{content}</span>
              </li>
            );
          })}
        </ol>
      </div>
    );
  };

  const formatRomanList = (text: string, key: number) => {
    const lines = text.split('\n').filter(line => line.trim());
    
    return (
      <div key={key} className="mb-4">
        <ol className="list-none space-y-2 text-sm md:text-base">
          {lines.map((line, i) => {
            const roman = line.match(/^([ivxlcdm]+)[\.\)]/i)?.[1] || ['i', 'ii', 'iii', 'iv', 'v'][i] || 'i';
            const content = line.replace(/^[ivxlcdm]+[\.\)]\s*/i, '');
            return (
              <li key={i} className="flex items-start space-x-3 leading-relaxed">
                <div className="bg-indigo-600 text-white rounded-lg px-2 py-1 text-sm font-medium flex-shrink-0 mt-0.5">
                  {roman.toUpperCase()}
                </div>
                <span className="flex-1">{content}</span>
              </li>
            );
          })}
        </ol>
      </div>
    );
  };

  const formatParagraph = (text: string, key: number) => {
    // Check if paragraph contains inline lists
    const lines = text.split('\n');
    const hasInlineList = lines.some(line => 
      line.match(/^\s*[-•*▪▫◦]\s/) || 
      line.match(/^\s*\d+\.\s/) || 
      line.match(/^\s*[a-zA-Z]\)\s/) ||
      line.match(/^\s*[ivxlcdm]+[\.\)]\s/i)
    );

    if (hasInlineList && lines.length > 1) {
      // Mixed content - handle each line individually
      return (
        <div key={key} className="mb-4 space-y-2">
          {lines.map((line, lineIndex) => {
            if (!line.trim()) return null;
            
            if (line.match(/^\s*[-•*▪▫◦]\s/)) {
              const content = line.replace(/^\s*[-•*▪▫◦]\s*/, '');
              return (
                <div key={lineIndex} className="flex items-start space-x-3 text-sm md:text-base leading-relaxed">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="flex-1">{content}</span>
                </div>
              );
            } else if (line.match(/^\s*\d+\.\s/)) {
              const number = line.match(/^\s*(\d+)\./)?.[1];
              const content = line.replace(/^\s*\d+\.\s*/, '');
              return (
                <div key={lineIndex} className="flex items-start space-x-3 text-sm md:text-base leading-relaxed">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    {number}
                  </div>
                  <span className="flex-1">{content}</span>
                </div>
              );
            } else if (line.match(/^\s*[a-zA-Z]\)\s/)) {
              const letter = line.match(/^\s*([a-zA-Z])\)/)?.[1];
              const content = line.replace(/^\s*[a-zA-Z]\)\s*/, '');
              return (
                <div key={lineIndex} className="flex items-start space-x-3 text-sm md:text-base leading-relaxed">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    {letter}
                  </div>
                  <span className="flex-1">{content}</span>
                </div>
              );
            } else if (line.match(/^\s*[ivxlcdm]+[\.\)]\s/i)) {
              const roman = line.match(/^\s*([ivxlcdm]+)[\.\)]/i)?.[1];
              const content = line.replace(/^\s*[ivxlcdm]+[\.\)]\s*/i, '');
              return (
                <div key={lineIndex} className="flex items-start space-x-3 text-sm md:text-base leading-relaxed">
                  <div className="bg-indigo-600 text-white rounded-lg px-2 py-1 text-sm font-medium flex-shrink-0 mt-0.5">
                    {roman?.toUpperCase()}
                  </div>
                  <span className="flex-1">{content}</span>
                </div>
              );
            } else {
              return (
                <p key={lineIndex} className="text-sm md:text-base leading-relaxed">
                  {line}
                </p>
              );
            }
          }).filter(Boolean)}
        </div>
      );
    }

    // Regular paragraph without lists
    return (
      <div key={key} className="mb-4">
        <p className="text-sm md:text-base leading-relaxed">
          {text}
        </p>
      </div>
    );
  };

  return (
    <div className={`prose prose-sm md:prose-base max-w-none ${className}`}>
      {formatContent(content)}
    </div>
  );
}
