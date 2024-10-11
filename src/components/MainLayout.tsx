"use client";
import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { Toaster } from "./ui/toaster";
import YouTubeLogo from "./YouTubeLogo";
import { BackgroundBeams } from "./ui/background-beams";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen text-foreground flex flex-col">
        <header className="py-2 w-screen z-[10] sticky top-0 bg-background/40 backdrop-blur-md border-b border-px border-border/50">
          <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
            <Link href="/" className="flex items-center gap-2 mb-2 sm:mb-0">
              <YouTubeLogo />
              <div className="flex items-center cursor-pointer overflow-clip">
                <motion.h1 className="text-2xl sm:text-4xl font-bold">
                  ResumYT
                </motion.h1>
              </div>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-full bg-primary text-primary-foreground"
            >
              {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
            </motion.button>
          </div>
        </header>
        <BackgroundBeams />
        <main className="relative flex-grow mx-auto flex flex-col h-full">
          {children}
        </main>
        <Toaster />
      </div>
    </>
  );
}
