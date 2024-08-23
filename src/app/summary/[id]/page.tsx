"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import SummaryDisplay from "@/components/SummaryDisplay";
import TranscriptDisplay from "@/components/TranscriptDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import ProgressBar from "@/components/ProgressBar";

export default function SummaryPage() {
  const params = useParams();
  const id = params?.id;
  const [summary, setSummary] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [videoTitle, setVideoTitle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharing, setSharing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSummaryAndTranscript() {
      if (!id || typeof id !== 'string') {
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
            transcript,
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
        setTranscript(data.transcript);
        setVideoTitle(data.videos.title);
      } catch (error) {
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
        layoutId="video-input-container"
        className="container mx-auto px-4 py-8 max-w-3xl"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          Video Summary and Transcript
        </h1>
        {videoTitle && (
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-center">
            {videoTitle}
          </h2>
        )}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2" />
              </>
            ) : error ? (
              <p className="text-red-500 text-sm md:text-base">
                Error: {error}
              </p>
            ) : summary ? (
              <>
                <SummaryDisplay summary={summary} isLoading={false} />
                <Button
                  onClick={handleShare}
                  className="mt-4"
                  disabled={sharing}
                >
                  {sharing ? "Sharing..." : "Share Summary"}
                </Button>
              </>
            ) : (
              <p className="text-gray-500 text-sm md:text-base">
                No summary found.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2" />
              </>
            ) : error ? (
              <p className="text-red-500 text-sm md:text-base">
                Error: {error}
              </p>
            ) : transcript ? (
              <TranscriptDisplay transcript={transcript} isLoading={false} />
            ) : (
              <p className="text-gray-500 text-sm md:text-base">
                No transcript found.
              </p>
            )}
          </CardContent>
        </Card>
        <div className="mt-8">
          {id && typeof id === 'string' ? (
            <ProgressBar summaryId={id} />
          ) : (
            <div className="w-full bg-muted rounded-full h-2.5 dark:bg-muted overflow-hidden">
              <div className="bg-gradient-light dark:bg-gradient-dark h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          )}
        </div>
      </motion.div>
    </MainLayout>
  );
}
