"use client";
import React, { useCallback, useState, useEffect } from "react";
import { useVideoStore } from "@/store/videoStore";
import { useToast } from "@/components/ui/use-toast";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import YouTubeThumbnail from "./YouTubeThumbnail";
import { motion, AnimatePresence } from "framer-motion";

interface VideoInputProps {
  userId: string; // Añadimos esta línea
  quotaRemaining: number | null; // Cambiamos esto para aceptar null
  placeholder: string;
  buttonText: string;
  isLoading: boolean; // Añadimos esta línea
}

const VideoInput: React.FC<VideoInputProps> = ({
  userId,
  quotaRemaining,
  placeholder,
  buttonText,
  isLoading // Añadimos esta línea
}) => {
  const {
    videoUrl,
    setVideoUrl,
    videoTitle,
    videoThumbnail,
    fetchVideoMetadata,
    summaryFormat,
    setSummaryFormat,
  } = useVideoStore();
  const { toast } = useToast();
  const [isLoadingState, setIsLoadingState] = useState(false);
  const router = useRouter();

  const validateSubmission = useCallback(async (): Promise<boolean> => {
    if (!videoUrl.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingrese una URL de YouTube",
        variant: "destructive",
      });
      return false;
    }

    if (quotaRemaining !== null && quotaRemaining <= 0) {
      toast({
        title: "Error",
        description: "Ha alcanzado su límite de cuota",
        variant: "destructive",
      });
      return false;
    }

    if (!summaryFormat) {
      toast({
        title: "Error",
        description: "Por favor, seleccione un formato de resumen",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [videoUrl, quotaRemaining, summaryFormat, toast]);

  const submitVideo = useCallback(async () => {
    setIsLoadingState(true);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl, summaryFormat }),
      });

      if (!response.ok) {
        throw new Error("Error al generar el resumen");
      }

      const data = await response.json();
      router.push(`/summary/${data.videoId}`);
    } catch (err) {
      toast({
        title: "Error",
        description: "Error al generar el resumen. Por favor, intente de nuevo.",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setIsLoadingState(false);
    }
  }, [videoUrl, summaryFormat, router, toast]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (await validateSubmission()) {
        await submitVideo();
      }
    },
    [validateSubmission, submitVideo]
  );

  useEffect(() => {
    if (videoUrl.trim()) {
      fetchVideoMetadata(videoUrl);
    }
  }, [videoUrl, fetchVideoMetadata]);

  return (
    <div className="w-full space-y-6">
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-4 w-full"
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
            className="bg-popover pr-24 w-full"
            placeholder={placeholder}
            disabled={isLoading} // Usamos isLoading aquí
          />
          <Button
            size="sm"
            type="submit"
            disabled={isLoading || isLoadingState} // Usamos isLoading aquí también
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full"
          >
            {buttonText}
          </Button>
        </div>
        <div className="flex flex-col space-y-2 w-full">
          <label className="text-sm font-medium">Formato del resumen:</label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bullet-points"
                checked={summaryFormat === "bullet-points"}
                onCheckedChange={() => setSummaryFormat("bullet-points")}
              />
              <label htmlFor="bullet-points" className="text-sm">
                Puntos clave
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="paragraph"
                checked={summaryFormat === "paragraph"}
                onCheckedChange={() => setSummaryFormat("paragraph")}
              />
              <label htmlFor="paragraph" className="text-sm">
                Párrafo
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="page"
                checked={summaryFormat === "page"}
                onCheckedChange={() => setSummaryFormat("page")}
              />
              <label htmlFor="page" className="text-sm">
                Página
              </label>
            </div>
          </div>
        </div>
      </motion.form>
      {isLoadingState && <LoadingIndicator />}
      <AnimatePresence>
        {videoTitle && videoThumbnail && (
          <motion.div
            key="video-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <h3 className="text-xl font-semibold mb-4 text-center">
              {videoTitle}
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
  );
};

export default VideoInput;
