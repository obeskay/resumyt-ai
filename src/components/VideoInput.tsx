"use client";
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "./ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useLoadingAnimation } from "@/hooks/useLoadingAnimation";

interface VideoInputProps {
  quotaRemaining: number;
  onSubmit: (url: string, videoTitle: string) => Promise<void>;
  dict: any;
}

const VideoInput: React.FC<VideoInputProps> = ({
  quotaRemaining,
  onSubmit,
  dict,
}) => {
  const [url, setUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { currentAnimation } = useLoadingAnimation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsValidating(true);
    try {
      const response = await fetch(`/api/validate-url?url=${url}`);
      const data = await response.json();

      if (data.valid) {
        await onSubmit(url, data.title || "");
      } else {
        throw new Error(data.error || "Invalid URL");
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: dict.error?.title ?? "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="url"
            placeholder={
              dict.videoInput?.placeholder ?? "Paste YouTube URL here"
            }
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            required
          />
          <Button
            type="submit"
            disabled={!url || isValidating || quotaRemaining <= 0}
            className="min-w-[120px]"
          >
            {isValidating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {dict.videoInput?.processing ?? "Processing..."}
              </div>
            ) : (
              (dict.videoInput?.button ?? "Summarize")
            )}
          </Button>
        </div>
      </form>

      {quotaRemaining <= 1 && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>
            {dict.alerts?.lowQuota?.title ?? "Low Quota Alert"}
          </AlertTitle>
          <AlertDescription>
            {dict.alerts?.lowQuota?.message ??
              "You're running low on summaries. Consider upgrading your plan!"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default VideoInput;
