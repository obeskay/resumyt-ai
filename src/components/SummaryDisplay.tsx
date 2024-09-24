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
        title: "Copiado al portapapeles",
        description: "El resumen ha sido copiado exitosamente.",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const nextCard = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % paragraphs.length);
  };

  const prevCard = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + paragraphs.length) % paragraphs.length,
    );
  };

  const cardVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("w-full max-w-3xl mx-auto", className)}
    >
      <Button onClick={copyToClipboard} className="mb-4" variant="outline">
        <Copy className="mr-2 h-4 w-4" />
        {copied ? "Copiado" : "Copiar resumen"}
      </Button>
      <div className="relative w-full h-[60vh] overflow-hidden">
        <AnimatePresence initial={false} custom={currentIndex}>
          <motion.div
            key={currentIndex}
            custom={currentIndex}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute w-full h-full"
          >
            <Card className="w-full h-full border-primary/20">
              <CardContent className="p-6 h-full">
                <ScrollArea className="h-full pr-4">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="scroll-m-20 text-5xl font-extrabold tracking-tight lg:text-6xl mb-6">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="scroll-m-20 border-b pb-2 text-4xl font-semibold tracking-tight first:mt-0 mb-6">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight mb-4">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-xl leading-8 [&:not(:first-child)]:mt-8">
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-primary text-2xl">
                          {children}
                        </strong>
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
    </motion.div>
  );
};

export default SummaryDisplay;
