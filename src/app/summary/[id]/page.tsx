"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "@/components/MainLayout";
import SummaryDisplay from "@/components/SummaryDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/types/supabase";
import { cn } from "@/lib/utils";
import YouTubeThumbnail from "@/components/YouTubeThumbnail";

// Extract the Summary type from the supabase database
type Summary = Database["public"]["Tables"]["summaries"]["Row"] & {
  videos?: {
    title: string | null;
    thumbnail_url: string | null;
  } | null;
};

export default function SummaryPage() {
  const params = useParams();
  const id = params?.id;
  const [summary, setSummary] = useState<Summary | null>(null);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSummaryAndTranscript() {
      if (!id || typeof id !== "string") {
        setError("Invalid video ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from("summaries")
          .select(
            `
            id,
            video_id,
            content,
            transcript,
            created_at,
            user_id,
            videos (
              title,
              thumbnail_url
            )
          `
          )
          .eq("video_id", id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Summary not found");
        setSummary(data as any);
        setVideoTitle(data.videos?.title || "Unknown Video");
        setVideoThumbnail(data.videos?.thumbnail_url || null);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        setError(errorMessage);
        toast({
          title: "Error",
          description:
            errorMessage ||
            "Failed to fetch summary and transcript. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSummaryAndTranscript();
  }, [id, toast]);

  const handleShare = async () => {
    setSharing(true);
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Success",
        description: "Summary link copied to clipboard!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSharing(false);
    }
  };

  return (
    <MainLayout>
      <motion.div
        layoutId="summary-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="w-full flex-grow flex flex-col justify-start items-center pt-8"
      >
        <AnimatePresence>
          {videoTitle && videoThumbnail && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 text-center"
            >
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                {videoTitle}
              </h2>
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
        <Card className="max-w-3xl w-full">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  className="space-y-4 w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className={cn(
                        "h-4",
                        index % 2 === 0 ? "w-full" : "w-3/4"
                      )}
                    />
                  ))}
                </motion.div>
              ) : error ? (
                <motion.p
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-red-500 text-sm md:text-base"
                >
                  Error: {error}
                </motion.p>
              ) : summary ? (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 w-full"
                >
                  <SummaryDisplay summary={summary.content} />
                  <Button onClick={handleShare} disabled={sharing}>
                    {sharing ? "Sharing..." : "Share Summary"}
                  </Button>
                </motion.div>
              ) : (
                <motion.p
                  key="not-found"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm md:text-base"
                >
                  No summary found.
                </motion.p>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
}
