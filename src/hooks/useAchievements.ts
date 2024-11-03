import { useEffect } from "react";
import {
  useAchievementStore,
  defaultAchievements,
} from "@/store/achievementStore";
import { useNotificationStore } from "@/store/notificationStore";

export function useAchievements(dict: any) {
  const {
    achievements,
    initializeAchievements,
    updateProgress,
    unlockedAchievements,
  } = useAchievementStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (achievements.length === 0) {
      initializeAchievements(defaultAchievements);
    }
  }, [achievements.length, initializeAchievements]);

  const handleAchievementProgress = (type: string, amount: number = 1) => {
    const relevantAchievements = achievements.filter((a) => a.type === type);

    relevantAchievements.forEach((achievement) => {
      if (!unlockedAchievements.includes(achievement.id)) {
        const currentProgress =
          useAchievementStore.getState().progress[achievement.id] || 0;
        const newProgress = currentProgress + amount;

        updateProgress(achievement.id, newProgress);

        if (newProgress >= achievement.maxProgress) {
          addNotification({
            type: "success",
            title:
              dict.achievements?.notifications?.unlocked ??
              "Achievement unlocked!",
            message: achievement.title,
            duration: 5000,
          });
        }
      }
    });
  };

  return { handleAchievementProgress };
}
