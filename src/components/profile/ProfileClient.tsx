"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuotaDisplay from "@/components/ui/quota-display";
import type { User } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileClientProps {
  user: User;
  profile: Profile;
  dict: any;
}

const ProfileClient: React.FC<ProfileClientProps> = ({
  user,
  profile,
  dict,
}) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{dict.profile.title}</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{dict.profile.userInfo}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">{dict.profile.email}</h2>
                <p>{user?.email}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold">{dict.profile.quota}</h2>
                <QuotaDisplay
                  currentQuota={profile.quota_remaining}
                  maxQuota={profile.quota_max}
                  resetDate={new Date(profile.quota_reset_date)}
                  plan={profile.plan}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileClient;
