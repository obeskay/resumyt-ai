import React from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { QuotaInfo } from "@/lib/quotaManager";
import { formatDistanceToNow } from "date-fns";

interface QuotaDisplayProps {
  currentQuota: number;
  maxQuota: number;
  resetDate: Date;
  plan: string;
}

const QuotaDisplay: React.FC<QuotaDisplayProps> = ({
  currentQuota,
  maxQuota,
  resetDate,
  plan,
}) => {
  const percentage = (currentQuota / maxQuota) * 100;
  const timeUntilReset = formatDistanceToNow(resetDate);

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
              <span>
                {currentQuota} / {maxQuota}
              </span>
              <span>{Math.round(percentage)}%</span>
            </div>
            <Progress value={percentage} />
          </div>
          <div className="text-sm text-muted-foreground">
            <TextGenerateEffect words={`Resets in ${timeUntilReset}`} />
          </div>
          <div className="text-sm font-medium">
            <TextGenerateEffect words={`Plan: ${plan}`} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuotaDisplay;
