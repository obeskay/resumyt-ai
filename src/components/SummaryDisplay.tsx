import React from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface SummaryDisplayProps {
  summary: string | null;
  className?: string;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({
  summary,
  className,
}) => {
  if (!summary) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className={cn("w-full prose max-w-none break-words", className)}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-bold">{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-sm font-bold">{children}</h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-xs font-bold">{children}</h6>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-4">{children}</li>,
        }}
      >
        {summary}
      </ReactMarkdown>
    </motion.div>
  );
};

export default SummaryDisplay;
