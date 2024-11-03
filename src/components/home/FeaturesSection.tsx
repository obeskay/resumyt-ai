import React from "react";
import { motion } from "framer-motion";
import { FeatureCard } from "@/components/home/FeatureCard";

interface FeaturesSectionProps {
  dict: any;
  features: any[];
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  dict,
  features,
}) => {
  return (
    <motion.section
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {features.map((feature, index) => (
        <FeatureCard key={index} feature={feature} index={index} />
      ))}
    </motion.section>
  );
};
