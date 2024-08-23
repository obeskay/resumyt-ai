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
      <div className="min-h-screen bg-background text-foreground p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto"
        >
          <header className="flex justify-between items-center mb-12">
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
          </header>

          <main>{children}</main>
        </motion.div>
        <Toaster />
      </div>
    </>
  );
}
