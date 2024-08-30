"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const CardStack = ({
  items,
  offset,
  scaleFactor,
}: {
  items: {
    id: number;
    content: string;
    name: string;
    designation: string;
  }[];
  offset?: number;
  scaleFactor?: number;
}) => {
  const [cards, setCards] = useState(items);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCards((prevCards) => {
        const newCards = [...prevCards];
        const firstCard = newCards.shift();
        if (firstCard) newCards.push(firstCard);
        return newCards;
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="relative h-60 w-60 md:h-80 md:w-80">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          className="absolute inset-0 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-3xl p-4 shadow-xl dark:shadow-2xl flex flex-col justify-between"
          style={{
            transformOrigin: "top center",
          }}
          animate={{
            top: index * ((offset || 10) / 2),
            scale: 1 - index * ((scaleFactor || 0.05) / 2),
            zIndex: cards.length - index,
          }}
        >
          <div>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm">
              {card.designation}
            </p>
            <p className="mt-2 text-neutral-700 dark:text-neutral-200 font-semibold">
              {card.content}
            </p>
          </div>
          <div>
            <p className="text-neutral-700 dark:text-neutral-300 font-semibold mt-4">
              {card.name}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};