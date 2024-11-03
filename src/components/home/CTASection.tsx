import React from "react";
import { motion } from "framer-motion";
import { GradientText } from "@/components/ui/gradient-text";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  dict: any;
  onGetStarted: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({
  dict,
  onGetStarted,
}) => (
  <motion.section
    className="py-20 text-center"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true }}
  >
    <h2 className="text-4xl font-bold mb-6">
      <GradientText>
        {dict.home?.cta?.title ?? "Ready to Get Started?"}
      </GradientText>
    </h2>
    <p className="text-xl text-muted-foreground mb-8">
      <TextGenerateEffect
        words={
          dict.home?.cta?.description ??
          "Join thousands of satisfied users and start summarizing your videos today."
        }
      />
    </p>
    <Button size="lg" className="text-lg px-8 py-4" onClick={onGetStarted}>
      {dict.home?.cta?.button ?? "Get Started"}
    </Button>
  </motion.section>
);
