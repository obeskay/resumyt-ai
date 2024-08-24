import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryDisplayProps {
  summary: string | null;
  isLoading: boolean;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({
  summary,
  isLoading,
}) => {
  if (!summary && !isLoading) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full mt-8">
        {isLoading ? (
          <>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm md:text-base whitespace-pre-wrap">
              {summary}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SummaryDisplay;
