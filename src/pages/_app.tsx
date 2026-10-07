import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import "@/../styles/globals.css";
import { useEffect } from "react";
import { initSmoothScroll } from "@/lib/smoothScroll";

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const lenis = initSmoothScroll();

    return () => {
      lenis?.destroy();
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <MotionConfig reducedMotion="user">
        <Component {...pageProps} />
      </MotionConfig>
    </ThemeProvider>
  );
}

export default MyApp;
