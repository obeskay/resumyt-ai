"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { ErrorBoundary } from "react-error-boundary";
import { useRouter } from "next/navigation";
import MainLayout from "../components/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import VideoInput from "../components/VideoInput";
import { getOrCreateAnonymousUser } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ErrorFallback({ error }: { error: Error }) {
  console.error("Error in HomePage:", error);
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
        Something went wrong
      </h1>
      <pre
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        {error.message}
      </pre>
    </div>
  );
}

const HomePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInitialized, setUserInitialized] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [transcriptionsLeft, setTranscriptionsLeft] = useState(3);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function initializeUser(retries = 3) {
      try {
        setLoading(true);

        // Get the IP address
        const response = await fetch("/api/getIp");
        const { ip } = await response.json();

        const anonymousUser = await getOrCreateAnonymousUser(ip);
        if (!anonymousUser) {
          throw new Error("Failed to create or retrieve anonymous user");
        }
        setUser(anonymousUser);

        const usedTranscriptions = anonymousUser.transcriptions_used || 0;
        setTranscriptionsLeft(Math.max(0, 3 - usedTranscriptions));

        if (!localStorage.getItem("dialogShown")) {
          setShowDialog(true);
          localStorage.setItem("dialogShown", "true");
        }

        setUserInitialized(true);
      } catch (error) {
        console.error("Error initializing user:", error);
        if (retries > 0) {
          console.log(
            `Retrying user initialization. Attempts left: ${retries - 1}`
          );
          await initializeUser(retries - 1);
        } else {
          toast({
            title: "Error",
            description:
              "Failed to initialize user. Please refresh the page or try again later.",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    }

    initializeUser();
  }, [toast]);

  const handleTranscriptionUsed = () => {
    setTranscriptionsLeft((prev) => Math.max(0, prev - 1));
  };

  const handleSummaryGenerated = (summaryId: any) => {
    setIsSummarizing(false);
    handleTranscriptionUsed();
    router.push(`/summary/${summaryId}`);
  };

  const handleSummarizationStart = () => {
    setIsSummarizing(true);
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {userInitialized && user && (
            <VideoInput
              onSuccess={handleSummaryGenerated}
              onStart={handleSummarizationStart}
              userId={user.id}
            />
          )}
        </div>
        <Toaster />
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Welcome to YouTube Summarizer!
              </DialogTitle>
              <DialogDescription className="text-sm md:text-base">
                As an anonymous user, you have 3 free transcriptions. Create an
                account to enjoy unlimited summaries and more features!
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowDialog(false)} className="w-full">
                Got it!
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </MainLayout>
    </ErrorBoundary>
  );
};

//Obtains the ip in server (nextjs:) and serve to HomePage
export async function getServerSideProps(context: {
  req: { headers: { "x-real-ip": string } };
}) {
  const ip = context.req.headers["x-real-ip"];

  return {
    props: {
      ip,
    },
  };
}

export default HomePage;
