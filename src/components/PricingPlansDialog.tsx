import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getSupabase, updateUserPlan, getAnonymousUserByIp } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface PricingPlan {
  id: number;
  name: string;
  price: number;
  quota: number;
  features: { [key: string]: string };
}

export function PricingPlansDialog() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchPricingPlans() {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching pricing plans:', error);
      } else {
        setPlans(data);
      }
    }

    async function fetchUserId() {
      const response = await fetch('/api/getIp');
      const { ip } = await response.json();
      const user = await getAnonymousUserByIp(ip);
      if (user) {
        setUserId(user.id);
      }
    }

    fetchPricingPlans();
    fetchUserId();
  }, []);

  const handleSelectPlan = async (planId: number) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Unable to update plan. User not found.",
        variant: "destructive",
      });
      return;
    }

    const success = await updateUserPlan(userId, planId);
    if (success) {
      toast({
        title: "Success",
        description: "Your plan has been updated successfully.",
      });
      setIsOpen(false);
      router.refresh(); // Refresh the page to reflect the new plan
    } else {
      toast({
        title: "Error",
        description: "Failed to update your plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">View Pricing Plans</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pricing Plans</DialogTitle>
          <DialogDescription>
            Choose a plan that suits your needs
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-2xl font-semibold mb-4">${plan.price.toFixed(2)}/month</p>
              <p className="mb-4">Quota: {plan.quota} summaries/month</p>
              <ul className="list-disc list-inside mb-4">
                {Object.values(plan.features).map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
              <Button className="w-full" onClick={() => handleSelectPlan(plan.id)}>
                Select Plan
              </Button>
            </motion.div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
