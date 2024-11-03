import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AchievementsDisplay from "./AchievementsDisplay";
import { useAchievementStore } from "@/store/achievementStore";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import type { QuotaInfo } from "@/lib/quotaManager";

interface UserProfileProps {
  dict: any;
  userId: string;
  quotaInfo: QuotaInfo;
  summaryHistory: {
    id: string;
    title: string;
    date: string;
    videoId: string;
  }[];
}

const UserProfile: React.FC<UserProfileProps> = ({
  dict,
  userId,
  quotaInfo,
  summaryHistory,
}) => {
  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <h1 className="text-3xl font-bold">
          <TextGenerateEffect words={dict.profile?.title ?? "Your Profile"} />
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                <TextGenerateEffect
                  words={dict.profile?.summaryHistory ?? "Summary History"}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="recent" className="w-full">
                <TabsList>
                  <TabsTrigger value="recent">
                    {dict.profile?.recent ?? "Recent"}
                  </TabsTrigger>
                  <TabsTrigger value="favorites">
                    {dict.profile?.favorites ?? "Favorites"}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="recent" className="space-y-4">
                  {summaryHistory.map((summary) => (
                    <motion.div
                      key={summary.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
                    >
                      <h3 className="font-medium">{summary.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(summary.date).toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))}
                </TabsContent>
                <TabsContent value="favorites">
                  {/* Implementar favoritos más tarde */}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <TextGenerateEffect
                    words={dict.profile?.statistics ?? "Statistics"}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {dict.profile?.totalSummaries ?? "Total Summaries"}
                    </span>
                    <span className="font-medium">{summaryHistory.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {dict.profile?.memberSince ?? "Member Since"}
                    </span>
                    <span className="font-medium">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">
            <TextGenerateEffect
              words={dict.achievements?.title ?? "Achievements"}
            />
          </h2>
          <AchievementsDisplay dict={dict} />
        </section>
      </motion.div>
    </div>
  );
};

export default UserProfile;
