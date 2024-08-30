"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, List, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormatOption {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string;
}

const formatOptions: FormatOption[] = [
  {
    icon: <List className="w-8 h-8" />,
    title: "Puntos clave",
    description: "Resumen en forma de lista de puntos principales",
    value: "bullet-points",
  },
  {
    icon: <FileText className="w-8 h-8" />,
    title: "Párrafo",
    description: "Resumen en formato de párrafo continuo",
    value: "paragraph",
  },
  {
    icon: <Newspaper className="w-8 h-8" />,
    title: "Página",
    description: "Resumen detallado en formato de página",
    value: "page",
  },
];

interface FormatSelectorProps {
  onSelect: (selectedFormat: string) => void;
}

const FormatSelector: React.FC<FormatSelectorProps> = ({ onSelect }) => {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  const handleSelect = (format: string) => {
    setSelectedFormat(format);
    onSelect(format);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Elige el formato de resumen</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {formatOptions.map((option, index) => (
          <motion.div
            key={option.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`bg-card p-6 rounded-full shadow-lg cursor-pointer ${
              selectedFormat === option.value ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleSelect(option.value)}
          >
            <motion.div
              className="mb-4 text-primary flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {option.icon}
            </motion.div>
            <h3 className="text-lg font-semibold mb-2 text-center">{option.title}</h3>
            <p className="text-sm text-muted-foreground text-center">{option.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FormatSelector;