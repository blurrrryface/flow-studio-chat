import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = "" 
}) => {
  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ children, className }) => (
            <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-muted p-3 rounded-md overflow-x-auto mb-2">
              {children}
            </pre>
          ),
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-4 mb-3 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold mt-3 mb-2 first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium mt-3 mb-2 first:mt-0">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-primary/30 pl-3 py-1 bg-muted/30 rounded-r mb-2">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};