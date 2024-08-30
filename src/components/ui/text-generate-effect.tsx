"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
  inheritStyles = false,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
  inheritStyles?: boolean;
}) => {
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope, { once: true, amount: 0.5 });
  let wordsArray = words.split(" ");

  useEffect(() => {
    if (isInView) {
      animate(
        "span",
        {
          opacity: 1,
          filter: filter ? "blur(0px)" : "none",
        },
        {
          duration: duration ? duration : 1,
          delay: stagger(0.2),
        }
      );
    }
  }, [isInView, animate, filter, duration]);

  return (
    <>
      <motion.span ref={scope} className={cn( className)} aria-hidden="true">
        {wordsArray.map((word, idx) => (
          <React.Fragment key={word + idx}>
            <motion.span
              className={cn(
                "opacity-0 inline-block",
                inheritStyles ? "text-transparent" : ""
              )}
              style={{
                filter: filter ? "blur(10px)" : "none",
              }}
            >
              {word}
            </motion.span>
            {idx < wordsArray.length - 1 && " "}
          </React.Fragment>
        ))}
      </motion.span>
      <span className="sr-only">{words}</span>
    </>
  );
};
