import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/router";
import { useLoadingStore } from "@/store/loadingStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useAchievements } from "@/hooks/useAchievements";
import { getSupabase } from "@/lib/supabase";
import { AnonymousUser } from "@/types/supabase";
import { Locale } from "@/i18n-config";
import { initSmoothScroll } from "@/lib/smoothScroll";
import { getLocalizedPath } from "@/lib/navigation";

export const useHomePageLogic = (dict: any, lang: Locale) => {
  const [user, setUser] = useState<AnonymousUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();
  const [recentVideos, setRecentVideos] = useState<string[]>([]);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoInputRef = useRef<HTMLDivElement>(null);
  const [isLoadingQuota, setIsLoadingQuota] = useState(false);
  const { setLoading } = useLoadingStore();
  const { addNotification } = useNotificationStore();
  const { handleAchievementProgress } = useAchievements(dict);

  const initializeUser = useCallback(
    async (retries = 3) => {
      try {
        setIsInitializing(true);
        const response = await fetch("/api/getIp");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { ip } = await response.json();
        const supabase = getSupabase();

        const { data: user, error: rpcError } = await supabase.rpc(
          "get_or_create_anonymous_user",
          {
            user_ip: ip,
            initial_quota: 3,
            initial_plan: "F",
          },
        );

        if (rpcError) {
          throw new Error(`Failed to initialize user: ${rpcError.message}`);
        }

        if (user) {
          setUser(user);
        } else {
          throw new Error("Failed to create or retrieve user");
        }
      } catch (error) {
        console.error("Error initializing user:", error);
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          await initializeUser(retries - 1);
        } else {
          toast({
            title: "Error",
            description: "Failed to initialize user. Please refresh the page.",
            variant: "destructive",
          });
        }
      } finally {
        setIsInitializing(false);
      }
    },
    [toast],
  );

  const fetchRecentVideos = async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("summaries")
      .select("video_id")
      .order("created_at", { ascending: false })
      .limit(15);

    if (error) {
      console.error("Error fetching recent videos:", error);
    } else {
      setRecentVideos(data.map((item) => item.video_id));
    }
  };

  useEffect(() => {
    setIsLoadingQuota(true);
    initializeUser();
    fetchRecentVideos();
    setIsLoadingQuota(false);
  }, [initializeUser]);

  const handleSubmit = async (url: string, lang: string) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(
        `/api/summarize?url=${encodeURIComponent(url)}&lang=${lang}`,
      );

      if (!response.ok) {
        throw new Error("Failed to summarize video");
      }

      const data = await response.json();

      console.log("data", data);

      if (data.success && data.data?.videoId) {
        router.push(`/summary/${data.data.videoId}`);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error submitting video:", error);
      toast({
        title: "Error",
        description: dict.error?.summaryFailed ?? "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToVideoInput = () => {
    if (videoInputRef.current) {
      const lenis = initSmoothScroll();
      lenis.scrollTo(videoInputRef.current);
    }
  };

  return {
    user,
    isInitializing,
    isSubmitting,
    recentVideos,
    handleSubmit,
    videoInputRef,
    scrollToVideoInput,
    isLoadingQuota,
  };
};
