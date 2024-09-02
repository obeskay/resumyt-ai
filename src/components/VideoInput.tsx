"use client";
import React, { useCallback, useState, useEffect } from "react";
import { useVideoStore } from "@/store/videoStore";
import { useToast } from "@/components/ui/use-toast";
import LoadingIndicator from "@/components/LoadingIndicator";
import { Input } from "./ui/input";
import YouTubeThumbnail from "./YouTubeThumbnail";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, List, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dictionary } from "@/lib/getDictionary";
import { Locale } from "@/i18n-config";

interface VideoInputProps {
  userId: string;
  quotaRemaining: number | null;
  isLoading: boolean;
  onSubmit: (url: string, formats: string[], videoTitle: string) => void;
  dict: {
    formats: Dictionary["formats"];
    home: {
      error: Dictionary["home"]["error"];
      inputPlaceholder: string;
      summarizeButton: string;
      continueButton: string; // Añadido
      formatQuestion: string; // Añadido
    };
  };
  lang: Locale;
}

const VideoInput: React.FC<VideoInputProps> = ({
  userId,
  quotaRemaining,
  isLoading,
  onSubmit,
  dict,
  lang,
}) => {
  const {
    videoUrl,
    setVideoUrl,
    videoTitle,
    videoThumbnail,
    fetchVideoMetadata,
  } = useVideoStore();
  const { toast } = useToast();
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"url" | "format">("url");

  const formatOptions = [
    {
      icon: <List className="w-6 h-6" />,
      label: dict.formats?.bulletPoints || "Puntos clave",
      value: "bullet-points",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      label: dict.formats?.paragraph || "Párrafo",
      value: "paragraph",
    },
    {
      icon: <Newspaper className="w-6 h-6" />,
      label: dict.formats?.page || "Página",
      value: "page",
    },
  ];

  const validateSubmission = useCallback(async (): Promise<boolean> => {
    if (!videoUrl.trim()) {
      setError(dict.home.error.invalidUrl);
      return false;
    }

    if (quotaRemaining !== null && quotaRemaining <= 0) {
      setError(dict.home.error.quotaExceeded);
      return false;
    }

    if (!selectedFormat) {
      setError(dict.home.error.noFormatSelected);
      return false;
    }

    setError(null);
    return true;
  }, [videoUrl, quotaRemaining, selectedFormat, dict]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (await validateSubmission()) {
        onSubmit(videoUrl, [selectedFormat!], videoTitle);
      }
    },
    [validateSubmission, onSubmit, videoUrl, selectedFormat, videoTitle],
  );

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format);
  };

  const handleUrlSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (videoUrl.trim() && quotaRemaining !== null && quotaRemaining > 0) {
        await fetchVideoMetadata(videoUrl);
        setStep("format");
      } else {
        setError(dict.home.error.invalidUrl);
      }
    },
    [videoUrl, quotaRemaining, fetchVideoMetadata, dict],
  );

  const handleFormatSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedFormat) {
        onSubmit(videoUrl, [selectedFormat], videoTitle);
      } else {
        setError(dict.home.error.noFormatSelected);
      }
    },
    [videoUrl, selectedFormat, videoTitle, onSubmit, dict],
  );

  useEffect(() => {
    if (videoUrl) {
      fetchVideoMetadata(videoUrl);
    }
  }, [videoUrl, fetchVideoMetadata]);

  return (
    <TooltipProvider>
      {/* Envuelve todo el contenido en un componente que se renderiza solo en el cliente */}
      {typeof window !== "undefined" && (
        <div className="w-full space-y-6">
          <div className="p-6 sm:p-10 bg-card rounded-lg shadow-lg">
            {step === "url" ? (
              <motion.form
                onSubmit={handleUrlSubmit}
                className="space-y-6 w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative w-full">
                  <Input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    required
                    className="pr-24 h-12 !text-[16px] rounded-full"
                    placeholder={
                      isLoading
                        ? lang === "es"
                          ? "Cargando..."
                          : "Loading..."
                        : dict.home.inputPlaceholder
                    }
                    disabled={isLoading || quotaRemaining === 0}
                    aria-label={
                      lang === "es"
                        ? "URL del video de YouTube"
                        : "YouTube video URL"
                    }
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || quotaRemaining === 0}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10  rounded-full"
                    aria-label="Continuar"
                  >
                    {isLoading ? "Cargando..." : dict.home.continueButton}
                  </Button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                onSubmit={handleFormatSubmit}
                className="space-y-6 w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold mb-4">
                  {dict.home.formatQuestion}
                </h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {formatOptions.map((option) => (
                    <Tooltip key={option.value}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={
                            selectedFormat === option.value
                              ? "default"
                              : "outline"
                          }
                          onClick={() => handleFormatChange(option.value)}
                          className="flex items-center space-x-2 min-w-[120px] min-h-[44px] rounded-full"
                          aria-label={`Seleccionar formato ${option.label}`}
                        >
                          {option.icon}
                          <span>{option.label}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{`Resumen en formato ${option.label}`}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                <hr />
              </motion.form>
            )}

            <AnimatePresence>
              {videoTitle && videoThumbnail && (
                <motion.div
                  key="video-info"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 w-full"
                >
                  <h3 className="text-xl font-semibold mb-4">
                    <TextGenerateEffect words={videoTitle} />
                  </h3>
                  <div className="max-w-sm mx-auto">
                    <YouTubeThumbnail
                      src={videoThumbnail}
                      alt={videoTitle}
                      layoutId="video-thumbnail"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {userId && isLoading && <LoadingIndicator />}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </TooltipProvider>
  );
};

export default VideoInput;
