import React from "react";
import { motion } from "framer-motion";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature, index }) => (
  <motion.div
    className="p-6 rounded-3xl bg-card/30 backdrop-blur-md border border-px border-border/50"
    initial={{ opacity: 0 }}
    whileInView={{
      opacity: 1,
      y: 0,
    }}
    transition={{
      duration: 0.5,
      delay: 0.125 * index,
      staggerChildren: 0.1,
    }}
    viewport={{ once: true }}
  >
    {feature.icon}
    <h3 className="text-xl font-semibold mb-2 mt-4">
      <TextGenerateEffect words={feature.title} />
    </h3>
    <p className="text-muted-foreground">
      <TextGenerateEffect words={feature.description} />
    </p>
  </motion.div>
);
