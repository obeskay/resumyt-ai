import React from "react";
import { motion } from "framer-motion";

interface SummaryDisplayProps {
  summary: string | null;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary }) => {
  if (!summary) {
    return null;
  }

  return (
    <motion.div className="w-full">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full"
      >
        <p className="text-sm md:text-base whitespace-pre-wrap">{summary}</p>
      </motion.div>
    </motion.div>
  );
};

export default SummaryDisplay;
