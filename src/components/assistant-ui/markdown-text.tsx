import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";
import type { FC } from "react";

export const MarkdownText: FC = () => {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <MarkdownTextPrimitive />
    </div>
  );
};