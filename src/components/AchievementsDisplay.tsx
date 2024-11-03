import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAchievementStore } from "@/store/achievementStore";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

interface AchievementsDisplayProps {
  dict: any;
}

const AchievementsDisplay: React.FC<AchievementsDisplayProps> = ({ dict }) => {
  const { achievements, progress, unlockedAchievements } =
    useAchievementStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence>
        {achievements.map((achievement) => {
          const currentProgress = progress[achievement.id] || 0;
          const isUnlocked = unlockedAchievements.includes(achievement.id);
          const progressPercentage =
            (currentProgress / achievement.maxProgress) * 100;

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative"
            >
              <Card
                className={`h-full transition-colors ${
                  isUnlocked
                    ? "bg-primary/10 border-primary"
                    : "bg-card/50 hover:bg-card/80"
                }`}
              >
                {isUnlocked && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                    ✓
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{achievement.icon}</span>
                    <TextGenerateEffect words={achievement.title} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{achievement.condition}</span>
                      <span>
                        {currentProgress}/{achievement.maxProgress}
                      </span>
                    </div>
                    <Progress value={progressPercentage} />
                  </div>
                  {isUnlocked && achievement.unlockedAt && (
                    <p className="text-xs text-muted-foreground">
                      {dict.achievements?.unlockedOn ?? "Unlocked on"}{" "}
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AchievementsDisplay;
