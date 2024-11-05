"use client";
import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Moon, Sun, User } from "lucide-react";
import Link from "next/link";
import { Toaster } from "./ui/toaster";
import YouTubeLogo from "./YouTubeLogo";
import { BackgroundBeams } from "./ui/background-beams";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { i18n } from "@/i18n-config";

interface MainLayoutProps {
  children: ReactNode;
  dict?: any;
}

export default function MainLayout({ children, dict }: MainLayoutProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const locale = pathname?.split("/")[1] || i18n.defaultLocale;

  const validLocale = i18n.locales.includes(locale as any)
    ? locale
    : i18n.defaultLocale;

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
            <Link
              href={`/${validLocale}`}
              className="flex items-center gap-2 mb-2 sm:mb-0"
            >
              <YouTubeLogo />
              <div className="flex items-center cursor-pointer overflow-clip">
                <motion.h1 className="text-2xl sm:text-4xl font-bold">
                  ResumYT
                </motion.h1>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/${validLocale}/profile`}>
                  <User className="h-5 w-5" />
                  <span className="sr-only">
                    {dict?.profile?.title ?? "Profile"}
                  </span>
                </Link>
              </Button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2 rounded-full bg-primary text-primary-foreground"
              >
                {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
              </motion.button>
            </div>
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
