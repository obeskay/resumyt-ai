import React from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { QuotaInfo } from "@/lib/quotaManager";
import { formatDistanceToNow } from "date-fns";

interface QuotaDisplayProps {
  currentQuota: number | null;
  maxQuota: number | null;
  resetDate: Date;
  plan: string | null;
}

const QuotaDisplay: React.FC<QuotaDisplayProps> = ({
  currentQuota,
  maxQuota,
  resetDate,
  plan,
}) => {
  const quota = currentQuota ?? 0;
  const max = maxQuota ?? 0;
  const planType = plan ?? "free";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <TextGenerateEffect words="Your Quota" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{quota} remaining</span>
              <span>of {max} total</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(quota / max) * 100}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Plan: {planType}
              <br />
              Resets: {resetDate.toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuotaDisplay;
