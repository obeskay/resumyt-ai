"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormatOption {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string;
}

const formatOptions: FormatOption[] = [
  {
    icon: <FileText className="w-8 h-8" />,
    title: "Resumen Unificado",
    description:
      "Resumen inteligente que combina los puntos clave con explicaciones detalladas",
    value: "unified",
  },
];

interface FormatSelectorProps {
  onSelect: (selectedFormat: string) => void;
}

const FormatSelector: React.FC<FormatSelectorProps> = ({ onSelect }) => {
  const [selectedFormat, setSelectedFormat] = useState<string>("unified");

  useEffect(() => {
    // Automatically select the unified format
    onSelect("unified");
  }, [onSelect]);

  return (
    <motion.div
      className="grid grid-cols-1 gap-4 w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {formatOptions.map((option) => (
        <motion.div
          key={option.value}
          className={cn(
            "relative p-6 rounded-lg border-2 cursor-pointer transition-colors",
            "bg-card hover:bg-accent",
            selectedFormat === option.value
              ? "border-primary"
              : "border-border hover:border-primary",
          )}
          whileHover={{ scale: 1.02 }}
          onClick={() => {
            setSelectedFormat(option.value);
            onSelect(option.value);
          }}
        >
          <div className="flex items-center gap-4">
            {option.icon}
            <div>
              <h3 className="font-semibold">{option.title}</h3>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default FormatSelector;
