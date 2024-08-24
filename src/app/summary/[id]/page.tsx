"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import SummaryDisplay from "@/components/SummaryDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import ProgressBar from "@/components/ProgressBar";

export default function SummaryPage() {
  const params = useParams();
  const id = params?.id;
  const [summary, setSummary] = useState(null);
  const [videoTitle, setVideoTitle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]: any = useState(null);
  const [sharing, setSharing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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
            content,
            videos (
              title
            )
          `
          )
          .eq("video_id", id as string)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Summary not found");
        setSummary(data.content);
        setVideoTitle(data.videos.title);
      } catch (error: any) {
        setError(error.message || "Failed to fetch summary and transcript");
        toast({
          title: "Error",
          description:
            error.message ||
            "Failed to fetch summary and transcript. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSummaryAndTranscript();
  }, [id, toast, router]);

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
        className="container mx-auto px-4 py-8 max-w-3xl"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          Video Summary and Transcript
        </h1>
        <AnimatePresence>
          {videoTitle && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-2xl md:text-3xl font-semibold mb-4 text-center"
            >
              {videoTitle}
            </motion.h2>
          )}
        </AnimatePresence>
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-1/2" />
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
                >
                  <SummaryDisplay summary={summary} isLoading={false} />
                  <Button
                    onClick={handleShare}
                    className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={sharing}
                  >
                    {sharing ? "Sharing..." : "Share Summary"}
                  </Button>
                </motion.div>
              ) : (
                <motion.p
                  key="not-found"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-gray-500 text-sm md:text-base"
                >
                  No summary found.
                </motion.p>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          {id && typeof id === "string" ? (
            <ProgressBar summaryId={id} />
          ) : (
            <div className="w-full bg-muted rounded-full h-2.5 dark:bg-muted overflow-hidden">
              <div
                className="bg-gradient-light dark:bg-gradient-dark h-2.5 rounded-full animate-pulse"
                style={{ width: "100%" }}
              ></div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
