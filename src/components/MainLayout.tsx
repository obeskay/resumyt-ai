"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { Toaster } from "./ui/toaster";

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
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" passHref>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-4xl font-bold"
              >
                ResumeYT
              </motion.h1>
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
        <main className="relative flex-grow container mx-auto flex flex-col h-full">
          {children}
        </main>
        <Toaster />
      </div>
    </>
  );
}
