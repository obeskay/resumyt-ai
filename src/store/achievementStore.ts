import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: string;
  progress: number;
  maxProgress: number;
  unlockedAt?: Date;
  type: "summaries" | "streak" | "shares" | "special";
}

interface AchievementState {
  achievements: Achievement[];
  unlockedAchievements: string[];
  progress: Record<string, number>;
  unlockAchievement: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
  initializeAchievements: (achievements: Achievement[]) => void;
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set) => ({
      achievements: [],
      unlockedAchievements: [],
      progress: {},
      unlockAchievement: (id) =>
        set((state) => ({
          unlockedAchievements: [...state.unlockedAchievements, id],
          achievements: state.achievements.map((a) =>
            a.id === id ? { ...a, unlockedAt: new Date() } : a,
          ),
        })),
      updateProgress: (id, progress) =>
        set((state) => {
          const achievement = state.achievements.find((a) => a.id === id);
          if (!achievement) return state;

          const newProgress = Math.min(progress, achievement.maxProgress);
          if (
            newProgress >= achievement.maxProgress &&
            !state.unlockedAchievements.includes(id)
          ) {
            return {
              progress: { ...state.progress, [id]: newProgress },
              unlockedAchievements: [...state.unlockedAchievements, id],
              achievements: state.achievements.map((a) =>
                a.id === id ? { ...a, unlockedAt: new Date() } : a,
              ),
            };
          }

          return {
            progress: { ...state.progress, [id]: newProgress },
          };
        }),
      initializeAchievements: (achievements) => set({ achievements }),
    }),
    {
      name: "achievements-storage",
    },
  ),
);

// Definir los logros predeterminados
export const defaultAchievements: Achievement[] = [
  {
    id: "first-summary",
    title: "Primer Resumen",
    description: "Genera tu primer resumen de video",
    icon: "🎯",
    condition: "Generar 1 resumen",
    progress: 0,
    maxProgress: 1,
    type: "summaries",
  },
  {
    id: "power-user",
    title: "Usuario Experto",
    description: "Genera 10 resúmenes",
    icon: "⭐",
    condition: "Generar 10 resúmenes",
    progress: 0,
    maxProgress: 10,
    type: "summaries",
  },
  {
    id: "daily-streak",
    title: "Racha Diaria",
    description: "Usa Resumyt durante 7 días seguidos",
    icon: "🔥",
    condition: "7 días consecutivos",
    progress: 0,
    maxProgress: 7,
    type: "streak",
  },
  {
    id: "share-master",
    title: "Maestro Compartiendo",
    description: "Comparte 5 resúmenes con otros",
    icon: "🌟",
    condition: "Compartir 5 resúmenes",
    progress: 0,
    maxProgress: 5,
    type: "shares",
  },
];
