import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Timeline } from "@/components/ui/timeline";
import { TextGenerateEffect } from "./ui/text-generate-effect";

interface Highlight {
  text: string;
  timestamp: string;
  importance: number;
}

interface SummaryDisplayProps {
  title: string;
  highlights: Highlight[];
  extendedSummary: string;
  content: string;
  className?: string;
  videoId?: string;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({
  title,
  highlights,
  extendedSummary,
  content,
  className,
  videoId,
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showExtended, setShowExtended] = useState(false);
  const [timelineData, setTimelineData] = useState<
    { title: string; content: React.ReactNode }[]
  >([]);
  const [activeSection, setActiveSection] = useState<string>("resumen");

  useEffect(() => {
    // Procesar el resumen para el Timeline
    const processed = processedSummary(content);
    setTimelineData(processed);
  }, [content]);

  const processedSummary = (
    text: string,
  ): { title: string; content: React.ReactNode }[] => {
    let processed = text.split("\n\n");
    return processed
      .filter((p) => p.trim() !== "")
      .map((paragraph, index) => {
        let title = "";
        if (paragraph.startsWith("# ")) {
          const lines = paragraph.split("\n");
          title = lines[0].replace("# ", "");
          paragraph = lines.slice(1).join("\n");
        } else if (paragraph.startsWith("## ")) {
          title = paragraph.replace("## ", "");
          paragraph = "";
        }

        // Ensure title is a string for TextGenerateEffect
        if (!title) {
          title = `Section ${index + 1}`;
        }

        // Process paragraph content to ensure it's a string
        let processedParagraph = paragraph;
        if (typeof processedParagraph !== "string") {
          processedParagraph = String(processedParagraph);
        }

        const content = (
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mb-2 text-secondary">
                  <TextGenerateEffect
                    duration={0.125}
                    words={children?.toString() || ""}
                  />
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold mb-2">
                  <TextGenerateEffect
                    duration={0.125}
                    words={children?.toString() || ""}
                  />
                </h2>
              ),
              p: ({ children }) => (
                <p className="text-lg mb-2">
                  <TextGenerateEffect
                    duration={0.125}
                    words={children?.toString() || ""}
                  />
                </p>
              ),
              strong: ({ children }) => (
                <strong className="text-lg font-semibold">
                  <TextGenerateEffect
                    duration={0.125}
                    words={children?.toString() || ""}
                  />
                </strong>
              ),
              em: ({ children }) => (
                <em className="text-lg italic">
                  <TextGenerateEffect
                    duration={0.125}
                    words={children?.toString() || ""}
                  />
                </em>
              ),
              blockquote: ({ children }) => (
                <blockquote className="text-lg border-l-4 border-secondary pl-4 italic my-2">
                  <TextGenerateEffect
                    duration={0.125}
                    words={children?.toString() || ""}
                  />
                </blockquote>
              ),
              ul: ({ children }) => (
                <ul className="text-lg list-disc pl-5 mb-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="text-lg list-decimal pl-5 mb-2">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-lg mb-1">
                  <TextGenerateEffect
                    duration={0.125}
                    words={children?.toString() || ""}
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
    const textToCopy = showExtended ? extendedSummary : content;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      toast({
        title: "Copiado",
        description: "El resumen ha sido copiado al portapapeles.",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getYouTubeLink = () => `https://youtube.com/watch?v=${videoId}`;

  const SummaryHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">
        <TextGenerateEffect duration={0.125} words={title} />
      </h2>
      <div className="flex gap-2">
        {videoId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(getYouTubeLink(), "_blank")}
          >
            Ver en YouTube
          </Button>
        )}
        <Button
          onClick={copyToClipboard}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
    </div>
  );

  const TabNavigation = () => (
    <div className="flex gap-4 mb-6 border-b">
      {["resumen", "puntos", "detalles"].map((tab) => (
        <Button
          key={tab}
          variant={activeSection === tab ? "default" : "ghost"}
          onClick={() => setActiveSection(tab)}
          className="capitalize"
        >
          {tab}
        </Button>
      ))}
    </div>
  );

  return (
    <div
      className={cn(
        "relative p-6 bg-background rounded-lg shadow-lg",
        className,
      )}
    >
      <SummaryHeader />
      <TabNavigation />

      {activeSection === "resumen" && (
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="text-lg mb-4 leading-relaxed">
                  <TextGenerateEffect
                    duration={0.125}
                    words={children?.toString() || ""}
                  />
                </p>
              ),
              // ... otros componentes de markdown
            }}
          >
            {showExtended ? extendedSummary : content}
          </ReactMarkdown>
          <Button
            variant="link"
            onClick={() => setShowExtended(!showExtended)}
            className="mt-4"
          >
            {showExtended ? "Ver menos" : "Ver más"}
          </Button>
        </div>
      )}

      {activeSection === "puntos" && (
        <div className="space-y-4">
          {highlights.map((highlight, index) => (
            <div key={index} className="p-4 bg-muted rounded-lg">
              <p className="text-lg">
                <TextGenerateEffect
                  duration={0.125}
                  words={highlight.text?.toString() || ""}
                />
              </p>
              <span className="text-sm text-muted-foreground">
                {highlight.timestamp}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeSection === "detalles" && <Timeline data={timelineData} />}
    </div>
  );
};

export default SummaryDisplay;
