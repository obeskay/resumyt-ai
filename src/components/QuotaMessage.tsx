import React from "react";
import { PricingPlansDialog } from "@/components/PricingPlansDialog";

interface QuotaMessageProps {
  quotaRemaining: number;
}

const QuotaMessage: React.FC<QuotaMessageProps> = ({ quotaRemaining }) => (
  <div className="text-center mt-4">
    {quotaRemaining > 0 ? (
      <p className="text-sm text-muted-foreground">
        You have {quotaRemaining} summaries remaining today.
      </p>
    ) : (
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          You have reached your daily limit for video summaries.
        </p>
        <PricingPlansDialog />
      </div>
    )}
  </div>
);

export default QuotaMessage;