import React from 'react';
import { motion, useInView } from 'framer-motion';
import { TextGenerateEffect } from './text-generate-effect';
import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  gradientClassName?: string;
  seoText?: string;
  useTextGenerate?: boolean;
}

export const GradientText: React.FC<GradientTextProps> = ({ 
  children, 
  className = '',
  gradientClassName = 'from-secondary to-secondary-foreground',
  seoText,
  useTextGenerate = false
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const renderChildren = () => {
    if (useTextGenerate && typeof children === 'string') {
      return (
        <TextGenerateEffect words={children} className="inline" inheritStyles={true} />
      );
    } else if (React.isValidElement(children)) {
      return React.cloneElement(children, {
        className: cn((children.props as any).className, 'text-transparent')
      } as any);
    } else {
      return children;
    }
  };

  return (
    <motion.span
      ref={ref}
      className={cn(
        "inline-block bg-clip-text text-transparent bg-gradient-to-r",
        gradientClassName,
        className
      )}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
    >
      {seoText && <span className="sr-only">{seoText}</span>}
      {isInView ? renderChildren() : children}
    </motion.span>
  );
};