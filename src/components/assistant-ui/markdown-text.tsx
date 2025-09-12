import type { FC } from "react";

interface MarkdownTextProps {
  content?: string;
}

export const MarkdownText: FC<MarkdownTextProps> = ({ content }) => {
  if (!content) return null;
  
  // Simple text rendering for now - you can enhance with proper markdown later
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <p className="text-sm whitespace-pre-wrap">{content}</p>
    </div>
  );
};