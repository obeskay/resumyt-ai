import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import type { PricingPlan } from "@/lib/quotaManager";

interface PricingPlansProps {
  plans: PricingPlan[];
  currentPlan: string;
  onSelectPlan: (planId: number) => void;
  dict: any;
}

const PricingPlans: React.FC<PricingPlansProps> = ({
  plans,
  currentPlan,
  onSelectPlan,
  dict,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
      {plans.map((plan, index) => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card
            className={`relative h-full ${
              currentPlan === plan.name.toLowerCase()
                ? "border-primary"
                : "border-border"
            }`}
          >
            {currentPlan === plan.name.toLowerCase() && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                  {dict.pricing?.currentPlan ?? "Current Plan"}
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex justify-between items-baseline">
                <TextGenerateEffect words={plan.name} />
                <span className="text-2xl font-bold">
                  ${plan.price}
                  <span className="text-sm text-muted-foreground">
                    /{dict.pricing?.month ?? "month"}
                  </span>
                </span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {plan.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <Button
                className="w-full"
                variant={
                  currentPlan === plan.name.toLowerCase()
                    ? "outline"
                    : "default"
                }
                onClick={() => onSelectPlan(plan.id)}
                disabled={currentPlan === plan.name.toLowerCase()}
              >
                {currentPlan === plan.name.toLowerCase()
                  ? (dict.pricing?.currentPlanButton ?? "Current Plan")
                  : (dict.pricing?.selectPlanButton ?? "Select Plan")}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default PricingPlans;
