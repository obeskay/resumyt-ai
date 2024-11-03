"use client";

import { useRouter } from "next/router";
import { Button } from "./ui/button";
import { i18n } from "@/i18n-config";

const languageNames = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
  ru: "Русский",
  zh: "中文",
};

export default function LanguageSelector() {
  const router = useRouter();
  const currentPath = router.asPath;
  const currentLocale = router.locale || "en";

  const handleLanguageChange = (locale: string) => {
    router.push(currentPath, currentPath, { locale });
  };

  return (
    <div className="flex gap-2">
      {i18n.locales.map((locale) => (
        <Button
          key={locale}
          variant={locale === currentLocale ? "default" : "outline"}
          onClick={() => handleLanguageChange(locale)}
          className="text-sm"
        >
          {languageNames[locale]}
        </Button>
      ))}
    </div>
  );
}
