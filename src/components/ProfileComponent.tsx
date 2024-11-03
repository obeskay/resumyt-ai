import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuotaDisplay from "@/components/ui/quota-display";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { motion } from "framer-motion";
import { getDictionary } from "@/lib/getDictionary";

interface ProfileProps {
  profile: {
    quota_remaining: number;
    max_quota: number;
    reset_date: string;
    plan: string;
    summaryHistory?: Array<{
      id: string;
      title: string;
      date: string;
      videoId: string;
    }>;
  };
  lang: string;
}

const ProfileComponent: React.FC<ProfileProps> = async ({ profile, lang }) => {
  const dict = await getDictionary(lang);

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <h1 className="text-3xl font-bold">
          <TextGenerateEffect words={dict.profile?.title ?? "Your Profile"} />
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cuota y Plan */}
          <div className="md:col-span-1">
            <QuotaDisplay
              currentQuota={profile.quota_remaining}
              maxQuota={profile.max_quota}
              resetDate={new Date(profile.reset_date)}
              plan={profile.plan}
            />
          </div>

          {/* Historial de Resúmenes */}
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
                  {profile.summaryHistory?.map((summary) => (
                    <motion.div
                      key={summary.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
                    >
                      <h3 className="font-medium">{summary.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(summary.date).toLocaleDateString(lang)}
                      </p>
                    </motion.div>
                  ))}
                </TabsContent>
                <TabsContent value="favorites">
                  {/* Implementar favoritos más tarde */}
                  <p className="text-muted-foreground">
                    {dict.profile?.comingSoon ?? "Coming soon"}
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileComponent;
