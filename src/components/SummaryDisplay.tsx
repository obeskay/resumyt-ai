import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

  return (
    <Card className={cn("p-6 bg-background rounded-lg shadow-lg", className)}>
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-3xl font-bold">
          <TextGenerateEffect duration={0.125} words={title} />
        </CardTitle>
        <div className="flex gap-2">
          {videoId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(`https://youtube.com/watch?v=${videoId}`, "_blank")
              }
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
      </CardHeader>

      <Separator className="my-4" />

      <CardContent className="prose dark:prose-invert max-w-none mb-4">
        <ul className="text-xl list-disc pl-5 mb-4">
          {highlights.map((highlight, index) => (
            <li key={index} className="mb-2">
              <TextGenerateEffect duration={0.125} words={highlight.text} />
            </li>
          ))}
        </ul>
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p className="text-xl leading-relaxed mb-4">
                <TextGenerateEffect
                  duration={0.1}
                  words={children?.toString() || ""}
                />
              </p>
            ),
          }}
        >
          {showExtended ? extendedSummary : content}
        </ReactMarkdown>
      </CardContent>
    </Card>
  );
};

export default SummaryDisplay;
