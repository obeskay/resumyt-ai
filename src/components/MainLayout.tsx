"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { Toaster } from "./ui/toaster";
import YouTubeLogo from "./YouTubeLogo";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="py-2">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
            <Link href="/" className="flex items-center gap-2 mb-2 sm:mb-0">
              <YouTubeLogo />
              <div className="flex items-center cursor-pointer overflow-clip">
                <motion.h1 className="text-2xl sm:text-4xl font-bold">ResumeYT</motion.h1>
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
        <main className="relative flex-grow container mx-auto flex flex-col h-full px-4 sm:px-0">
          {children}
        </main>
        <Toaster />
      </div>
    </>
  );
}
