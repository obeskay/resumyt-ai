import React from "react";
import { motion } from "framer-motion";
import { GradientText } from "@/components/ui/gradient-text";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  dict: any;
  faqs: FAQItem[];
}

export const FAQSection: React.FC<FAQSectionProps> = ({ dict, faqs }) => {
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
          <TextGenerateEffect
            words={dict.home?.faq?.title ?? "Frequently Asked Questions"}
          />
        </GradientText>
      </h2>
      <div className="space-y-8 max-w-3xl mx-auto">
        {faqs.map((item, index) => (
          <motion.div
            key={index}
            className="bg-card/30 p-6 rounded-3xl backdrop-blur-md border border-px border-border/50"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold mb-2">
              <TextGenerateEffect words={item.question} />
            </h3>
            <p className="text-muted-foreground">
              <TextGenerateEffect words={item.answer} />
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};
