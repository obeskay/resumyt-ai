"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to summarize video");
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("Error summarizing video:", error);
      setSummary(
        "An error occurred while summarizing the video. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-gray-100 dark:to-gray-900 text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* <div className="text-2xl font-bold mb-4">Debug: Page is rendering</div> */}
        <motion.div
          className="flex justify-between items-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold">
            Resum<span className="text-primary">YT</span>
          </h1>
          <div className="flex items-center">
            <span className="mr-2 text-sm">
              {theme === "dark" ? "Dark" : "Light"}
            </span>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={() =>
                setTheme(theme === "dark" ? "light" : "dark")
              }
            />
          </div>
        </motion.div>

        <motion.h2
          className="text-5xl mb-8 text-center w-auto mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="gradient-text font-bold ">Resume gratis</span>
          <br />
          videos de YouTube
        </motion.h2>

        <motion.form
          onSubmit={handleSubmit}
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-grow px-4 py-3 rounded-t-md sm:rounded-l-md sm:rounded-tr-none bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-2 sm:mb-0"
            />
            <button
              type="submit"
              className="bg-primary text-white px-6 py-3 rounded-b-md sm:rounded-r-md sm:rounded-bl-none hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Resumiendo..." : "RESUMIR"}
            </button>
          </div>
        </motion.form>

        <AnimatePresence>
          {summary && (
            <motion.div
              className="bg-card rounded-lg p-6 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold mb-4">Resumen del video:</h3>
              <p>{summary}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="bg-card rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>
                Ahorra tiempo al obtener información relevante de videos de
                YouTube con nuestro servicio de resumen.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>
                Obtén un resumen de los videos de YouTube que te interesen en
                segundos.
              </span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
