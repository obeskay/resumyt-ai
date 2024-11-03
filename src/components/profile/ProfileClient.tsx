"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuotaDisplay from "@/components/ui/quota-display";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import SummaryDisplay from "@/components/SummaryDisplay";

type AnonymousUser = Database["public"]["Tables"]["anonymous_users"]["Row"];

interface ProfileClientProps {
  user: User | null;
  dict: any;
  userData: AnonymousUser | null;
}

const ProfileClient: React.FC<ProfileClientProps> = ({
  user,
  dict,
  userData,
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
              {userData && (
                <div>
                  <h2 className="text-lg font-semibold">
                    {dict.profile.quota}
                  </h2>
                  <QuotaDisplay
                    currentQuota={userData.quota_remaining}
                    maxQuota={userData.quota_limit}
                    resetDate={
                      new Date(userData.quota_reset_date || Date.now())
                    }
                    plan={userData.plan_type}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileClient;
