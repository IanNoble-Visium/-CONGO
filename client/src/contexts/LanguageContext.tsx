import React, { createContext, useContext, useEffect, useState } from "react";
import { translations, TranslationKey } from "@/locales/translations";

type Language = "en" | "fr";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

export function LanguageProvider({
  children,
  defaultLanguage = "en",
}: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = sessionStorage.getItem("language");
    return (stored as Language) || defaultLanguage;
  });

  useEffect(() => {
    sessionStorage.setItem("language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === "en" ? "fr" : "en"));
  };

  // Translation function
  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
