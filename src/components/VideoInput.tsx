"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useVideoStore } from "../store/videoStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "./LoadingSpinner";
import YouTubeLogo from "./YouTubeLogo";
import { Progress } from "@/components/ui/progress";
import { XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VideoInputProps {
  onSuccess: (videoId: string, summary: string, transcript: string) => void;
  onStart: () => void;
  userId: string | undefined;
  transcriptionsLeft: number;
}

export default function VideoInput({
  onSuccess,
  onStart,
  userId,
  transcriptionsLeft,
}: VideoInputProps) {
  const [input, setInput] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const {
    setVideoUrl,
    setSummary,
    setIsTranscribing,
    setIsSummarizing,
    setIsLoading,
  } = useVideoStore();

  const safeSetIsLoading =
    typeof setIsLoading === "function" ? setIsLoading : () => {};

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Error",
        description: "User not initialized. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    if (transcriptionsLeft <= 0) {
      toast({
        title: "Error",
        description: "You have no transcriptions left. Please create an account for unlimited summaries.",
        variant: "destructive",
      });
      return;
    }

    onStart();
    safeSetIsLoading(true);
    setIsProcessing(true);
    setIsTranscribing(true);
    setIsSummarizing(true);
    try {
      const videoId = extractVideoId(input);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      setVideoUrl(input);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 90) {
            clearInterval(progressInterval);
            return prevProgress;
          }
          return prevProgress + 10;
        });
      }, 500);

      const response = await fetch(`/api/videoProcessing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vid: videoId, userId, videoUrl: input }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.summary && data.transcript) {
        setSummary(data.summary);
        toast({
          title: "Success",
          description: "Video summary generated successfully!",
        });
        onSuccess(videoId, data.summary, data.transcript);
      } else {
        throw new Error("Failed to generate summary or transcript");
      }
    } catch (error: unknown) {
      console.error(error);
      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }
      toast({
        title: "Error",
        description: `Failed to process video: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      safeSetIsLoading(false);
      setIsProcessing(false);
      setIsTranscribing(false);
      setIsSummarizing(false);
      setProgress(0);
    }
  };

  const extractVideoId = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleClearInput = () => {
    setInput("");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Generate Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center bg-muted rounded-md p-2 relative">
            <Input
              type="url"
              placeholder="Enter YouTube URL"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setInput(e.target.value)
              }
              disabled={isProcessing}
              className="bg-transparent text-foreground placeholder:text-muted-foreground pr-8"
              aria-label="YouTube URL input"
              required
            />
            {input && (
              <button
                type="button"
                onClick={handleClearInput}
                className="absolute right-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear input"
              >
                <XCircle size={16} />
              </button>
            )}
            <YouTubeLogo className="absolute right-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <p className="text-sm text-muted-foreground text-right">
            {input.length}/2000 characters
          </p>
          <Button
            type="submit"
            disabled={isProcessing || transcriptionsLeft <= 0}
            className="w-full bg-primary hover:bg-primary/80 transition-colors text-primary-foreground"
            aria-busy={isProcessing}
            aria-label="Generate video summary"
          >
            {isProcessing ? <LoadingSpinner /> : "Generate Summary"}
          </Button>
          {isProcessing && <Progress value={progress} className="w-full" />}
          <p className="text-sm text-muted-foreground text-center">
            Transcriptions left: {transcriptionsLeft}
          </p>
        </motion.form>
      </CardContent>
    </Card>
  );
}
