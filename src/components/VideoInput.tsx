"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useVideoStore } from "../store/videoStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import AuthModal from "./AuthModal";

interface VideoInputProps {
  onSuccess: () => void;
  session: any;
}

export default function VideoInput({ onSuccess, session }: VideoInputProps) {
  const [input, setInput] = useState<string>(
    "https://www.youtube.com/watch?v=tswesZhemRw"
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const {
    setVideoUrl,
    setTranscription,
    setSummary,
    setIsTranscribing,
    setIsSummarizing,
    isLoading,
    userQuotaRemaining,
    setUserQuotaRemaining,
    setIsLoading,
  } = useVideoStore();

  // Asegurarse de que setUserQuotaRemaining y setIsLoading son funciones
  const safeSetUserQuotaRemaining = typeof setUserQuotaRemaining === 'function' ? setUserQuotaRemaining : () => {};
  const safeSetIsLoading = typeof setIsLoading === 'function' ? setIsLoading : () => {};
  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      setIsAuthenticated(true);
      safeSetUserQuotaRemaining(3);
    }
  }, [session, safeSetUserQuotaRemaining]);

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

    if (userQuotaRemaining <= 0 && !isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    safeSetIsLoading(true);
    setIsTranscribing(true);
    setIsSummarizing(true);
    try {
      setVideoUrl(input);

      // Process video with custom API
      const { transcription, summary } = await fetch(`/api/videoProcessing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: input }),
      }).then((res) => res.json());

      setTranscription(transcription);
      setSummary(summary);

      toast({
        title: "Success",
        description: "Video processed successfully!",
      });

      if (userQuotaRemaining > 0) {
        safeSetUserQuotaRemaining(userQuotaRemaining - 1);
      }

      onSuccess();
    } catch (error: unknown) {
      console.error(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      safeSetIsLoading(false);
      setIsTranscribing(false);
      setIsSummarizing(false);
      setInput("");
    }
  };

  return (
    <section>
      <h2 className="sr-only">Video Input Form</h2>
      <motion.form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-4 w-full max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center bg-muted rounded-md p-2">
          <Input
            type="url"
            placeholder="Enter YouTube URL"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInput(e.target.value)
            }
            disabled={isLoading}
            className="bg-transparent text-foreground placeholder:text-muted-foreground"
            aria-label="YouTube URL input"
            required
          />
          <img
            src="/youtube-logo.svg"
            alt="YouTube logo"
            className="w-6 h-6 ml-2"
            aria-hidden="true"
          />
        </div>
        <div className="relative">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/80 transition-colors text-primary-foreground"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <div className="flex items-center justify-center">
                  <div
                    className="w-5 h-5 mr-2 border-2 border-primary-foreground rounded-full border-r-transparent animate-spin"
                    aria-hidden="true"
                  ></div>
                  <span>Processing...</span>
                </div>
                <span className="sr-only">Processing video, please wait</span>
              </>
            ) : (
              "Generate Summary"
            )}
          </Button>
        </div>
      </motion.form>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </section>
  );
}
