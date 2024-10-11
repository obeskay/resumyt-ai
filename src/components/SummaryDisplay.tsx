import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Timeline } from "@/components/ui/timeline";
import { TextGenerateEffect } from "./ui/text-generate-effect";

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
  const [timelineData, setTimelineData] = useState<
    { title: string; content: React.ReactNode }[]
  >([]);

  useEffect(() => {
    if (summary) {
      const processed = processedSummary(summary);
      setTimelineData(processed);
    }
  }, [summary]);

  if (!summary) {
    return null;
  }

  const processedSummary = (
    text: string,
  ): { title: string; content: React.ReactNode }[] => {
    let processed = text.split("\n\n");
    return processed
      .filter((p) => p.trim() !== "")
      .map((paragraph, index) => {
        let title = ``;
        if (paragraph.startsWith("# ")) {
          const lines = paragraph.split("\n");
          title = lines[0].replace("# ", "");
          paragraph = lines.slice(1).join("\n");
        } else if (paragraph.startsWith("## ")) {
          title = paragraph.replace("## ", "");
          paragraph = "";
        }

        const content = (
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mb-2 text-secondary">
                  <TextGenerateEffect
                    duration={0.125}
                    words={children as string}
                  />
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold mb-2">
                  <TextGenerateEffect
                    duration={0.125}
                    words={children as string}
                  />
                </h2>
              ),
              p: ({ children }) => (
                <p className="text-lg mb-2">
                  <TextGenerateEffect
                    duration={0.125}
                    words={children as string}
                  />
                </p>
              ),
              strong: ({ children }) => (
                <strong className="text-lg font-semibold">
                  <TextGenerateEffect
                    duration={0.125}
                    words={children as string}
                  />
                </strong>
              ),
              em: ({ children }) => (
                <em className="text-lg italic">
                  <TextGenerateEffect
                    duration={0.125}
                    words={children as string}
                  />
                </em>
              ),
              blockquote: ({ children }) => (
                <blockquote className="text-lg border-l-4 border-secondary pl-4 italic my-2">
                  <TextGenerateEffect
                    duration={0.125}
                    words={children as string}
                  />
                </blockquote>
              ),
              ul: ({ children }) => (
                <ul className="text-lg list-disc pl-5 mb-2">
                  <TextGenerateEffect
                    duration={0.125}
                    words={children as string}
                  />
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="text-lg list-decimal pl-5 mb-2">
                  <TextGenerateEffect
                    duration={0.125}
                    words={children as string}
                  />
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-lg mb-1">
                  <TextGenerateEffect
                    duration={0.125}
                    words={children as string}
                  />
                </li>
              ),
            }}
          >
            {paragraph}
          </ReactMarkdown>
        );

        return { title, content };
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

  return (
    <div className={cn("relative pt-12", className)}>
      <Timeline data={timelineData} />

      <Button
        onClick={copyToClipboard}
        variant="outline"
        size="sm"
        className="absolute top-2 right-2"
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SummaryDisplay;
