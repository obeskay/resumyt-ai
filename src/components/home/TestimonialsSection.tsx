import React from "react";
import { motion } from "framer-motion";
import { GradientText } from "@/components/ui/gradient-text";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

interface TestimonialProps {
  quote: string;
  name: string;
  title: string;
}

interface TestimonialsSectionProps {
  dict: any;
  testimonials: TestimonialProps[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  dict,
  testimonials,
}) => {
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
          {dict.home?.testimonials?.title ?? "Testimonials"}
        </GradientText>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            className="p-6 rounded-3xl bg-card/30 backdrop-blur-md border border-px border-border/50"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <p className="text-lg mb-4 italic">
              <TextGenerateEffect words={`"${testimonial.quote}"`} />
            </p>
            <div className="font-semibold">
              <TextGenerateEffect words={testimonial.name} />
            </div>
            <div className="text-sm text-muted-foreground">
              <TextGenerateEffect words={testimonial.title} />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};
