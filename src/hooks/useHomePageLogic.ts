import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/router";
import { useLoadingStore } from "@/store/loadingStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useAchievements } from "@/hooks/useAchievements";
import { getSupabase } from "@/lib/supabase";
import { AnonymousUser } from "@/types/supabase";
import { Locale } from "@/i18n-config";
import { initSmoothScroll } from "@/lib/smoothScroll";

export const useHomePageLogic = (dict: any, lang: Locale) => {
  const [user, setUser] = useState<AnonymousUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();
  const [recentVideos, setRecentVideos] = useState<string[]>([]);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoInputRef = useRef<HTMLDivElement>(null);
  const { setLoading } = useLoadingStore();
  const { addNotification } = useNotificationStore();
  const { handleAchievementProgress } = useAchievements(dict);

  const initializeUser = async (retries = 3) => {
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
  };

  const fetchRecentVideos = async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("summaries")
      .select("video_id")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching recent videos:", error);
    } else {
      setRecentVideos(data.map((item) => item.video_id));
    }
  };

  useEffect(() => {
    initializeUser();
    fetchRecentVideos();
  }, []);

  const handleSubmit = async (url: string, videoTitle: string) => {
    if (!user) return;

    setIsSubmitting(true);
    setLoading(true);
    try {
      addNotification({
        type: "info",
        title: dict.loading?.title ?? "Processing",
        message: dict.loading?.description ?? "Please wait...",
        duration: 3000,
      });

      const response = await fetch(
        `/api/summarize?url=${url}&format=unified&lang=${lang}&title=${encodeURIComponent(videoTitle)}`,
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.videoId) {
        handleAchievementProgress("summaries");
        addNotification({
          type: "success",
          title: dict.summary?.title ?? "Success",
          message:
            dict.summary?.successMessage ?? "Summary generated successfully!",
          duration: 5000,
        });
        router.push(`/${lang}/summary/${data.videoId}`);
      } else {
        throw new Error("No valid videoId received");
      }
    } catch (error) {
      console.error("Error summarizing video:", error);
      addNotification({
        type: "error",
        title: dict.error?.title ?? "Error",
        message: dict.error?.message ?? "Failed to generate summary",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
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
  };
};
