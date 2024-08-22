"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import SummaryDisplay from "@/components/SummaryDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";

export default function SummaryPage() {
  const { id } = useParams();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('summaries')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setSummary(data);
      } catch (error) {
        console.error('Error fetching summary:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchSummary();
    }
  }, [id]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Summary link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Video Summary</h1>
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
            ) : summary ? (
              <>
                <SummaryDisplay summary={summary.content} isLoading={false} />
                <Button onClick={handleShare} className="mt-4">Share Summary</Button>
              </>
            ) : (
              <p className="text-red-500 text-sm md:text-base">Error: Unable to fetch summary. Please try again later.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
