import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, ChevronDown, ExternalLink, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Timeline } from "@/components/ui/timeline";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VideoSummary } from "@/lib/types";
import { useRouter } from "next/navigation";

interface Highlight {
  text: string;
  timestamp: string;
  importance: number;
}

interface SummaryDisplayProps {
  title: string;
  content: string; // JSON string del resumen estructurado
  extendedSummary: string;
  highlights?: Highlight[];
  videoId?: string;
  language?: string;
  className?: string;
}

interface ParsedSummary {
  introduction: string;
  mainPoints: string[];
  conclusions: string;
}

const MarkdownComponents = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-3xl font-bold mb-4"
    >
      {children}
    </motion.h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-2xl font-semibold mb-3"
    >
      {children}
    </motion.h2>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-lg leading-relaxed mb-4"
    >
      {children}
    </motion.p>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <motion.blockquote
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="border-l-4 border-primary pl-4 italic my-4"
    >
      {children}
    </motion.blockquote>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <motion.code
      whileHover={{ scale: 1.02 }}
      className="bg-muted px-2 py-1 rounded-md font-mono text-sm"
    >
      {children}
    </motion.code>
  ),
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <motion.h2
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-xl font-medium tracking-tight"
  >
    <TextGenerateEffect words={children as string} />
  </motion.h2>
);

const translations = {
  es: {
    introduction: "Introducción",
    mainPoints: "Puntos Principales",
    conclusions: "Conclusiones",
    copyButton: "Copiar",
    copied: "Copiado",
    watchOnYoutube: "Ver en YouTube",
    copyToast: "El resumen ha sido copiado al portapapeles",
  },
  en: {
    introduction: "Introduction",
    mainPoints: "Main Points",
    conclusions: "Conclusions",
    copyButton: "Copy",
    copied: "Copied",
    watchOnYoutube: "Watch on YouTube",
    copyToast: "Summary has been copied to clipboard",
  },
} as const;

const formatForWord = (summary: any) => {
  const { introduction, mainPoints, conclusions } = summary;

  // Convertir markdown a formato compatible con Word
  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Mantener el texto en negrita pero quitar los asteriscos
      .replace(/^#\s+(.*)$/gm, "$1\n") // Convertir títulos
      .replace(/^##\s+(.*)$/gm, "$1\n") // Convertir subtítulos
      .replace(/^•\s+(.*)$/gm, "• $1\n"); // Mantener viñetas
  };

  // Construir el texto formateado
  const formattedText = `
${formatText(introduction)}

PUNTOS PRINCIPALES:
${mainPoints
  .map(
    (point: any) => `
${point.title}
${formatText(point.point)}
`,
  )
  .join("\n")}

CONCLUSIONES:
${formatText(conclusions)}
`;

  return formattedText.trim();
};

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({
  title,
  content,
  extendedSummary,
  highlights = [],
  videoId,
  language = "es",
  className,
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [parsedContent, setParsedContent] = useState<VideoSummary | null>(null);
  const router = useRouter();

  // Obtener las traducciones según el idioma
  const t =
    translations[language as keyof typeof translations] || translations.en;

  useEffect(() => {
    try {
      // If content is already an object, use it directly
      if (typeof content === "object") {
        setParsedContent(content as VideoSummary);
      } else {
        // If content is a string, try to parse it
        setParsedContent(JSON.parse(content));
      }
    } catch (error) {
      console.error("Error parsing summary content:", error);
      setParsedContent({
        introduction: "Could not generate detailed summary.",
        mainPoints: [],
        conclusions: "Please try again later.",
      });
    }
  }, [content]);

  if (!parsedContent) {
    return (
      <Alert>
        <AlertDescription>Loading summary content...</AlertDescription>
      </Alert>
    );
  }

  const { introduction, mainPoints, conclusions } = parsedContent;

  const timelineData =
    mainPoints?.map((point, index) => ({
      title: point.title || `Punto ${index + 1}`,
      content: (
        <Card className="relative overflow-hidden border-none py-2 px-3 rounded-xl">
          <motion.div className="md:text-lg leading-relaxed">
            <ReactMarkdown>
              {typeof point === "string" ? point : point.point}
            </ReactMarkdown>
          </motion.div>
        </Card>
      ),
    })) || [];

  const copyToClipboard = () => {
    try {
      const formattedText = formatForWord(parsedContent);
      navigator.clipboard.writeText(formattedText).then(() => {
        setCopied(true);
        toast({
          title: t.copied,
          description: t.copyToast,
        });
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (error) {
      console.error("Error formatting content for copying:", error);
      // Fallback al comportamiento anterior si hay error
      navigator.clipboard.writeText(extendedSummary).then(() => {
        setCopied(true);
        toast({
          title: t.copied,
          description: t.copyToast,
        });
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground"
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copied ? t.copied : t.copyButton}
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>
              <SectionTitle>{t.introduction}</SectionTitle>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="prose prose-sm md:prose-base max-w-none"
            >
              <ReactMarkdown>{introduction}</ReactMarkdown>
            </motion.div>
          </CardContent>
        </Card>

        {mainPoints && mainPoints.length > 0 && (
          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle>
                <SectionTitle>{t.mainPoints}</SectionTitle>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline data={timelineData} />
            </CardContent>
          </Card>
        )}

        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>
              <SectionTitle>{t.conclusions}</SectionTitle>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="prose prose-sm md:prose-base max-w-none"
            >
              <ReactMarkdown>{conclusions}</ReactMarkdown>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SummaryDisplay;
