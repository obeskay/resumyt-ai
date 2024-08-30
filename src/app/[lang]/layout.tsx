import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import ".//globals.css";  // Ajusta esta línea si mueves globals.css a la raíz

const inter = Inter({ subsets: ["latin"] });

export default function LangLayout({
  children,
  params: { lang },
}: {
  children: ReactNode;
  params: { lang: string };
}) {
  return (
    <div lang={lang}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </div>
  );
}

export async function generateStaticParams() {
  return [
    { lang: "en" },
    { lang: "es" },
    { lang: "fr" },
    { lang: "de" },
    { lang: "it" },
    { lang: "pt" },
    { lang: "ru" },
    { lang: "zh" },
  ];
}
