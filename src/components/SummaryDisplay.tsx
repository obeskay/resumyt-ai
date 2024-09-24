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

  // Función para procesar el resumen y mejorar su estructura
  const processedSummary = (text: string) => {
    // Separar párrafos
    let processed = text.replace(/\n/g, "\n\n");

    // Añadir títulos y subtítulos
    processed = processed.replace(/^(.+)$/gm, (match, p1) => {
      if (p1.length > 50) return p1;
      return `## ${p1}`;
    });

    // Añadir énfasis a palabras clave
    const keywords = ["importante", "clave", "destacado", "fundamental"];
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      processed = processed.replace(regex, `**${keyword}**`);
    });

    return processed;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className={cn(
        "w-full prose prose-invert max-w-none break-words",
        className,
      )}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mb-4 text-primary">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mb-3 text-secondary">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-medium mb-2">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-medium mb-2">{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-base font-medium mb-1">{children}</h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-medium mb-1">{children}</h6>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-4">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-bold text-accent">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-emphasis">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic my-4">
              {children}
            </blockquote>
          ),
        }}
      >
        {processedSummary(summary)}
      </ReactMarkdown>
    </motion.div>
  );
};

export default SummaryDisplay;
