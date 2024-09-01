import React from 'react';
import { motion, useInView, useAnimationControls } from 'framer-motion';
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
  const controls = useAnimationControls();

  React.useEffect(() => {
    if (isInView) {
      controls.start({
        backgroundSize: ['200% 100%', '100% 100%', '200% 100%', '100% 100%'],
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%', '0% 50%'],
        transition: {
          duration: 2,
          ease: 'easeInOut',
        },
      });
    }
  }, [isInView]);

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
        "relative inline-block bg-clip-text text-transparent bg-gradient-to-r",
        className, gradientClassName
      )}
      initial={{ backgroundSize: '200% 100%', backgroundPosition: '100% 50%', opacity: 0, y: 20 }}
      animate={controls}
      whileInView={{ opacity: 1, y: 0 }}
      style={{ 
        backgroundSize: '200% 100%',
        backgroundRepeat: 'no-repeat',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
      viewport={{ once: true, amount: 0.5, margin: "0px 0px -50px 0px" }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {seoText && <span className="sr-only">{seoText}</span>}
      {isInView ? renderChildren() : children}
    </motion.span>
  );
};