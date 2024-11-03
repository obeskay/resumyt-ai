import React from "react";
import { motion } from "framer-motion";
import { GradientText } from "@/components/ui/gradient-text";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { getHowItWorks } from "@/lib/howItWorks";

interface HowItWorksSectionProps {
  dict: any;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  dict,
}) => {
  const steps = getHowItWorks(dict);

  return (
    <motion.section
      className="py-20"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <h2 className="text-4xl font-bold text-center mb-10">
        <GradientText>
          {dict.home?.howItWorks?.title ?? "How It Works"}
        </GradientText>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((item, index) => (
          <motion.div
            key={index}
            className="p-8 rounded-3xl bg-card/30 backdrop-blur-sm border border-px border-border/50"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="text-4xl font-bold text-primary mb-4">
              {item.step}
            </div>
            <h3 className="text-2xl font-semibold mb-2">
              <TextGenerateEffect words={item.title} />
            </h3>
            <p className="text-muted-foreground">
              <TextGenerateEffect words={item.description} />
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};
