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

export default function SummaryPage() {
  const { id } = useParams();
  const [summary, setSummary] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharing, setSharing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSummaryAndTranscript() {
      try {
        setLoading(true);
        setError(null);
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('summaries')
          .select('*')
          .eq('video_id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Summary not found');
        setSummary(data.content);
        setTranscript(data.transcript);
      } catch (error) {
        console.error('Error fetching summary and transcript:', error);
        setError(error.message || 'Failed to fetch summary and transcript');
        toast({
          title: "Error",
          description: error.message || "Failed to fetch summary and transcript. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchSummaryAndTranscript();
    }
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
      console.error('Failed to copy:', err);
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
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Video Summary and Transcript</h1>
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
              <p className="text-red-500 text-sm md:text-base">Error: {error}</p>
            ) : summary ? (
              <>
                <SummaryDisplay summary={summary} isLoading={false} />
                <Button 
                  onClick={handleShare} 
                  className="mt-4" 
                  disabled={sharing}
                >
                  {sharing ? 'Sharing...' : 'Share Summary'}
                </Button>
              </>
            ) : (
              <p className="text-gray-500 text-sm md:text-base">No summary found.</p>
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
              <p className="text-red-500 text-sm md:text-base">Error: {error}</p>
            ) : transcript ? (
              <TranscriptDisplay transcript={transcript} isLoading={false} />
            ) : (
              <p className="text-gray-500 text-sm md:text-base">No transcript found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
