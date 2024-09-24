import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SummaryDisplayProps {
  summary: string | null;
  className?: string;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({
  summary,
  className,
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paragraphs, setParagraphs] = useState<string[]>([]);

  useEffect(() => {
    if (summary) {
      const processed = processedSummary(summary);
      setParagraphs(processed.filter((p) => p.trim() !== ""));
    }
  }, [summary]);

  if (!summary) {
    return null;
  }

  const processedSummary = (text: string): string[] => {
    let processed = text.split("\n\n");
    return processed.map((paragraph) => {
      if (paragraph.length < 50 && !paragraph.startsWith("#")) {
        return `## ${paragraph}`;
      }
      const keywords = ["importante", "clave", "destacado", "fundamental"];
      keywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, "gi");
        paragraph = paragraph.replace(regex, `**${keyword}**`);
      });
      return paragraph;
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      toast({
        title: "Copiado",
        description: "El resumen ha sido copiado al portapapeles.",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const prevCard = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? paragraphs.length - 1 : prevIndex - 1,
    );
  };

  const nextCard = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === paragraphs.length - 1 ? 0 : prevIndex + 1,
    );
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-card p-6 rounded-lg shadow-lg mb-6"
          >
            <Card>
              <CardContent>
                <ScrollArea className="h-64">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-semibold">{children}</h2>
                      ),
                      p: ({ children }) => (
                        <p className="text-base leading-relaxed">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-muted-foreground text-xl">
                          {children}
                        </em>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="mt-8 border-l-4 pl-6 italic text-xl">
                          {children}
                        </blockquote>
                      ),
                      ul: ({ children }) => (
                        <ul className="my-8 ml-8 list-disc [&>li]:mt-4 text-xl">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="my-8 ml-8 list-decimal [&>li]:mt-4 text-xl">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-xl">{children}</li>
                      ),
                    }}
                  >
                    {paragraphs[currentIndex]}
                  </ReactMarkdown>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-between mt-4">
        <Button onClick={prevCard} variant="outline" size="lg">
          <ChevronLeft className="mr-2 h-5 w-5" />
          Anterior
        </Button>
        <Button onClick={nextCard} variant="outline" size="lg">
          Siguiente
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default SummaryDisplay;
