import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuotaDisplay from "@/components/ui/quota-display";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { motion } from "framer-motion";

type AnonymousUser = Database["public"]["Tables"]["anonymous_users"]["Row"];

interface ProfileComponentProps {
  user: User | null;
  dict: {
    profile: {
      title: string;
      userInfo: string;
      email: string;
      quota: string;
      summaryHistory: string;
      recent: string;
      favorites: string;
      statistics: string;
      totalSummaries: string;
      memberSince: string;
      settings: string;
      preferences: string;
      language: string;
      theme: string;
      notifications: string;
      comingSoon: string;
    };
  };
  userData: AnonymousUser | null;
}

const ProfileComponent: React.FC<ProfileComponentProps> = ({
  user,
  dict,
  userData,
}) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold mb-4">{dict.profile.title}</h1>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{dict.profile.userInfo}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="recent" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="recent">
                    {dict.profile.recent}
                  </TabsTrigger>
                  <TabsTrigger value="favorites">
                    {dict.profile.favorites}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="recent">
                  {/* Implementar historial reciente aquí */}
                  <p className="text-muted-foreground">
                    {dict.profile.comingSoon}
                  </p>
                </TabsContent>
                <TabsContent value="favorites">
                  {/* Implementar favoritos más tarde */}
                  <p className="text-muted-foreground">
                    {dict.profile.comingSoon}
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          {userData && (
            <Card>
              <CardHeader>
                <CardTitle>{dict.profile.quota}</CardTitle>
              </CardHeader>
              <CardContent>
                <QuotaDisplay
                  currentQuota={userData.quota_remaining}
                  maxQuota={userData.quota_limit}
                  resetDate={new Date(userData.quota_reset_date || Date.now())}
                  plan={userData.plan_type}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileComponent;
