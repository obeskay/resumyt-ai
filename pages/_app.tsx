import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import { Space_Grotesk } from "next/font/google";
import "../styles/globals.css";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initSmoothScroll } from "@/lib/smoothScroll";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const lenis = initSmoothScroll();

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
